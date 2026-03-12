using MediatR;
using Microsoft.AspNetCore.Mvc;
using Solanmarket.Application.Features.Coupons;

namespace Solanmarket.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CouponsController(IMediator mediator) : ControllerBase
{
    [HttpGet("user")]
    public async Task<IActionResult> GetUserCoupons(CancellationToken ct)
    {
        var result = await mediator.Send(new GetUserCouponsQuery(), ct);
        return result.IsSuccess ? Ok(result.Value) : BadRequest(result.Error);
    }

    [HttpPost("validate")]
    public async Task<IActionResult> ValidateCoupon([FromBody] ValidateCouponRequest request, CancellationToken ct)
    {
        var result = await mediator.Send(new ValidateCouponCommand(request.Code), ct);
        return result.IsSuccess ? Ok(result.Value) : BadRequest(result.Error);
    }
}
