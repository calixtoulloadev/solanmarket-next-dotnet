using MediatR;
using Solanmarket.Application.Common;
using Solanmarket.Application.Features.Inventory.Queries;

namespace Solanmarket.Application.Features.Inventory.Commands;

// ── Request DTOs ──────────────────────────────────────────────────────────────

public record CreateWarehouseRequest(string Name, string City, string Country, string Address);
public record AdjustStockRequest(Guid WarehouseId, Guid VariantId, int Delta, string Reason);
public record CreateStockTransferRequest(Guid FromWarehouseId, Guid ToWarehouseId, Guid VariantId, int Quantity, string? Notes);

// ── Commands ──────────────────────────────────────────────────────────────────

public record CreateWarehouseCommand(CreateWarehouseRequest Request) : IRequest<Result<WarehouseDto>>;
public record AdjustStockCommand(AdjustStockRequest Request) : IRequest<Result>;
public record CreateStockTransferCommand(CreateStockTransferRequest Request) : IRequest<Result<StockTransferDto>>;
public record CompleteStockTransferCommand(Guid TransferId) : IRequest<Result>;

public class CreateWarehouseCommandHandler : IRequestHandler<CreateWarehouseCommand, Result<WarehouseDto>>
{
    public Task<Result<WarehouseDto>> Handle(CreateWarehouseCommand request, CancellationToken ct)
        => Task.FromResult(Result<WarehouseDto>.Failure("Not implemented yet.", 501));
}

public class AdjustStockCommandHandler : IRequestHandler<AdjustStockCommand, Result>
{
    public Task<Result> Handle(AdjustStockCommand request, CancellationToken ct)
        => Task.FromResult(Result.Failure("Not implemented yet.", 501));
}

public class CreateStockTransferCommandHandler : IRequestHandler<CreateStockTransferCommand, Result<StockTransferDto>>
{
    public Task<Result<StockTransferDto>> Handle(CreateStockTransferCommand request, CancellationToken ct)
        => Task.FromResult(Result<StockTransferDto>.Failure("Not implemented yet.", 501));
}

public class CompleteStockTransferCommandHandler : IRequestHandler<CompleteStockTransferCommand, Result>
{
    public Task<Result> Handle(CompleteStockTransferCommand request, CancellationToken ct)
        => Task.FromResult(Result.Failure("Not implemented yet.", 501));
}
