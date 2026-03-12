using Solanmarket.Domain.Common;
using Solanmarket.Domain.Enums;

namespace Solanmarket.Domain.Entities;

public class Category : BaseEntity
{
    public string Name { get; set; } = string.Empty;
    public string Slug { get; set; } = string.Empty;
    public string? IconEmoji { get; set; }
    public Guid? ParentId { get; set; }
    public int SortOrder { get; set; } = 0;
    public bool IsActive { get; set; } = true;

    // Self-reference for subcategories
    public Category? Parent { get; set; }
    public ICollection<Category> Children { get; set; } = [];

    // Products
    public ICollection<Product> Products { get; set; } = [];
    public ICollection<Discount> Discounts { get; set; } = [];
    public ICollection<SupplierCategory> SupplierCategories { get; set; } = [];
}

public class Product : BaseEntity
{
    public string Name { get; set; } = string.Empty;
    public string Slug { get; set; } = string.Empty;
    public string? Brand { get; set; }
    public string? Description { get; set; }
    public Guid CategoryId { get; set; }
    public Category Category { get; set; } = null!;

    public decimal Price { get; set; }
    public decimal Cost { get; set; }
    public decimal? OriginalPrice { get; set; }
    public decimal? DiscountPercent { get; set; }

    public ProductStatus Status { get; set; } = ProductStatus.Draft;
    public bool IsPublished { get; set; } = false;
    public bool IsFeatured { get; set; } = false;

    public decimal Rating { get; set; } = 0;
    public int ReviewCount { get; set; } = 0;

    public Guid? SupplierId { get; set; }
    public Supplier? Supplier { get; set; }

    // Navigation
    /// <summary>Stripe Product ID — synced on create/update/delete.</summary>
    public string? StripeProductId { get; set; }

    /// <summary>Active Stripe Price ID. New Price is created on every price change.</summary>
    public string? StripePriceId { get; set; }

    public ICollection<ProductImage> Images { get; set; } = [];
    public ICollection<ProductVariant> Variants { get; set; } = [];
    public ICollection<ProductTag> Tags { get; set; } = [];
    public ICollection<ProductDiscount> ProductDiscounts { get; set; } = [];
    public ICollection<Review> Reviews { get; set; } = [];
    public ICollection<OrderItem> OrderItems { get; set; } = [];
    public ICollection<PurchaseOrderLine> PurchaseOrderLines { get; set; } = [];
}

public class ProductImage : BaseEntity
{
    public Guid ProductId { get; set; }
    public Product Product { get; set; } = null!;
    public string Url { get; set; } = string.Empty;
    /// <summary>Cloudinary public_id — used to delete the image from Cloudinary.</summary>
    public string? CloudinaryPublicId { get; set; }
    public int SortOrder { get; set; } = 0;
    public bool IsMain { get; set; } = false;
    /// <summary>Links this image to a color variant group (hex, e.g. "#FF0000"). Null = shared image for all colors.</summary>
    public string? ColorHex { get; set; }
}

public class ProductVariant : BaseEntity
{
    public Guid ProductId { get; set; }
    public Product Product { get; set; } = null!;

    public string? Size { get; set; }   // XS | S | M | L | XL | 38 | 39 …
    public string? ColorHex { get; set; }
    public string? ColorName { get; set; }
    public string SKU { get; set; } = string.Empty;
    public int Stock { get; set; } = 0;
    public decimal AdditionalPrice { get; set; } = 0;
    public bool IsActive { get; set; } = true;

    // Navigation
    public ICollection<WarehouseStock> WarehouseStocks { get; set; } = [];
    public ICollection<StockTransfer> StockTransfersFrom { get; set; } = [];
    public ICollection<OrderItem> OrderItems { get; set; } = [];
}

public class ProductTag
{
    public Guid ProductId { get; set; }
    public Product Product { get; set; } = null!;
    public string Tag { get; set; } = string.Empty;
}

public class ProductDiscount
{
    public Guid ProductId { get; set; }
    public Product Product { get; set; } = null!;
    public Guid DiscountId { get; set; }
    public Discount Discount { get; set; } = null!;
}
