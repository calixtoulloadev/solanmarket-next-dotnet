using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Solanmarket.Application.Features.Reviews.Commands;
using Solanmarket.Application.Features.Reviews.Queries;

namespace Solanmarket.API.Controllers;

[ApiController]
[Route("api")]
public class ReviewsController(IMediator mediator) : ControllerBase
{
    /// <summary>Get reviews for a product.</summary>
    [HttpGet("products/{productId:guid}/reviews")]
    public async Task<IActionResult> GetProductReviews(Guid productId,
        [FromQuery] int page = 1, [FromQuery] int pageSize = 10, CancellationToken ct = default)
    {
        var result = await mediator.Send(new GetProductReviewsQuery(productId, page, pageSize), ct);
        return Ok(result.Value);
    }

    /// <summary>Submit a review for a product (buyer only).</summary>
    [Authorize]
    [HttpPost("products/{productId:guid}/reviews")]
    public async Task<IActionResult> CreateReview(Guid productId, [FromBody] CreateReviewRequest request, CancellationToken ct)
    {
        var result = await mediator.Send(new CreateReviewCommand(productId, request), ct);
        if (!result.IsSuccess) return BadRequest(result.Error);
        return CreatedAtAction(nameof(GetProductReviews), new { productId }, result.Value);
    }

    /// <summary>Delete a review (owner or admin).</summary>
    [Authorize]
    [HttpDelete("reviews/{id:guid}")]
    public async Task<IActionResult> DeleteReview(Guid id, CancellationToken ct)
    {
        var result = await mediator.Send(new DeleteReviewCommand(id), ct);
        if (!result.IsSuccess) return result.StatusCode == 404 ? NotFound(result.Error) : Forbid();
        return NoContent();
    }
}
