using Solanmarket.Domain.Entities;
using Solanmarket.Domain.Interfaces;
using Solanmarket.Infrastructure.Persistence;

namespace Solanmarket.Infrastructure.Persistence.Repositories;

/// <summary>EF Core Unit-of-Work implementation. One instance per HTTP request (Scoped).</summary>
public sealed class UnitOfWork : IUnitOfWork
{
    private readonly SolanmarketDbContext _context;

    public IRepository<Product> Products { get; }
    public IRepository<Category> Categories { get; }
    public IRepository<ProductVariant> ProductVariants { get; }
    public IRepository<ProductImage> ProductImages { get; }
    public IRepository<Order> Orders { get; }
    public IRepository<OrderItem> OrderItems { get; }
    public IRepository<Warehouse> Warehouses { get; }
    public IRepository<WarehouseStock> WarehouseStocks { get; }
    public IRepository<StockTransfer> StockTransfers { get; }
    public IRepository<Supplier> Suppliers { get; }
    public IRepository<PurchaseOrder> PurchaseOrders { get; }
    public IRepository<Discount> Discounts { get; }
    public IRepository<LoyaltyTransaction> LoyaltyTransactions { get; }
    public IRepository<Review> Reviews { get; }
    public IRepository<Notification> Notifications { get; }

    public UnitOfWork(SolanmarketDbContext context)
    {
        _context = context;
        Products = new ProductRepository(context);
        Categories = new Repository<Category>(context);
        ProductVariants = new Repository<ProductVariant>(context);
        ProductImages = new Repository<ProductImage>(context);
        Orders = new Repository<Order>(context);
        OrderItems = new Repository<OrderItem>(context);
        Warehouses = new Repository<Warehouse>(context);
        WarehouseStocks = new Repository<WarehouseStock>(context);
        StockTransfers = new Repository<StockTransfer>(context);
        Suppliers = new Repository<Supplier>(context);
        PurchaseOrders = new Repository<PurchaseOrder>(context);
        Discounts = new Repository<Discount>(context);
        LoyaltyTransactions = new Repository<LoyaltyTransaction>(context);
        Reviews = new Repository<Review>(context);
        Notifications = new Repository<Notification>(context);
    }

    public Task<int> SaveChangesAsync(CancellationToken ct = default)
        => _context.SaveChangesAsync(ct);

    public void Dispose() => _context.Dispose();
}
