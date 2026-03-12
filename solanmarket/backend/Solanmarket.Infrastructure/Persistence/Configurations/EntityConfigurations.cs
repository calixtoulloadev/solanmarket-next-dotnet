using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Solanmarket.Domain.Entities;
using Solanmarket.Domain.Enums;

namespace Solanmarket.Infrastructure.Persistence.Configurations;

// ══ Products ═══════════════════════════════════════════════════════════════

public class ProductConfiguration : IEntityTypeConfiguration<Product>
{
    public void Configure(EntityTypeBuilder<Product> b)
    {
        b.ToTable("products");
        b.HasKey(x => x.Id);

        b.Property(x => x.Name).HasMaxLength(255).IsRequired();
        b.Property(x => x.Slug).HasMaxLength(255).IsRequired();
        b.HasIndex(x => x.Slug).IsUnique();

        b.Property(x => x.Brand).HasMaxLength(120);
        b.Property(x => x.Price).HasColumnType("decimal(18,2)").IsRequired();
        b.Property(x => x.Cost).HasColumnType("decimal(18,2)");
        b.Property(x => x.OriginalPrice).HasColumnType("decimal(18,2)");
        b.Property(x => x.DiscountPercent).HasColumnType("decimal(5,2)");
        b.Property(x => x.Rating).HasColumnType("decimal(3,2)");

        b.Property(x => x.Status)
            .HasConversion<string>()
            .HasMaxLength(20);

        b.HasIndex(x => x.CategoryId);
        b.HasIndex(x => x.SupplierId);
        b.HasIndex(x => x.IsPublished);
        b.HasIndex(x => x.IsFeatured);

        b.HasOne(x => x.Category)
            .WithMany(c => c.Products)
            .HasForeignKey(x => x.CategoryId)
            .OnDelete(DeleteBehavior.Restrict);

        b.HasOne(x => x.Supplier)
            .WithMany(s => s.Products)
            .HasForeignKey(x => x.SupplierId)
            .OnDelete(DeleteBehavior.SetNull);
    }
}

public class CategoryConfiguration : IEntityTypeConfiguration<Category>
{
    public void Configure(EntityTypeBuilder<Category> b)
    {
        b.ToTable("categories");
        b.HasKey(x => x.Id);
        b.Property(x => x.Name).HasMaxLength(120).IsRequired();
        b.Property(x => x.Slug).HasMaxLength(120).IsRequired();
        b.HasIndex(x => x.Slug).IsUnique();

        b.HasOne(x => x.Parent)
            .WithMany(c => c.Children)
            .HasForeignKey(x => x.ParentId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}

public class ProductVariantConfiguration : IEntityTypeConfiguration<ProductVariant>
{
    public void Configure(EntityTypeBuilder<ProductVariant> b)
    {
        b.ToTable("product_variants");
        b.HasKey(x => x.Id);
        b.Property(x => x.SKU).HasMaxLength(100).IsRequired();
        b.HasIndex(x => x.SKU).IsUnique();
        b.Property(x => x.AdditionalPrice).HasColumnType("decimal(18,2)");

        b.HasOne(x => x.Product)
            .WithMany(p => p.Variants)
            .HasForeignKey(x => x.ProductId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}

public class ProductImageConfiguration : IEntityTypeConfiguration<ProductImage>
{
    public void Configure(EntityTypeBuilder<ProductImage> b)
    {
        b.ToTable("product_images");
        b.HasKey(x => x.Id);
        b.Property(x => x.ColorHex).HasMaxLength(7);

        b.HasOne(x => x.Product)
            .WithMany(p => p.Images)
            .HasForeignKey(x => x.ProductId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}

public class ProductTagConfiguration : IEntityTypeConfiguration<ProductTag>
{
    public void Configure(EntityTypeBuilder<ProductTag> b)
    {
        b.ToTable("product_tags");
        b.HasKey(x => new { x.ProductId, x.Tag });
        b.Property(x => x.Tag).HasMaxLength(60);
    }
}

public class ProductDiscountConfiguration : IEntityTypeConfiguration<ProductDiscount>
{
    public void Configure(EntityTypeBuilder<ProductDiscount> b)
    {
        b.ToTable("product_discounts");
        b.HasKey(x => new { x.ProductId, x.DiscountId });
    }
}

// ══ Orders ══════════════════════════════════════════════════════════════════

public class OrderConfiguration : IEntityTypeConfiguration<Order>
{
    public void Configure(EntityTypeBuilder<Order> b)
    {
        b.ToTable("orders");
        b.HasKey(x => x.Id);
        b.Property(x => x.OrderNumber).HasMaxLength(30).IsRequired();
        b.HasIndex(x => x.OrderNumber).IsUnique();
        b.HasIndex(x => x.UserId);
        b.HasIndex(x => x.Status);

        b.Property(x => x.SubTotal).HasColumnType("decimal(18,2)");
        b.Property(x => x.ShippingCost).HasColumnType("decimal(18,2)");
        b.Property(x => x.DiscountAmount).HasColumnType("decimal(18,2)");
        b.Property(x => x.TaxAmount).HasColumnType("decimal(18,2)");
        b.Property(x => x.Total).HasColumnType("decimal(18,2)");

        b.Property(x => x.Status).HasConversion<string>().HasMaxLength(20);
        b.Property(x => x.ShippingMethod).HasConversion<string>().HasMaxLength(20);
        b.Property(x => x.PaymentMethodType).HasConversion<string>().HasMaxLength(20);
    }
}

public class OrderItemConfiguration : IEntityTypeConfiguration<OrderItem>
{
    public void Configure(EntityTypeBuilder<OrderItem> b)
    {
        b.ToTable("order_items");
        b.HasKey(x => x.Id);
        b.Property(x => x.UnitPrice).HasColumnType("decimal(18,2)");
        b.Property(x => x.Total).HasColumnType("decimal(18,2)");

        b.HasOne(x => x.Order)
            .WithMany(o => o.Items)
            .HasForeignKey(x => x.OrderId)
            .OnDelete(DeleteBehavior.Cascade);

        b.HasOne(x => x.Variant)
            .WithMany(v => v.OrderItems)
            .HasForeignKey(x => x.VariantId)
            .OnDelete(DeleteBehavior.SetNull);
    }
}

// ══ Inventory ═══════════════════════════════════════════════════════════════

public class WarehouseStockConfiguration : IEntityTypeConfiguration<WarehouseStock>
{
    public void Configure(EntityTypeBuilder<WarehouseStock> b)
    {
        b.ToTable("warehouse_stocks");
        b.HasKey(x => x.Id);
        b.HasIndex(x => new { x.WarehouseId, x.ProductVariantId }).IsUnique();

        b.HasOne(x => x.Warehouse)
            .WithMany(w => w.Stocks)
            .HasForeignKey(x => x.WarehouseId)
            .OnDelete(DeleteBehavior.Cascade);

        b.HasOne(x => x.ProductVariant)
            .WithMany(v => v.WarehouseStocks)
            .HasForeignKey(x => x.ProductVariantId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}

public class StockTransferConfiguration : IEntityTypeConfiguration<StockTransfer>
{
    public void Configure(EntityTypeBuilder<StockTransfer> b)
    {
        b.ToTable("stock_transfers");
        b.HasKey(x => x.Id);
        b.Property(x => x.Status).HasConversion<string>().HasMaxLength(20);

        b.HasOne(x => x.FromWarehouse)
            .WithMany(w => w.OutgoingTransfers)
            .HasForeignKey(x => x.FromWarehouseId)
            .OnDelete(DeleteBehavior.Restrict);

        b.HasOne(x => x.ToWarehouse)
            .WithMany(w => w.IncomingTransfers)
            .HasForeignKey(x => x.ToWarehouseId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}

// ══ Discounts ════════════════════════════════════════════════════════════════

public class DiscountConfiguration : IEntityTypeConfiguration<Discount>
{
    public void Configure(EntityTypeBuilder<Discount> b)
    {
        b.ToTable("discounts");
        b.HasKey(x => x.Id);
        b.Property(x => x.Code).HasMaxLength(50).IsRequired();
        b.HasIndex(x => x.Code).IsUnique();
        b.Property(x => x.Value).HasColumnType("decimal(18,2)");
        b.Property(x => x.MinOrderAmount).HasColumnType("decimal(18,2)");
        b.Property(x => x.Type).HasConversion<string>().HasMaxLength(20);
    }
}

// ══ Procurement ══════════════════════════════════════════════════════════════

public class PurchaseOrderConfiguration : IEntityTypeConfiguration<PurchaseOrder>
{
    public void Configure(EntityTypeBuilder<PurchaseOrder> b)
    {
        b.ToTable("purchase_orders");
        b.HasKey(x => x.Id);
        b.Property(x => x.PONumber).HasMaxLength(30).IsRequired();
        b.HasIndex(x => x.PONumber).IsUnique();
        b.Property(x => x.Total).HasColumnType("decimal(18,2)");
        b.Property(x => x.Status).HasConversion<string>().HasMaxLength(20);
    }
}

public class PurchaseOrderLineConfiguration : IEntityTypeConfiguration<PurchaseOrderLine>
{
    public void Configure(EntityTypeBuilder<PurchaseOrderLine> b)
    {
        b.ToTable("purchase_order_lines");
        b.HasKey(x => x.Id);
        b.Property(x => x.UnitCost).HasColumnType("decimal(18,2)");
        b.Property(x => x.Total).HasColumnType("decimal(18,2)");
    }
}

public class CreditNoteConfiguration : IEntityTypeConfiguration<CreditNote>
{
    public void Configure(EntityTypeBuilder<CreditNote> b)
    {
        b.ToTable("credit_notes");
        b.HasKey(x => x.Id);
        b.Property(x => x.CNNumber).HasMaxLength(30).IsRequired();
        b.HasIndex(x => x.CNNumber).IsUnique();
        b.Property(x => x.Amount).HasColumnType("decimal(18,2)");
        b.Property(x => x.Type).HasConversion<string>().HasMaxLength(20);
        b.Property(x => x.Status).HasConversion<string>().HasMaxLength(20);
    }
}

public class SupplierCategoryConfiguration : IEntityTypeConfiguration<SupplierCategory>
{
    public void Configure(EntityTypeBuilder<SupplierCategory> b)
    {
        b.ToTable("supplier_categories");
        b.HasKey(x => new { x.SupplierId, x.CategoryId });
    }
}

// ══ Loyalty ═══════════════════════════════════════════════════════════════

public class LoyaltyTransactionConfiguration : IEntityTypeConfiguration<LoyaltyTransaction>
{
    public void Configure(EntityTypeBuilder<LoyaltyTransaction> b)
    {
        b.ToTable("loyalty_transactions");
        b.HasKey(x => x.Id);
        b.Property(x => x.Type).HasConversion<string>().HasMaxLength(25);
    }
}

public class LoyaltyRedemptionConfiguration : IEntityTypeConfiguration<LoyaltyRedemption>
{
    public void Configure(EntityTypeBuilder<LoyaltyRedemption> b)
    {
        b.ToTable("loyalty_redemptions");
        b.HasKey(x => x.Id);
        b.Property(x => x.Status).HasConversion<string>().HasMaxLength(20);
    }
}

// ══ Wishlist ═════════════════════════════════════════════════════════════

public class WishlistItemConfiguration : IEntityTypeConfiguration<WishlistItem>
{
    public void Configure(EntityTypeBuilder<WishlistItem> b)
    {
        b.ToTable("wishlist_items");
        b.HasKey(x => x.Id);
        b.HasIndex(x => new { x.UserId, x.ProductId }).IsUnique();
        b.HasIndex(x => x.UserId);

        b.HasOne(x => x.User)
            .WithMany()
            .HasForeignKey(x => x.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        b.HasOne(x => x.Product)
            .WithMany()
            .HasForeignKey(x => x.ProductId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}

// ══ Social ════════════════════════════════════════════════════════════════

public class ReviewConfiguration : IEntityTypeConfiguration<Review>
{
    public void Configure(EntityTypeBuilder<Review> b)
    {
        b.ToTable("reviews");
        b.HasKey(x => x.Id);
        b.HasIndex(x => new { x.UserId, x.ProductId, x.OrderId }).IsUnique();
    }
}

public class NotificationConfiguration : IEntityTypeConfiguration<Notification>
{
    public void Configure(EntityTypeBuilder<Notification> b)
    {
        b.ToTable("notifications");
        b.HasKey(x => x.Id);
        b.HasIndex(x => x.UserId);
        b.HasIndex(x => new { x.UserId, x.IsRead });

        b.Property(x => x.Type).HasConversion<string>().HasMaxLength(20);
        // JSONB column for extra metadata
        b.Property(x => x.Data).HasColumnType("jsonb");
    }
}
