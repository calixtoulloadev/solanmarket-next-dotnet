using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Solanmarket.Application.Features.Discounts.Commands;
using Solanmarket.Application.Features.Discounts.Queries;

namespace Solanmarket.API.Controllers;

[ApiController]
[Route("api/admin/coupons")]
[Authorize(Roles = "Admin")]
public class AdminCouponsController(IMediator mediator) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetAll(
        [FromQuery] int pageIndex = 1,
        [FromQuery] int pageSize = 100,
        CancellationToken ct = default)
    {
        var result = await mediator.Send(new GetCouponsAdminQuery(pageIndex, pageSize), ct);
        return Ok(result.Value?.Items ?? []);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateDiscountRequest request, CancellationToken ct)
    {
        var result = await mediator.Send(new CreateDiscountCommand(request), ct);
        if (!result.IsSuccess)
            return result.StatusCode == 409 ? Conflict(result.Error) : BadRequest(result.Error);
        return StatusCode(201, result.Value);
    }

    [HttpPatch("{id:guid}")]
    public async Task<IActionResult> Toggle(Guid id, [FromBody] UpdateDiscountRequest request, CancellationToken ct)
    {
        var result = await mediator.Send(new UpdateDiscountCommand(id, request), ct);
        if (!result.IsSuccess)
            return result.StatusCode == 404 ? NotFound(result.Error) : BadRequest(result.Error);
        return Ok(result.Value);
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id, CancellationToken ct)
    {
        var result = await mediator.Send(new DeleteDiscountCommand(id), ct);
        if (!result.IsSuccess)
            return NotFound(result.Error);
        return NoContent();
    }
}
