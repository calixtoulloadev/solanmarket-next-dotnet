using MediatR;
using Solanmarket.Application.Common;
using Solanmarket.Application.DTOs.Orders;
using Solanmarket.Domain.Entities;
using Solanmarket.Domain.Enums;
using Solanmarket.Domain.Interfaces;

namespace Solanmarket.Application.Features.Orders.Commands;

// ══ Create Order ═════════════════════════════════════════════════════════════

public record CreateOrderCommand(Guid UserId, CreateOrderRequest Request) : IRequest<Result<OrderDetailDto>>;

public class CreateOrderCommandHandler : IRequestHandler<CreateOrderCommand, Result<OrderDetailDto>>
{
    private readonly IRepository<Product> _products;
    private readonly IRepository<ProductVariant> _variants;
    private readonly IRepository<Discount> _discounts;
    private readonly IRepository<Order> _orders;
    private readonly IUnitOfWork _uow;

    public CreateOrderCommandHandler(
        IRepository<Product> products,
        IRepository<ProductVariant> variants,
        IRepository<Discount> discounts,
        IRepository<Order> orders,
        IUnitOfWork uow)
    {
        _products = products;
        _variants = variants;
        _discounts = discounts;
        _orders = orders;
        _uow = uow;
    }

    public async Task<Result<OrderDetailDto>> Handle(CreateOrderCommand cmd, CancellationToken ct)
    {
        var req = cmd.Request;
        var lines = new List<OrderItem>();
        decimal sub = 0;

        // ── Build lines and validate stock ───────────────────────────────────
        foreach (var item in req.Items)
        {
            var product = await _products.GetByIdAsync(item.ProductId, ct);
            if (product is null)
                return Result<OrderDetailDto>.Failure($"Product {item.ProductId} not found.");

            ProductVariant? variant = null;
            if (item.VariantId.HasValue)
            {
                variant = await _variants.GetByIdAsync(item.VariantId.Value, ct);
                if (variant is null)
                    return Result<OrderDetailDto>.Failure($"Variant {item.VariantId} not found.");
                if (variant.Stock < item.Quantity)
                    return Result<OrderDetailDto>.Failure($"Insufficient stock for {product.Name} ({variant.Size}/{variant.ColorName}).");
            }

            var unitPrice = product.Price + (variant?.AdditionalPrice ?? 0);
            var lineTotal = unitPrice * item.Quantity;
            sub += lineTotal;

            lines.Add(new OrderItem
            {
                ProductId = item.ProductId,
                VariantId = item.VariantId,
                ProductName = product.Name,
                ProductImage = product.Images.FirstOrDefault(i => i.IsMain)?.Url,
                VariantDetails = variant is not null ? $"{variant.Size} / {variant.ColorName}" : null,
                UnitPrice = unitPrice,
                Quantity = item.Quantity,
                Total = lineTotal
            });
        }

        // ── Validate coupon ──────────────────────────────────────────────────
        decimal discountAmount = 0;
        if (!string.IsNullOrWhiteSpace(req.CouponCode))
        {
            var discount = (await _discounts.FindAsync(
                d => d.Code == req.CouponCode.ToUpper()
                  && d.IsActive
                  && d.StartDate <= DateTime.UtcNow
                  && d.EndDate >= DateTime.UtcNow
                  && (d.UsageLimit == null || d.CurrentUses < d.UsageLimit)
                  && sub >= d.MinOrderAmount,
                ct)).FirstOrDefault();

            if (discount is not null)
            {
                discountAmount = discount.Type switch
                {
                    DiscountType.Percentage => Math.Round(sub * discount.Value / 100, 2),
                    DiscountType.Fixed => Math.Min(discount.Value, sub),
                    DiscountType.FreeShipping => 0,   // applied to shipping below
                    _ => 0
                };

                discount.CurrentUses++;
                await _discounts.UpdateAsync(discount, ct);
            }
        }

        // ── Shipping cost ────────────────────────────────────────────────────
        decimal shippingCost = req.ShippingMethod switch
        {
            "Express" => 15.00m,
            "NextDay" => 25.00m,
            "Pickup" => 0m,
            _ => 5.99m   // Standard
        };

        // ── Tax (8%) ─────────────────────────────────────────────────────────
        decimal taxableAmount = sub - discountAmount;
        decimal taxAmount = Math.Round(taxableAmount * 0.08m, 2);
        decimal total = taxableAmount + shippingCost + taxAmount;

        // ── Create order ─────────────────────────────────────────────────────
        var order = new Order
        {
            UserId = cmd.UserId,
            OrderNumber = GenerateOrderNumber(),
            Status = OrderStatus.Processing,
            SubTotal = sub,
            ShippingCost = shippingCost,
            DiscountAmount = discountAmount,
            TaxAmount = taxAmount,
            Total = total,
            ShippingAddressId = req.ShippingAddressId,
            ShippingMethod = Enum.Parse<ShippingMethod>(req.ShippingMethod),
            PaymentMethodType = Enum.Parse<PaymentType>(req.PaymentMethodType),
            PaymentIntentId = req.PaymentIntentId,
            CouponCode = req.CouponCode,
            Notes = req.Notes,
            Items = lines
        };

        // Initial tracking event
        order.Tracking.Add(new OrderTracking
        {
            Status = "Order Placed",
            Description = "Your order has been placed and is being processed.",
            Timestamp = DateTime.UtcNow
        });

        await _orders.AddAsync(order, ct);

        // ── Decrement stock ──────────────────────────────────────────────────
        foreach (var item in req.Items.Where(i => i.VariantId.HasValue))
        {
            var variant = await _variants.GetByIdAsync(item.VariantId!.Value, ct);
            if (variant is not null)
            {
                variant.Stock -= item.Quantity;
                await _variants.UpdateAsync(variant, ct);
            }
        }

        await _uow.SaveChangesAsync(ct);

        // Return simplified detail (full mapping omitted for brevity)
        return Result<OrderDetailDto>.Success(new OrderDetailDto(
            order.Id, order.OrderNumber, order.Status.ToString(),
            order.SubTotal, order.ShippingCost, order.DiscountAmount,
            order.TaxAmount, order.Total,
            order.ShippingMethod.ToString(), order.PaymentMethodType.ToString(),
            order.CouponCode,
            null,  // ShippingAddress snapshot mapped separately
            lines.Select(l => new OrderItemDto(
                l.Id, l.ProductId, l.ProductName, l.ProductImage, l.VariantDetails,
                l.UnitPrice, l.Quantity, l.Total)),
            order.Tracking.Select(t => new OrderTrackingDto(t.Status, t.Description, t.Location, t.Timestamp)),
            order.CreatedAt, null, null
        ));
    }

    private static string GenerateOrderNumber()
        => $"ORD-{DateTime.UtcNow:yyyy}-{Random.Shared.Next(10000, 99999)}";
}
