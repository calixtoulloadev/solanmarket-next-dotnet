using Solanmarket.Domain.Common;
using Solanmarket.Domain.Enums;

namespace Solanmarket.Domain.Entities;

public class Order : BaseEntity
{
    public Guid UserId { get; set; }
    public ApplicationUser User { get; set; } = null!;

    /// <summary>Human-readable order number, e.g. ORD-2026-00001</summary>
    public string OrderNumber { get; set; } = string.Empty;

    public OrderStatus Status { get; set; } = OrderStatus.Processing;

    public decimal SubTotal { get; set; }
    public decimal ShippingCost { get; set; } = 0;
    public decimal DiscountAmount { get; set; } = 0;
    public decimal TaxAmount { get; set; } = 0;
    public decimal Total { get; set; }

    public Guid? ShippingAddressId { get; set; }
    public Address? ShippingAddress { get; set; }

    public ShippingMethod ShippingMethod { get; set; } = ShippingMethod.Standard;
    public PaymentType PaymentMethodType { get; set; } = PaymentType.Card;

    /// <summary>Stripe PaymentIntent ID</summary>
    public string? PaymentIntentId { get; set; }

    public string? CouponCode { get; set; }
    public string? Notes { get; set; }

    public DateTime? ShippedAt { get; set; }
    public DateTime? DeliveredAt { get; set; }
    public DateTime? CancelledAt { get; set; }

    // Navigation
    public ICollection<OrderItem> Items { get; set; } = [];
    public ICollection<OrderTracking> Tracking { get; set; } = [];
    public ICollection<LoyaltyTransaction> LoyaltyTransactions { get; set; } = [];
    public ICollection<CreditNote> CreditNotes { get; set; } = [];
    public ICollection<SupportTicket> SupportTickets { get; set; } = [];
}

public class OrderItem : BaseEntity
{
    public Guid OrderId { get; set; }
    public Order Order { get; set; } = null!;

    public Guid ProductId { get; set; }
    public Product Product { get; set; } = null!;

    public Guid? VariantId { get; set; }
    public ProductVariant? Variant { get; set; }

    /// <summary>Snapshot of product name at time of purchase</summary>
    public string ProductName { get; set; } = string.Empty;
    public string? ProductImage { get; set; }

    /// <summary>Snapshot of variant (e.g. "M / Negro")</summary>
    public string? VariantDetails { get; set; }

    public decimal UnitPrice { get; set; }
    public int Quantity { get; set; }
    public decimal Total { get; set; }
}

public class OrderTracking : BaseEntity
{
    public Guid OrderId { get; set; }
    public Order Order { get; set; } = null!;

    public string Status { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? Location { get; set; }
    public DateTime Timestamp { get; set; } = DateTime.UtcNow;
}
