using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Solanmarket.Application.Features.Inventory.Commands;
using Solanmarket.Application.Features.Inventory.Queries;

namespace Solanmarket.API.Controllers;

[ApiController]
[Route("api/admin/inventory")]
[Authorize(Roles = "Admin")]
public class InventoryController(IMediator mediator) : ControllerBase
{
    // ── Warehouses ────────────────────────────────────────────────────────────

    [HttpGet("warehouses")]
    public async Task<IActionResult> GetWarehouses(CancellationToken ct)
    {
        var result = await mediator.Send(new GetWarehousesQuery(), ct);
        return Ok(result.Value ?? []);
    }

    [HttpPost("warehouses")]
    public async Task<IActionResult> CreateWarehouse([FromBody] CreateWarehouseRequest request, CancellationToken ct)
    {
        var result = await mediator.Send(new CreateWarehouseCommand(request), ct);
        if (!result.IsSuccess) return BadRequest(result.Error);
        return CreatedAtAction(nameof(GetWarehouses), result.Value);
    }

    // ── Stock ─────────────────────────────────────────────────────────────────

    [HttpGet("stock")]
    public async Task<IActionResult> GetStock([FromQuery] Guid? warehouseId, [FromQuery] Guid? productId, CancellationToken ct)
    {
        var result = await mediator.Send(new GetStockQuery(warehouseId, productId), ct);
        return Ok(result.Value ?? []);
    }

    [HttpPost("stock/adjust")]
    public async Task<IActionResult> AdjustStock([FromBody] AdjustStockRequest request, CancellationToken ct)
    {
        var result = await mediator.Send(new AdjustStockCommand(request), ct);
        if (!result.IsSuccess) return BadRequest(result.Error);
        return NoContent();
    }

    // ── Transfers ─────────────────────────────────────────────────────────────

    [HttpGet("transfers")]
    public async Task<IActionResult> GetTransfers([FromQuery] int page = 1, [FromQuery] int pageSize = 20, CancellationToken ct = default)
    {
        var result = await mediator.Send(new GetStockTransfersQuery(page, pageSize), ct);
        return Ok(result.Value);
    }

    [HttpPost("transfers")]
    public async Task<IActionResult> CreateTransfer([FromBody] CreateStockTransferRequest request, CancellationToken ct)
    {
        var result = await mediator.Send(new CreateStockTransferCommand(request), ct);
        if (!result.IsSuccess) return BadRequest(result.Error);
        return CreatedAtAction(nameof(GetTransfers), result.Value);
    }

    [HttpPatch("transfers/{id:guid}/complete")]
    public async Task<IActionResult> CompleteTransfer(Guid id, CancellationToken ct)
    {
        var result = await mediator.Send(new CompleteStockTransferCommand(id), ct);
        if (!result.IsSuccess) return BadRequest(result.Error);
        return NoContent();
    }
}
