using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Solanmarket.Application.Features.Reviews.Commands;
using Solanmarket.Application.Features.Reviews.Queries;

namespace Solanmarket.API.Controllers;

[ApiController]
[Route("api/admin/reviews")]
[Authorize(Roles = "Admin")]
public class AdminReviewsController(IMediator mediator) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetAll(
        [FromQuery] int pageIndex = 1,
        [FromQuery] int pageSize = 20,
        [FromQuery] string? status = null,
        CancellationToken ct = default)
    {
        var result = await mediator.Send(new GetAdminReviewsQuery(pageIndex, pageSize, status), ct);
        return Ok(result.Value);
    }

    [HttpPatch("{id:guid}/status")]
    public async Task<IActionResult> UpdateStatus(Guid id, [FromBody] UpdateReviewStatusRequest request, CancellationToken ct)
    {
        var result = await mediator.Send(new UpdateReviewStatusCommand(id, request.Status), ct);
        if (!result.IsSuccess)
            return result.StatusCode == 404 ? NotFound(result.Error) : BadRequest(result.Error);
        return NoContent();
    }
}
