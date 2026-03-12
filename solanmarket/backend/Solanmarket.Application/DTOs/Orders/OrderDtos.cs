using Solanmarket.Domain.Enums;

namespace Solanmarket.Application.DTOs.Orders;

// ── Order DTOs ────────────────────────────────────────────────────────────────

public record OrderSummaryDto(
    Guid Id,
    string OrderNumber,
    string Status,
    decimal Total,
    int ItemCount,
    string? FirstItemImage,
    DateTime CreatedAt
);

public record OrderDetailDto(
    Guid Id,
    string OrderNumber,
    string Status,
    decimal SubTotal,
    decimal ShippingCost,
    decimal DiscountAmount,
    decimal TaxAmount,
    decimal Total,
    string ShippingMethod,
    string PaymentMethodType,
    string? CouponCode,
    AddressSnapshotDto? ShippingAddress,
    IEnumerable<OrderItemDto> Items,
    IEnumerable<OrderTrackingDto> Tracking,
    DateTime CreatedAt,
    DateTime? ShippedAt,
    DateTime? DeliveredAt
);

public record OrderItemDto(
    Guid Id,
    Guid ProductId,
    string ProductName,
    string? ProductImage,
    string? VariantDetails,
    decimal UnitPrice,
    int Quantity,
    decimal Total
);

public record OrderTrackingDto(
    string Status,
    string? Description,
    string? Location,
    DateTime Timestamp
);

public record AddressSnapshotDto(
    string Street,
    string City,
    string? State,
    string? ZipCode,
    string Country
);

// ── Checkout ─────────────────────────────────────────────────────────────────

public record CreateOrderRequest(
    Guid ShippingAddressId,
    string ShippingMethod,     // Standard | Express | NextDay | Pickup
    string PaymentMethodType,  // Card | PayPal | ApplePay | GooglePay
    string? PaymentIntentId,   // Stripe Payment Intent ID
    string? CouponCode,
    string? Notes,
    IEnumerable<CartItemRequest> Items
);

public record CartItemRequest(
    Guid ProductId,
    Guid? VariantId,
    int Quantity
);

public record CheckoutTotalsDto(
    IEnumerable<CartLineDto> Lines,
    decimal SubTotal,
    decimal ShippingCost,
    decimal DiscountAmount,
    string? DiscountDescription,
    decimal TaxAmount,
    decimal Total
);

public record CartLineDto(
    Guid ProductId,
    Guid? VariantId,
    string ProductName,
    string? VariantDetails,
    string? ImageUrl,
    decimal UnitPrice,
    int Quantity,
    decimal LineTotal
);

public record ValidateCouponRequest(string Code, decimal OrderSubtotal);
public record ValidateCouponResponse(bool IsValid, string? Error, decimal DiscountAmount, string? Description);
