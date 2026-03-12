using MediatR;
using Solanmarket.Application.Common;
using Solanmarket.Application.DTOs.Catalog;
using Solanmarket.Domain.Entities;
using Solanmarket.Domain.Enums;
using Solanmarket.Domain.Interfaces;

namespace Solanmarket.Application.Features.Products.Queries;

// ══ Get Products (paginated list) ════════════════════════════════════════════

public record GetProductsQuery(ProductQueryParams Params) : IRequest<Result<PagedResult<ProductListItemDto>>>;

public class GetProductsQueryHandler : IRequestHandler<GetProductsQuery, Result<PagedResult<ProductListItemDto>>>
{
    private readonly IRepository<Product> _products;

    public GetProductsQueryHandler(IRepository<Product> products)
        => _products = products;

    public async Task<Result<PagedResult<ProductListItemDto>>> Handle(GetProductsQuery req, CancellationToken ct)
    {
        var p = req.Params;

        var items = (await _products.FindAsync(
            x => x.DeletedAt == null
              && (p.CategoryId == null || x.CategoryId == p.CategoryId)
              && (p.IsPublished == null || x.IsPublished == p.IsPublished)
              && (p.IsFeatured == null || x.IsFeatured == p.IsFeatured)
              && (p.MinPrice == null || x.Price >= p.MinPrice)
              && (p.MaxPrice == null || x.Price <= p.MaxPrice)
              && (p.MinRating == null || x.Rating >= p.MinRating)
              && (p.Brand == null || (x.Brand != null && x.Brand.ToLower().Contains(p.Brand.ToLower())))
              && (p.Search == null ||
                  x.Name.ToLower().Contains(p.Search.ToLower()) ||
                  (x.Brand != null && x.Brand.ToLower().Contains(p.Search.ToLower()))),
            ct)).ToList();

        var total = items.Count;

        // Sorting
        items = (p.SortBy, p.SortDir.ToLower()) switch
        {
            ("price", "asc") => items.OrderBy(x => x.Price).ToList(),
            ("price", _) => items.OrderByDescending(x => x.Price).ToList(),
            ("rating", _) => items.OrderByDescending(x => x.Rating).ToList(),
            _ => items.OrderByDescending(x => x.CreatedAt).ToList()
        };

        // Pagination
        var paged = items
            .Skip((p.Page - 1) * p.PageSize)
            .Take(p.PageSize)
            .Select(x => new ProductListItemDto(
                x.Id,
                x.Name,
                x.Slug,
                x.Brand,
                x.Category?.Name ?? string.Empty,
                x.Price,
                x.OriginalPrice,
                x.DiscountPercent,
                x.Rating,
                x.ReviewCount,
                x.Images.FirstOrDefault(i => i.IsMain)?.Url ?? x.Images.FirstOrDefault()?.Url,
                x.Status.ToString(),
                x.IsPublished,
                x.IsFeatured,
                x.Variants.Sum(v => v.Stock)
            ));

        return Result<PagedResult<ProductListItemDto>>.Success(
            new PagedResult<ProductListItemDto>(paged, total, p.Page, p.PageSize));
    }
}

// ══ Get Product by Slug ══════════════════════════════════════════════════════

public record GetProductBySlugQuery(string Slug) : IRequest<Result<ProductDetailDto>>;

public class GetProductBySlugQueryHandler : IRequestHandler<GetProductBySlugQuery, Result<ProductDetailDto>>
{
    private readonly IRepository<Product> _products;

    public GetProductBySlugQueryHandler(IRepository<Product> products)
        => _products = products;

    public async Task<Result<ProductDetailDto>> Handle(GetProductBySlugQuery req, CancellationToken ct)
    {
        var product = (await _products.FindAsync(
            x => x.Slug == req.Slug && x.DeletedAt == null, ct)).FirstOrDefault();

        if (product is null)
            return Result<ProductDetailDto>.Failure("Product not found.");

        return ProductQueryMapper.MapToDetail(product);
    }
}

internal static class ProductQueryMapper
{
    public static Result<ProductDetailDto> MapToDetail(Product p)
        => Result<ProductDetailDto>.Success(new ProductDetailDto(
            p.Id, p.Name, p.Slug, p.Brand, p.Description,
            p.CategoryId, p.Category?.Name ?? string.Empty,
            p.Price, p.Cost, p.OriginalPrice, p.DiscountPercent,
            p.Status.ToString(), p.IsPublished, p.IsFeatured,
            p.Rating, p.ReviewCount,
            p.SupplierId, p.Supplier?.Name,
            p.Images.OrderBy(i => i.SortOrder)
                    .Select(i => new ProductImageDto(i.Id, i.Url, i.SortOrder, i.IsMain, i.ColorHex)),
            p.Variants.Where(v => v.IsActive && !v.DeletedAt.HasValue)
                      .Select(v => new ProductVariantDto(
                          v.Id, v.Size, v.ColorHex, v.ColorName,
                          v.SKU, v.Stock, v.AdditionalPrice, v.IsActive)),
            p.Tags.Select(t => t.Tag)
        ));
}


// ══ Get Product by Id (GUID) ─────────────────────────────────────────────────

public record GetProductByIdQuery(Guid Id) : IRequest<Result<ProductDetailDto>>;

public class GetProductByIdQueryHandler : IRequestHandler<GetProductByIdQuery, Result<ProductDetailDto>>
{
    private readonly IRepository<Product> _products;

    public GetProductByIdQueryHandler(IRepository<Product> products)
        => _products = products;

    public async Task<Result<ProductDetailDto>> Handle(GetProductByIdQuery req, CancellationToken ct)
    {
        var product = (await _products.FindAsync(
            x => x.Id == req.Id && x.DeletedAt == null, ct)).FirstOrDefault();

        if (product is null)
            return Result<ProductDetailDto>.Failure("Product not found.");

        return ProductQueryMapper.MapToDetail(product);
    }
}
