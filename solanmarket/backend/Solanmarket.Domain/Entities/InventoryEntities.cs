using Solanmarket.Domain.Common;
using Solanmarket.Domain.Enums;

namespace Solanmarket.Domain.Entities;

public class Warehouse : BaseEntity
{
    public string Name { get; set; } = string.Empty;
    public string City { get; set; } = string.Empty;
    public string Country { get; set; } = string.Empty;
    public string? Flag { get; set; }   // emoji flag
    public bool IsActive { get; set; } = true;
    public int Capacity { get; set; }   // max units
    public string? Color { get; set; }   // hex color for UI

    // Navigation
    public ICollection<WarehouseStock> Stocks { get; set; } = [];
    public ICollection<StockTransfer> OutgoingTransfers { get; set; } = [];
    public ICollection<StockTransfer> IncomingTransfers { get; set; } = [];
    public ICollection<PurchaseOrder> PurchaseOrders { get; set; } = [];
}

public class WarehouseStock : BaseEntity
{
    public Guid WarehouseId { get; set; }
    public Warehouse Warehouse { get; set; } = null!;

    public Guid ProductVariantId { get; set; }
    public ProductVariant ProductVariant { get; set; } = null!;

    public int Quantity { get; set; } = 0;
    public int MinStockAlert { get; set; } = 5;
    public DateTime? LastRestocked { get; set; }
}

public class StockTransfer : BaseEntity
{
    public Guid ProductVariantId { get; set; }
    public ProductVariant ProductVariant { get; set; } = null!;

    public Guid FromWarehouseId { get; set; }
    public Warehouse FromWarehouse { get; set; } = null!;

    public Guid ToWarehouseId { get; set; }
    public Warehouse ToWarehouse { get; set; } = null!;

    public int Quantity { get; set; }
    public TransferStatus Status { get; set; } = TransferStatus.Pending;
    public string? Notes { get; set; }

    public DateTime? ETA { get; set; }
    public DateTime? CompletedAt { get; set; }

    public Guid? CreatedByUserId { get; set; }
    public ApplicationUser? CreatedBy { get; set; }
}
