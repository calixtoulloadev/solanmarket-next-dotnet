using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Solanmarket.Application.Features.Categories.Commands;
using Solanmarket.Application.Features.Categories.Queries;

namespace Solanmarket.API.Controllers;

[ApiController]
[Route("api/admin/categories")]
[Authorize(Roles = "Admin")]
public class AdminCategoriesController(IMediator mediator) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetAll(CancellationToken ct)
    {
        var result = await mediator.Send(new GetCategoriesFlatQuery(), ct);
        return Ok(result.Value ?? []);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateCategoryRequest request, CancellationToken ct)
    {
        var result = await mediator.Send(new CreateCategoryCommand(request), ct);
        if (!result.IsSuccess)
            return result.StatusCode == 409 ? Conflict(result.Error) : BadRequest(result.Error);
        return StatusCode(201, result.Value);
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateCategoryRequest request, CancellationToken ct)
    {
        var result = await mediator.Send(new UpdateCategoryCommand(id, request), ct);
        if (!result.IsSuccess)
            return result.StatusCode == 404 ? NotFound(result.Error) :
                   result.StatusCode == 409 ? Conflict(result.Error) : BadRequest(result.Error);
        return Ok(result.Value);
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id, CancellationToken ct)
    {
        var result = await mediator.Send(new DeleteCategoryCommand(id), ct);
        if (!result.IsSuccess)
            return NotFound(result.Error);
        return NoContent();
    }
}
