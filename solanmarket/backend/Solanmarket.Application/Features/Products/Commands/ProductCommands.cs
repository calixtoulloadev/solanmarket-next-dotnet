using MediatR;
using Microsoft.AspNetCore.Http;
using Solanmarket.Application.Common;
using Solanmarket.Application.DTOs.Catalog;
using Solanmarket.Domain.Entities;
using Solanmarket.Domain.Enums;
using Solanmarket.Domain.Interfaces;

namespace Solanmarket.Application.Features.Products.Commands;

// ── Create ────────────────────────────────────────────────────────────────────

public record CreateProductCommand(CreateProductRequest Request) : IRequest<Result<ProductDetailDto>>;

public class CreateProductCommandHandler(
    IRepository<Product> products,
    IRepository<Category> categories,
    IPaymentCatalogService stripeCatalog,
    IUnitOfWork uow)
    : IRequestHandler<CreateProductCommand, Result<ProductDetailDto>>
{
    public async Task<Result<ProductDetailDto>> Handle(CreateProductCommand command, CancellationToken ct)
    {
        var req = command.Request;
        try
        {
            // Validate category
            var category = await categories.GetByIdAsync(req.CategoryId, ct);
            if (category is null)
                return Result<ProductDetailDto>.Failure("Category not found.", 404);

            // Build slug — check ALL records (including soft-deleted) to respect the DB unique index
            var slug = ToSlug(req.Name);
            if (string.IsNullOrEmpty(slug))
                slug = Guid.NewGuid().ToString()[..8];
            if (await products.ExistsAsync(p => p.Slug == slug, ct))
                slug = $"{slug}-{Guid.NewGuid().ToString()[..8]}";

            var product = new Product
            {
                Name = req.Name,
                Slug = slug,
                Brand = req.Brand,
                Description = req.Description,
                CategoryId = req.CategoryId,
                Price = req.Price,
                Cost = req.Cost,
                OriginalPrice = req.OriginalPrice,
                SupplierId = req.SupplierId,
                Status = ProductStatus.Draft,
                IsPublished = req.IsPublished,
            };

            // Build variants with SKU validation
            var variantList = (req.Variants ?? []).ToList();
            var generatedSkus = new HashSet<string>(StringComparer.OrdinalIgnoreCase);

            foreach (var v in variantList)
            {
                // Auto-generate SKU if not provided
                var sku = string.IsNullOrWhiteSpace(v.SKU)
                    ? GenerateSku(slug, v.ColorName, v.Size)
                    : v.SKU.Trim();

                // Ensure uniqueness within this request
                var candidate = sku;
                var suffix = 2;
                while (generatedSkus.Contains(candidate))
                    candidate = $"{sku}-{suffix++}";
                sku = candidate;

                // Check against existing SKUs in DB
                if (await uow.ProductVariants.ExistsAsync(pv => pv.SKU == sku && pv.DeletedAt == null, ct))
                    return Result<ProductDetailDto>.Failure($"SKU '{sku}' is already in use. Please choose a different SKU.", 409);

                generatedSkus.Add(sku);

                product.Variants.Add(new ProductVariant
                {
                    SKU = sku,
                    Size = v.Size,
                    ColorHex = v.ColorHex,
                    ColorName = v.ColorName,
                    Stock = v.Stock,
                    AdditionalPrice = v.AdditionalPrice,
                    IsActive = true,
                });
            }

            // Add tags
            foreach (var tag in req.Tags ?? [])
                product.Tags.Add(new ProductTag { Tag = tag });

            await products.AddAsync(product, ct);
            try
            {
                await uow.SaveChangesAsync(ct);
            }
            catch (Exception ex)
            {
                var msg = ex.InnerException?.Message ?? ex.Message;
                if (msg.Contains("IX_product_variants_SKU") || (msg.Contains("product_variants") && msg.Contains("SKU")))
                    return Result<ProductDetailDto>.Failure("One or more SKUs are already in use. Please use unique SKUs.", 409);
                if (msg.Contains("IX_products_Slug") || (msg.Contains("products") && msg.Contains("slug", StringComparison.OrdinalIgnoreCase)))
                    return Result<ProductDetailDto>.Failure("A product with this name/slug already exists.", 409);
                return Result<ProductDetailDto>.Failure($"Failed to save product: {msg}", 400);
            }

            // Sync to Stripe (fire-and-forget — don't block on failure)
            try
            {
                var stripeProductId = await stripeCatalog.CreateProductAsync(
                    product.Name, product.Description, null, product.Id, ct);
                var stripePriceId = await stripeCatalog.CreatePriceAsync(stripeProductId, product.Price, ct: ct);

                product.StripeProductId = stripeProductId;
                product.StripePriceId = stripePriceId;
                await products.UpdateAsync(product, ct);
                await uow.SaveChangesAsync(ct);
            }
            catch
            {
                // Log in production; do not block product creation for Stripe errors
            }

            return Result<ProductDetailDto>.Success(ToDto(product, category));
        }
        catch (Exception ex)
        {
            var msg = ex.InnerException?.Message ?? ex.Message;
            return Result<ProductDetailDto>.Failure($"Unexpected error creating product: {msg}", 500);
        }
    }

    private static string ToSlug(string name)
        => System.Text.RegularExpressions.Regex
            .Replace(name.ToLowerInvariant(), @"[^a-z0-9]+", "-")
            .Trim('-');

    private static string GenerateSku(string slug, string? colorName, string? size)
    {
        var parts = new[] { slug, colorName?.ToLowerInvariant(), size?.ToLowerInvariant() }
            .Where(p => !string.IsNullOrWhiteSpace(p));
        var raw = string.Join("-", parts);
        return System.Text.RegularExpressions.Regex.Replace(raw, @"[^a-z0-9\-]+", "").Trim('-');
    }

    private static ProductDetailDto ToDto(Product p, Category cat) => new(
        p.Id, p.Name, p.Slug, p.Brand, p.Description, p.CategoryId, cat.Name,
        p.Price, p.Cost, p.OriginalPrice, p.DiscountPercent,
        p.Status.ToString(), p.IsPublished, p.IsFeatured, p.Rating, p.ReviewCount,
        p.SupplierId, null,
        p.Images.Select(i => new ProductImageDto(i.Id, i.Url, i.SortOrder, i.IsMain, i.ColorHex)),
        p.Variants.Select(v => new ProductVariantDto(v.Id, v.Size, v.ColorHex, v.ColorName, v.SKU, v.Stock, v.AdditionalPrice, v.IsActive)),
        p.Tags.Select(t => t.Tag));
}

// ── Update ────────────────────────────────────────────────────────────────────

public record UpdateProductCommand(Guid Id, UpdateProductRequest Request) : IRequest<Result<ProductDetailDto>>;

public class UpdateProductCommandHandler(
    IRepository<Product> products,
    IRepository<Category> categories,
    IPaymentCatalogService stripeCatalog,
    IUnitOfWork uow)
    : IRequestHandler<UpdateProductCommand, Result<ProductDetailDto>>
{
    public async Task<Result<ProductDetailDto>> Handle(UpdateProductCommand command, CancellationToken ct)
    {
        var product = await products.GetByIdAsync(command.Id, ct);
        if (product is null || product.DeletedAt.HasValue)
            return Result<ProductDetailDto>.Failure("Product not found.", 404);

        var category = await categories.GetByIdAsync(command.Request.CategoryId, ct);
        if (category is null)
            return Result<ProductDetailDto>.Failure("Category not found.", 404);

        var req = command.Request;
        var priceChanged = product.Price != req.Price;

        product.Name = req.Name;
        product.Brand = req.Brand;
        product.Description = req.Description;
        product.CategoryId = req.CategoryId;
        product.Price = req.Price;
        product.Cost = req.Cost;
        product.OriginalPrice = req.OriginalPrice;
        product.SupplierId = req.SupplierId;
        product.IsPublished = req.IsPublished;
        product.IsFeatured = req.IsFeatured;
        if (Enum.TryParse<ProductStatus>(req.Status, ignoreCase: true, out var status))
            product.Status = status;

        // Replace tags if provided
        if (req.Tags is not null)
        {
            product.Tags.Clear();
            foreach (var tag in req.Tags.Where(t => !string.IsNullOrWhiteSpace(t)))
                product.Tags.Add(new ProductTag { Tag = tag.Trim() });
        }

        // Replace variants if provided
        List<ProductVariant>? addedVariants = null;
        if (req.Variants is not null)
        {
            var variantList = req.Variants.ToList();
            if (variantList.Count > 0)
            {
                // Soft-delete via the already-tracked collection — avoids double-tracking conflict
                foreach (var ev in product.Variants.Where(v => v.DeletedAt == null).ToList())
                {
                    ev.DeletedAt = DateTime.UtcNow;
                    ev.IsActive = false;
                }

                // Validate + add new variants
                // Use uow.ProductVariants.AddAsync (DbSet.AddAsync) instead of product.Variants.Add,
                // because BaseEntity.Id = Guid.NewGuid() produces a non-sentinel Guid which EF Core 7+
                // may track as Modified (UPDATE) instead of Added (INSERT) when added via navigation.
                var generatedSkus = new HashSet<string>(StringComparer.OrdinalIgnoreCase);
                addedVariants = [];
                foreach (var v in variantList)
                {
                    var sku = string.IsNullOrWhiteSpace(v.SKU)
                        ? GenerateSku(ToSlug(product.Name), v.ColorName, v.Size)
                        : v.SKU.Trim();

                    var candidate = sku;
                    var suffix = 2;
                    while (generatedSkus.Contains(candidate))
                        candidate = $"{sku}-{suffix++}";
                    sku = candidate;

                    // Exclude this product's own variants (soft-deleted above, not yet committed)
                    var productId = product.Id;
                    if (await uow.ProductVariants.ExistsAsync(
                            pv => pv.SKU == sku && pv.DeletedAt == null && pv.ProductId != productId, ct))
                        return Result<ProductDetailDto>.Failure($"SKU '{sku}' is already in use.", 409);

                    generatedSkus.Add(sku);
                    var newVariant = new ProductVariant
                    {
                        ProductId = product.Id,
                        SKU = sku,
                        Size = v.Size,
                        ColorHex = v.ColorHex,
                        ColorName = v.ColorName,
                        Stock = v.Stock,
                        AdditionalPrice = v.AdditionalPrice,
                        IsActive = true,
                    };
                    await uow.ProductVariants.AddAsync(newVariant, ct);
                    addedVariants.Add(newVariant);
                }
            }
        }

        try
        {
            await uow.SaveChangesAsync(ct);
        }
        catch (Exception ex) when (ex.InnerException?.Message.Contains("IX_product_variants_SKU") == true
            || ex.Message.Contains("IX_product_variants_SKU"))
        {
            return Result<ProductDetailDto>.Failure("One or more SKUs are already in use. Please use unique SKUs.", 409);
        }

        // Sync to Stripe
        try
        {
            var mainImage = product.Images.FirstOrDefault(i => i.IsMain)?.Url
                         ?? product.Images.FirstOrDefault()?.Url;

            if (product.StripeProductId is not null)
            {
                await stripeCatalog.UpdateProductAsync(
                    product.StripeProductId, product.Name, product.Description, mainImage, ct);

                if (priceChanged)
                {
                    var newPriceId = await stripeCatalog.CreatePriceAsync(
                        product.StripeProductId, product.Price, ct: ct);
                    product.StripePriceId = newPriceId;
                    await uow.SaveChangesAsync(ct);
                }
            }
            else
            {
                // First time syncing (in case it wasn't synced on create)
                var stripeProductId = await stripeCatalog.CreateProductAsync(
                    product.Name, product.Description, mainImage, product.Id, ct);
                var stripePriceId = await stripeCatalog.CreatePriceAsync(stripeProductId, product.Price, ct: ct);
                product.StripeProductId = stripeProductId;
                product.StripePriceId = stripePriceId;
                await uow.SaveChangesAsync(ct);
            }
        }
        catch { /* Log in production */ }

        return Result<ProductDetailDto>.Success(new(
            product.Id, product.Name, product.Slug, product.Brand, product.Description,
            product.CategoryId, category.Name, product.Price, product.Cost,
            product.OriginalPrice, product.DiscountPercent,
            product.Status.ToString(), product.IsPublished, product.IsFeatured,
            product.Rating, product.ReviewCount, product.SupplierId, null,
            product.Images.Select(i => new ProductImageDto(i.Id, i.Url, i.SortOrder, i.IsMain, i.ColorHex)),
            (addedVariants ?? product.Variants.Where(v => v.IsActive).Cast<ProductVariant>())
                .Select(v => new ProductVariantDto(v.Id, v.Size, v.ColorHex, v.ColorName, v.SKU, v.Stock, v.AdditionalPrice, v.IsActive)),
            product.Tags.Select(t => t.Tag)));
    }

    private static string ToSlug(string name)
        => System.Text.RegularExpressions.Regex
            .Replace(name.ToLowerInvariant(), @"[^a-z0-9]+", "-")
            .Trim('-');

    private static string GenerateSku(string slug, string? colorName, string? size)
    {
        var parts = new[] { slug, colorName?.ToLowerInvariant(), size?.ToLowerInvariant() }
            .Where(p => !string.IsNullOrWhiteSpace(p));
        var raw = string.Join("-", parts);
        return System.Text.RegularExpressions.Regex.Replace(raw, @"[^a-z0-9\-]+", "").Trim('-');
    }
}

// ── Delete ────────────────────────────────────────────────────────────────────

public record DeleteProductCommand(Guid Id) : IRequest<Result>;

public class DeleteProductCommandHandler(
    IRepository<Product> products,
    IImageService imageService,
    IPaymentCatalogService stripeCatalog,
    IUnitOfWork uow)
    : IRequestHandler<DeleteProductCommand, Result>
{
    public async Task<Result> Handle(DeleteProductCommand command, CancellationToken ct)
    {
        var product = await products.GetByIdAsync(command.Id, ct);
        if (product is null || product.DeletedAt.HasValue)
            return Result.Failure("Product not found.", 404);

        // Delete images from Cloudinary
        var productImages = (await uow.ProductImages.FindAsync(i => i.ProductId == command.Id, ct)).ToList();
        var publicIds = productImages
            .Where(i => !string.IsNullOrEmpty(i.CloudinaryPublicId))
            .Select(i => i.CloudinaryPublicId!)
            .ToList();

        if (publicIds.Count > 0)
        {
            try { await imageService.DeleteManyAsync(publicIds, ct); }
            catch { /* Log in production */ }
        }

        // Archive product in Stripe
        if (!string.IsNullOrEmpty(product.StripeProductId))
        {
            try { await stripeCatalog.ArchiveProductAsync(product.StripeProductId, ct); }
            catch { /* Log in production */ }
        }

        // Soft delete
        product.DeletedAt = DateTime.UtcNow;
        await products.UpdateAsync(product, ct);
        await uow.SaveChangesAsync(ct);

        return Result.Success();
    }
}

// ── Upload Images ─────────────────────────────────────────────────────────────

public record UploadProductImagesCommand(Guid ProductId, IFormFileCollection Files, string? ColorHex = null) : IRequest<Result>;

public class UploadProductImagesCommandHandler(
    IRepository<Product> products,
    IImageService imageService,
    IPaymentCatalogService stripeCatalog,
    IUnitOfWork uow)
    : IRequestHandler<UploadProductImagesCommand, Result>
{
    public async Task<Result> Handle(UploadProductImagesCommand command, CancellationToken ct)
    {
        var product = await products.GetByIdAsync(command.ProductId, ct);
        if (product is null || product.DeletedAt.HasValue)
            return Result.Failure("Product not found.", 404);

        if (command.Files is null || command.Files.Count == 0)
            return Result.Failure("No files provided.", 400);

        var existingImages = (await uow.ProductImages.FindAsync(i => i.ProductId == command.ProductId, ct)).ToList();
        var nextSortOrder = existingImages.Count > 0 ? existingImages.Max(i => i.SortOrder) + 1 : 0;

        var newImages = new List<ProductImage>();
        foreach (var file in command.Files)
        {
            if (file.Length == 0) continue;

            string url, publicId;
            try
            {
                await using var stream = file.OpenReadStream();
                (url, publicId) = await imageService.UploadAsync(
                    stream, file.FileName, $"products/{command.ProductId}", ct);
            }
            catch (Exception ex)
            {
                return Result.Failure($"Image upload failed: {ex.Message}", 500);
            }

            var image = new ProductImage
            {
                ProductId = command.ProductId,
                Url = url,
                CloudinaryPublicId = publicId,
                SortOrder = nextSortOrder++,
                IsMain = existingImages.Count == 0 && newImages.Count == 0,
                ColorHex = command.ColorHex,
            };
            await uow.ProductImages.AddAsync(image, ct);
            newImages.Add(image);
        }

        await uow.SaveChangesAsync(ct);

        // If the product is in Stripe, update its image to the main one
        if (!string.IsNullOrEmpty(product.StripeProductId))
        {
            var mainUrl = newImages.FirstOrDefault(i => i.IsMain)?.Url
                       ?? existingImages.FirstOrDefault(i => i.IsMain)?.Url;
            if (mainUrl is not null)
            {
                try
                {
                    await stripeCatalog.UpdateProductAsync(
                        product.StripeProductId, product.Name, product.Description, mainUrl, ct);
                }
                catch { /* Log in production */ }
            }
        }

        return Result.Success();
    }
}

