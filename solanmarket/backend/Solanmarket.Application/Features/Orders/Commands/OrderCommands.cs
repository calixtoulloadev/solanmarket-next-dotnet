using MediatR;
using Solanmarket.Application.Common;
using Solanmarket.Application.DTOs.Orders;
using Solanmarket.Domain.Enums;

namespace Solanmarket.Application.Features.Orders.Commands;

// ── Cancel ────────────────────────────────────────────────────────────────────

public record CancelOrderCommand(Guid OrderId) : IRequest<Result>;

public class CancelOrderCommandHandler : IRequestHandler<CancelOrderCommand, Result>
{
    public Task<Result> Handle(CancelOrderCommand request, CancellationToken ct)
        => Task.FromResult(Result.Failure("Not implemented yet.", 501));
}

// ── Preview Checkout ─────────────────────────────────────────────────────────

public record PreviewCheckoutCommand(CreateOrderRequest Request) : IRequest<Result<CheckoutTotalsDto>>;

public class PreviewCheckoutCommandHandler : IRequestHandler<PreviewCheckoutCommand, Result<CheckoutTotalsDto>>
{
    public Task<Result<CheckoutTotalsDto>> Handle(PreviewCheckoutCommand request, CancellationToken ct)
        => Task.FromResult(Result<CheckoutTotalsDto>.Failure("Not implemented yet.", 501));
}

// ── Update Order Status (admin) ───────────────────────────────────────────────

public record UpdateOrderStatusCommand(Guid OrderId, string Status, string? TrackingNumber) : IRequest<Result>;

public class UpdateOrderStatusCommandHandler : IRequestHandler<UpdateOrderStatusCommand, Result>
{
    public Task<Result> Handle(UpdateOrderStatusCommand request, CancellationToken ct)
        => Task.FromResult(Result.Failure("Not implemented yet.", 501));
}
