using Solanmarket.Domain.Common;
using Solanmarket.Domain.Enums;

namespace Solanmarket.Domain.Entities;

public class Supplier : BaseEntity
{
    public string Name { get; set; } = string.Empty;
    public string? ContactPerson { get; set; }
    public string? Email { get; set; }
    public string? Phone { get; set; }
    public string? Country { get; set; }
    public string? City { get; set; }
    public string? TaxId { get; set; }   // NIF / RUC / EIN
    public int PaymentTermsDays { get; set; } = 30;
    public string? Notes { get; set; }
    public SupplierStatus Status { get; set; } = SupplierStatus.Active;
    public int TotalOrders { get; set; } = 0;
    public decimal TotalSpent { get; set; } = 0;

    // Navigation
    public ICollection<SupplierCategory> SupplierCategories { get; set; } = [];
    public ICollection<PurchaseOrder> PurchaseOrders { get; set; } = [];
    public ICollection<Product> Products { get; set; } = [];
    public ICollection<CreditNote> CreditNotes { get; set; } = [];
}

public class SupplierCategory
{
    public Guid SupplierId { get; set; }
    public Supplier Supplier { get; set; } = null!;

    public Guid CategoryId { get; set; }
    public Category Category { get; set; } = null!;
}

public class PurchaseOrder : BaseEntity
{
    /// <summary>Human-readable number, e.g. OC-2026-00001</summary>
    public string PONumber { get; set; } = string.Empty;

    public Guid SupplierId { get; set; }
    public Supplier Supplier { get; set; } = null!;

    public Guid WarehouseId { get; set; }
    public Warehouse Warehouse { get; set; } = null!;

    public PurchaseOrderStatus Status { get; set; } = PurchaseOrderStatus.Draft;

    public decimal Total { get; set; }
    public DateTime OrderDate { get; set; } = DateTime.UtcNow;
    public DateTime? DueDate { get; set; }
    public DateTime? ReceivedDate { get; set; }

    public string? PaymentMethod { get; set; }  // Transfer | Card | Cash
    public string? Notes { get; set; }

    public Guid? CreatedByUserId { get; set; }
    public ApplicationUser? CreatedBy { get; set; }

    // Navigation
    public ICollection<PurchaseOrderLine> Lines { get; set; } = [];
}

public class PurchaseOrderLine : BaseEntity
{
    public Guid PurchaseOrderId { get; set; }
    public PurchaseOrder PurchaseOrder { get; set; } = null!;

    public Guid ProductId { get; set; }
    public Product Product { get; set; } = null!;

    /// <summary>Snapshot of product name at time of order</summary>
    public string ProductName { get; set; } = string.Empty;
    public int Quantity { get; set; }
    public decimal UnitCost { get; set; }
    public decimal Total { get; set; }
}

public class CreditNote : BaseEntity
{
    /// <summary>Human-readable number, e.g. CN-2026-00001</summary>
    public string CNNumber { get; set; } = string.Empty;

    public CreditNoteType Type { get; set; }

    public Guid? SupplierId { get; set; }
    public Supplier? Supplier { get; set; }

    public Guid? OrderId { get; set; }
    public Order? Order { get; set; }

    /// <summary>Snapshot of entity name</summary>
    public string EntityName { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public string Reason { get; set; } = string.Empty;
    public string? Description { get; set; }
    public CreditNoteStatus Status { get; set; } = CreditNoteStatus.Pending;
    public DateTime Date { get; set; } = DateTime.UtcNow;
}
