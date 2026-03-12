using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Solanmarket.Application.DTOs.Catalog;
using Solanmarket.Application.Features.Products.Commands;
using Solanmarket.Application.Features.Products.Queries;

namespace Solanmarket.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ProductsController(IMediator mediator) : ControllerBase
{
    /// <summary>Get paginated, filtered product list.</summary>
    [HttpGet]
    [ProducesResponseType(typeof(Solanmarket.Application.Common.PagedResult<ProductListItemDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetProducts([FromQuery] ProductQueryParams queryParams, CancellationToken ct)
    {
        var result = await mediator.Send(new GetProductsQuery(queryParams), ct);
        return Ok(result.Value);
    }

    /// <summary>Get product details by slug.</summary>
    [HttpGet("{slug}")]
    [ProducesResponseType(typeof(ProductDetailDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetProduct(string slug, CancellationToken ct)
    {
        var result = await mediator.Send(new GetProductBySlugQuery(slug), ct);
        if (!result.IsSuccess)
            return NotFound(result.Error);

        return Ok(result.Value);
    }

    /// <summary>Get product details by GUID (admin use / edit page).</summary>
    [HttpGet("{id:guid}")]
    [ProducesResponseType(typeof(ProductDetailDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetProductById(Guid id, CancellationToken ct)
    {
        var result = await mediator.Send(new GetProductByIdQuery(id), ct);
        if (!result.IsSuccess)
            return NotFound(result.Error);

        return Ok(result.Value);
    }

    /// <summary>Get related products for a given product.</summary>
    [HttpGet("{id:guid}/related")]
    [ProducesResponseType(typeof(IEnumerable<ProductListItemDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetRelated(Guid id, CancellationToken ct)
    {
        var result = await mediator.Send(new GetRelatedProductsQuery(id), ct);
        return Ok(result.Value ?? []);
    }
}

// ── Admin Product Endpoints ───────────────────────────────────────────────────
[ApiController]
[Route("api/admin/products")]
[Authorize(Roles = "Admin,Seller")]
public class AdminProductsController(IMediator mediator) : ControllerBase
{
    /// <summary>Create a new product.</summary>
    [HttpPost]
    [ProducesResponseType(typeof(ProductDetailDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> CreateProduct([FromBody] CreateProductRequest request, CancellationToken ct)
    {
        var result = await mediator.Send(new CreateProductCommand(request), ct);
        if (!result.IsSuccess)
            return result.StatusCode switch
            {
                404 => NotFound(result.Error),
                409 => Conflict(result.Error),
                500 => StatusCode(StatusCodes.Status500InternalServerError, result.Error),
                _ => BadRequest(result.Error),
            };

        return CreatedAtAction("GetProduct", "Products", new { slug = result.Value!.Slug }, result.Value);
    }

    /// <summary>Update an existing product.</summary>
    [HttpPut("{id:guid}")]
    [ProducesResponseType(typeof(ProductDetailDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> UpdateProduct(Guid id, [FromBody] UpdateProductRequest request, CancellationToken ct)
    {
        var result = await mediator.Send(new UpdateProductCommand(id, request), ct);
        if (!result.IsSuccess)
            return result.StatusCode == 404 ? NotFound(result.Error) : BadRequest(result.Error);

        return Ok(result.Value);
    }

    /// <summary>Soft-delete a product.</summary>
    [HttpDelete("{id:guid}")]
    [Authorize(Roles = "Admin")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DeleteProduct(Guid id, CancellationToken ct)
    {
        var result = await mediator.Send(new DeleteProductCommand(id), ct);
        if (!result.IsSuccess)
            return NotFound(result.Error);

        return NoContent();
    }

    /// <summary>Upload images for a product. Optionally associate with a color (e.g. #FF0000).</summary>
    [HttpPost("{id:guid}/images")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    public async Task<IActionResult> UploadImages(Guid id, [FromForm] IFormFileCollection files, [FromQuery] string? colorHex, CancellationToken ct)
    {
        var result = await mediator.Send(new UploadProductImagesCommand(id, files, colorHex), ct);
        if (!result.IsSuccess)
            return result.StatusCode switch
            {
                404 => NotFound(result.Error),
                500 => StatusCode(StatusCodes.Status500InternalServerError, result.Error),
                _ => BadRequest(result.Error),
            };

        return NoContent();
    }
}
