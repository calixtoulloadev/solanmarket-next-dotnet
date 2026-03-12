using MediatR;
using Microsoft.AspNetCore.Mvc;
using Solanmarket.Application.DTOs.Catalog;
using Solanmarket.Application.Features.Categories.Queries;

namespace Solanmarket.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CategoriesController(IMediator mediator) : ControllerBase
{
    /// <summary>Get the full category tree (nested).</summary>
    [HttpGet]
    [ProducesResponseType(typeof(IEnumerable<CategoryDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetTree(CancellationToken ct)
    {
        var result = await mediator.Send(new GetCategoryTreeQuery(), ct);
        return Ok(result.Value ?? []);
    }

    /// <summary>Get flat list of all categories.</summary>
    [HttpGet("flat")]
    [ProducesResponseType(typeof(IEnumerable<CategoryDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetFlat(CancellationToken ct)
    {
        var result = await mediator.Send(new GetCategoriesFlatQuery(), ct);
        return Ok(result.Value ?? []);
    }

    /// <summary>Get a single category and its children.</summary>
    [HttpGet("{id:guid}")]
    [ProducesResponseType(typeof(CategoryDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetById(Guid id, CancellationToken ct)
    {
        var result = await mediator.Send(new GetCategoryByIdQuery(id), ct);
        if (!result.IsSuccess)
            return NotFound(result.Error);

        return Ok(result.Value);
    }
}
