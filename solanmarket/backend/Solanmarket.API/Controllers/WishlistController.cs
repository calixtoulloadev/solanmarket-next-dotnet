using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Solanmarket.Application.Features.Wishlist;

namespace Solanmarket.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class WishlistController(IMediator mediator) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetWishlist(CancellationToken ct)
    {
        var result = await mediator.Send(new GetWishlistQuery(), ct);
        if (!result.IsSuccess)
            return StatusCode(result.StatusCode, result.Error);
        return Ok(result.Value);
    }

    [HttpPost("{productId:guid}")]
    public async Task<IActionResult> AddItem(Guid productId, CancellationToken ct)
    {
        var result = await mediator.Send(new AddWishlistItemCommand(productId), ct);
        if (!result.IsSuccess)
            return StatusCode(result.StatusCode, result.Error);
        return StatusCode(201);
    }

    [HttpDelete("{productId:guid}")]
    public async Task<IActionResult> RemoveItem(Guid productId, CancellationToken ct)
    {
        var result = await mediator.Send(new RemoveWishlistItemCommand(productId), ct);
        if (!result.IsSuccess)
            return StatusCode(result.StatusCode, result.Error);
        return NoContent();
    }
}
