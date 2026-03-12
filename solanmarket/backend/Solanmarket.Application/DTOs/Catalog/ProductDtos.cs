using Solanmarket.Domain.Enums;

namespace Solanmarket.Application.DTOs.Catalog;

// ── Product DTOs ─────────────────────────────────────────────────────────────

public record ProductListItemDto(
    Guid Id,
    string Name,
    string Slug,
    string? Brand,
    string CategoryName,
    decimal Price,
    decimal? OriginalPrice,
    decimal? DiscountPercent,
    decimal Rating,
    int ReviewCount,
    string? MainImageUrl,
    string Status,
    bool IsPublished,
    bool IsFeatured,
    int TotalStock
);

public record ProductDetailDto(
    Guid Id,
    string Name,
    string Slug,
    string? Brand,
    string? Description,
    Guid CategoryId,
    string CategoryName,
    decimal Price,
    decimal Cost,
    decimal? OriginalPrice,
    decimal? DiscountPercent,
    string Status,
    bool IsPublished,
    bool IsFeatured,
    decimal Rating,
    int ReviewCount,
    Guid? SupplierId,
    string? SupplierName,
    IEnumerable<ProductImageDto> Images,
    IEnumerable<ProductVariantDto> Variants,
    IEnumerable<string> Tags
);

public record ProductImageDto(
    Guid Id,
    string Url,
    int SortOrder,
    bool IsMain,
    string? ColorHex
);

public record ProductVariantDto(
    Guid Id,
    string? Size,
    string? ColorHex,
    string? ColorName,
    string Sku,
    int Stock,
    decimal AdditionalPrice,
    bool IsActive
);

// ── Create / Update ───────────────────────────────────────────────────────────

public record CreateProductRequest(
    string Name,
    string? Brand,
    string? Description,
    Guid CategoryId,
    decimal Price,
    decimal Cost = 0,
    decimal? OriginalPrice = null,
    Guid? SupplierId = null,
    bool IsPublished = false,
    IEnumerable<string>? Tags = null,
    IEnumerable<CreateVariantRequest>? Variants = null
);

public record CreateVariantRequest(
    string? Size,
    string? ColorHex,
    string? ColorName,
    string SKU,
    int Stock,
    decimal AdditionalPrice = 0
);

public record UpdateProductRequest(
    string Name,
    string? Brand,
    string? Description,
    Guid CategoryId,
    decimal Price,
    decimal Cost = 0,
    decimal? OriginalPrice = null,
    string Status = "Active",
    bool IsPublished = false,
    bool IsFeatured = false,
    Guid? SupplierId = null,
    IEnumerable<string>? Tags = null,
    IEnumerable<CreateVariantRequest>? Variants = null
);

// ── Category DTOs ─────────────────────────────────────────────────────────────

public record CategoryDto(
    Guid Id,
    string Name,
    string Slug,
    string? IconEmoji,
    Guid? ParentId,
    int SortOrder,
    IEnumerable<CategoryDto> Children
);

// ── Query filters ─────────────────────────────────────────────────────────────

public record ProductQueryParams(
    Guid? CategoryId = null,
    string? Search = null,
    decimal? MinPrice = null,
    decimal? MaxPrice = null,
    decimal? MinRating = null,
    string? Brand = null,
    string? Status = null,
    bool? IsFeatured = null,
    bool? IsPublished = null,
    string SortBy = "createdAt",   // price | rating | sales | createdAt
    string SortDir = "desc",        // asc | desc
    int Page = 1,
    int PageSize = 20
);
