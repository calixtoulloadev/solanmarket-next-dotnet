using MediatR;
using Solanmarket.Application.Common;

namespace Solanmarket.Application.Features.Inventory.Queries;

// ── Request DTOs ──────────────────────────────────────────────────────────────

public record WarehouseDto(Guid Id, string Name, string City, string Country, bool IsActive);
public record StockItemDto(Guid WarehouseId, Guid VariantId, string Sku, int Quantity, int ReorderPoint);
public record StockTransferDto(Guid Id, string Status, DateTime CreatedAt, string FromWarehouse, string ToWarehouse);

// ── Queries ────────────────────────────────────────────────────────────────────

public record GetWarehousesQuery : IRequest<Result<IEnumerable<WarehouseDto>>>;
public record GetStockQuery(Guid? WarehouseId, Guid? ProductId) : IRequest<Result<IEnumerable<StockItemDto>>>;
public record GetStockTransfersQuery(int Page, int PageSize) : IRequest<Result<PagedResult<StockTransferDto>>>;

public class GetWarehousesQueryHandler : IRequestHandler<GetWarehousesQuery, Result<IEnumerable<WarehouseDto>>>
{
    public Task<Result<IEnumerable<WarehouseDto>>> Handle(GetWarehousesQuery request, CancellationToken ct)
        => Task.FromResult(Result<IEnumerable<WarehouseDto>>.Success([]));
}

public class GetStockQueryHandler : IRequestHandler<GetStockQuery, Result<IEnumerable<StockItemDto>>>
{
    public Task<Result<IEnumerable<StockItemDto>>> Handle(GetStockQuery request, CancellationToken ct)
        => Task.FromResult(Result<IEnumerable<StockItemDto>>.Success([]));
}

public class GetStockTransfersQueryHandler : IRequestHandler<GetStockTransfersQuery, Result<PagedResult<StockTransferDto>>>
{
    public Task<Result<PagedResult<StockTransferDto>>> Handle(GetStockTransfersQuery request, CancellationToken ct)
        => Task.FromResult(Result<PagedResult<StockTransferDto>>.Success(
               new PagedResult<StockTransferDto>([], 0, request.Page, request.PageSize)));
}
