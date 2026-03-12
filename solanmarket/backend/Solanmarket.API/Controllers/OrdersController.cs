using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Solanmarket.Application.DTOs.Orders;
using Solanmarket.Application.Features.Orders.Commands;
using Solanmarket.Application.Features.Orders.Queries;
using System.Security.Claims;

namespace Solanmarket.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class OrdersController(IMediator mediator) : ControllerBase
{
    /// <summary>Place a new order (checkout).</summary>
    [HttpPost]
    [ProducesResponseType(typeof(OrderDetailDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status422UnprocessableEntity)]
    public async Task<IActionResult> CreateOrder([FromBody] CreateOrderRequest request, CancellationToken ct)
    {
        var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var result = await mediator.Send(new CreateOrderCommand(userId, request), ct);
        if (!result.IsSuccess)
            return UnprocessableEntity(result.Error);

        return CreatedAtAction(nameof(GetOrder), new { id = result.Value!.Id }, result.Value);
    }

    /// <summary>Get the authenticated user's orders.</summary>
    [HttpGet]
    [ProducesResponseType(typeof(Solanmarket.Application.Common.PagedResult<OrderSummaryDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetMyOrders([FromQuery] int page = 1, [FromQuery] int pageSize = 10, CancellationToken ct = default)
    {
        var result = await mediator.Send(new GetMyOrdersQuery(page, pageSize), ct);
        return Ok(result.Value);
    }

    /// <summary>Get full order details by ID.</summary>
    [HttpGet("{id:guid}")]
    [ProducesResponseType(typeof(OrderDetailDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> GetOrder(Guid id, CancellationToken ct)
    {
        var result = await mediator.Send(new GetOrderByIdQuery(id), ct);
        if (!result.IsSuccess)
            return result.StatusCode == 404 ? NotFound(result.Error) : Forbid();

        return Ok(result.Value);
    }

    /// <summary>Cancel an order (customer-initiated, only allowed in Pending/Confirmed states).</summary>
    [HttpPost("{id:guid}/cancel")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> CancelOrder(Guid id, CancellationToken ct)
    {
        var result = await mediator.Send(new CancelOrderCommand(id), ct);
        if (!result.IsSuccess)
            return BadRequest(result.Error);

        return NoContent();
    }

    /// <summary>Preview checkout totals before submitting.</summary>
    [HttpPost("checkout-preview")]
    [ProducesResponseType(typeof(CheckoutTotalsDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> CheckoutPreview([FromBody] CreateOrderRequest request, CancellationToken ct)
    {
        var result = await mediator.Send(new PreviewCheckoutCommand(request), ct);
        if (!result.IsSuccess)
            return BadRequest(result.Error);

        return Ok(result.Value);
    }

    /// <summary>Validate a coupon code and return discount details.</summary>
    [HttpPost("validate-coupon")]
    [ProducesResponseType(typeof(ValidateCouponResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> ValidateCoupon([FromBody] ValidateCouponRequest request, CancellationToken ct)
    {
        var result = await mediator.Send(new ValidateCouponQuery(request), ct);
        if (!result.IsSuccess)
            return BadRequest(result.Error);

        return Ok(result.Value);
    }
}

// ── Admin Order Management ────────────────────────────────────────────────────
[ApiController]
[Route("api/admin/orders")]
[Authorize(Roles = "Admin")]
public class AdminOrdersController(IMediator mediator) : ControllerBase
{
    /// <summary>Get all orders with filters (admin view).</summary>
    [HttpGet]
    [ProducesResponseType(typeof(Solanmarket.Application.Common.PagedResult<OrderSummaryDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAll([FromQuery] int page = 1, [FromQuery] int pageSize = 20,
        [FromQuery] string? status = null, CancellationToken ct = default)
    {
        var result = await mediator.Send(new GetAllOrdersQuery(page, pageSize, status), ct);
        return Ok(result.Value);
    }

    /// <summary>Update order status (e.g., Confirmed → Shipped).</summary>
    [HttpPatch("{id:guid}/status")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> UpdateStatus(Guid id, [FromBody] UpdateOrderStatusRequest request, CancellationToken ct)
    {
        var result = await mediator.Send(new UpdateOrderStatusCommand(id, request.Status, request.TrackingNumber), ct);
        if (!result.IsSuccess)
            return BadRequest(result.Error);

        return NoContent();
    }
}

// ── DTO for status update ─────────────────────────────────────────────────────
public sealed record UpdateOrderStatusRequest(string Status, string? TrackingNumber);
