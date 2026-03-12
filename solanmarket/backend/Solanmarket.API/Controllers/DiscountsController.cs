using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Solanmarket.Application.Features.Discounts.Commands;
using Solanmarket.Application.Features.Discounts.Queries;

namespace Solanmarket.API.Controllers;

// ── Public coupon validation (already in OrdersController) ───────────────────

// ── Admin discount management ─────────────────────────────────────────────────
[ApiController]
[Route("api/admin/discounts")]
[Authorize(Roles = "Admin")]
public class DiscountsController(IMediator mediator) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] int page = 1, [FromQuery] int pageSize = 20, CancellationToken ct = default)
    {
        var result = await mediator.Send(new GetDiscountsQuery(page, pageSize), ct);
        return Ok(result.Value);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateDiscountRequest request, CancellationToken ct)
    {
        var result = await mediator.Send(new CreateDiscountCommand(request), ct);
        if (!result.IsSuccess) return BadRequest(result.Error);
        return CreatedAtAction(nameof(GetAll), result.Value);
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateDiscountRequest request, CancellationToken ct)
    {
        var result = await mediator.Send(new UpdateDiscountCommand(id, request), ct);
        if (!result.IsSuccess) return result.StatusCode == 404 ? NotFound(result.Error) : BadRequest(result.Error);
        return Ok(result.Value);
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id, CancellationToken ct)
    {
        var result = await mediator.Send(new DeleteDiscountCommand(id), ct);
        if (!result.IsSuccess) return NotFound(result.Error);
        return NoContent();
    }
}

// ── Loyalty program (customer-facing) ────────────────────────────────────────
[ApiController]
[Route("api/loyalty")]
[Authorize]
public class LoyaltyController(IMediator mediator) : ControllerBase
{
    [HttpGet("points")]
    public async Task<IActionResult> GetPoints(CancellationToken ct)
    {
        var result = await mediator.Send(new GetLoyaltyPointsQuery(), ct);
        return Ok(result.Value);
    }

    [HttpGet("rewards")]
    public async Task<IActionResult> GetRewards(CancellationToken ct)
    {
        var result = await mediator.Send(new GetLoyaltyRewardsQuery(), ct);
        return Ok(result.Value ?? []);
    }

    [HttpPost("redeem/{rewardId:guid}")]
    public async Task<IActionResult> Redeem(Guid rewardId, CancellationToken ct)
    {
        var result = await mediator.Send(new RedeemLoyaltyRewardCommand(rewardId), ct);
        if (!result.IsSuccess) return BadRequest(result.Error);
        return Ok(result.Value);
    }

    [HttpGet("history")]
    public async Task<IActionResult> GetHistory([FromQuery] int page = 1, [FromQuery] int pageSize = 20, CancellationToken ct = default)
    {
        var result = await mediator.Send(new GetLoyaltyHistoryQuery(page, pageSize), ct);
        return Ok(result.Value);
    }
}
