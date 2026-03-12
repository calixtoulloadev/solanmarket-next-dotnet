using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Solanmarket.Application.Features.Admin.Queries;

namespace Solanmarket.API.Controllers;

/// <summary>
/// Admin-only dashboard endpoints (stats, reports).
/// </summary>
[ApiController]
[Route("api/admin")]
[Authorize(Roles = "Admin")]
public class AdminController(IMediator mediator) : ControllerBase
{
    /// <summary>Get KPI summary for the admin dashboard.</summary>
    [HttpGet("dashboard")]
    public async Task<IActionResult> Dashboard(CancellationToken ct)
    {
        var result = await mediator.Send(new GetDashboardStatsQuery(), ct);
        return Ok(result.Value);
    }

    /// <summary>Get revenue report grouped by period.</summary>
    [HttpGet("reports/revenue")]
    public async Task<IActionResult> RevenueReport(
        [FromQuery] DateTime from,
        [FromQuery] DateTime to,
        [FromQuery] string groupBy = "day",
        CancellationToken ct = default)
    {
        var result = await mediator.Send(new GetRevenueReportQuery(from, to, groupBy), ct);
        return Ok(result.Value);
    }

    /// <summary>Get top-selling products in a date range.</summary>
    [HttpGet("reports/top-products")]
    public async Task<IActionResult> TopProducts(
        [FromQuery] DateTime from,
        [FromQuery] DateTime to,
        [FromQuery] int top = 10,
        CancellationToken ct = default)
    {
        var result = await mediator.Send(new GetTopProductsQuery(from, to, top), ct);
        return Ok(result.Value ?? []);
    }

    /// <summary>Combined reports data for the admin reports page.</summary>
    [HttpGet("reports")]
    public async Task<IActionResult> GetReports(CancellationToken ct)
    {
        var from = DateTime.UtcNow.AddMonths(-12);
        var to = DateTime.UtcNow;

        var revenueResult = await mediator.Send(new GetRevenueReportQuery(from, to, "month"), ct);
        var topProductsResult = await mediator.Send(new GetTopProductsQuery(from, to, 10), ct);

        var revenueData = revenueResult.Value ?? [];
        var topProducts = topProductsResult.Value ?? [];

        var totalOrders = revenueData.Sum(r => r.OrderCount);
        var totalRevenue = revenueData.Sum(r => r.Revenue);

        return Ok(new
        {
            totalRevenue,
            totalOrders,
            avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0m,
            monthlyRevenue = revenueData.Select(r => new
            {
                month = r.Period.ToString("MMM"),
                year = r.Period.Year,
                revenue = r.Revenue,
                orders = r.OrderCount,
            }),
            topProducts = topProducts.Select(p => new
            {
                productId = p.Id,
                productName = p.Name,
                unitsSold = p.UnitsSold,
                revenue = p.Revenue,
            }),
            revenueByCategory = Array.Empty<object>(),
        });
    }

    // ── User management ───────────────────────────────────────────────────────

    [HttpGet("users")]
    public async Task<IActionResult> GetUsers(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        [FromQuery] string? role = null,
        CancellationToken ct = default)
    {
        var result = await mediator.Send(new GetUsersQuery(page, pageSize, role), ct);
        return Ok(result.Value);
    }

    [HttpPatch("users/{id:guid}/toggle-active")]
    public async Task<IActionResult> ToggleUserActive(Guid id, CancellationToken ct)
    {
        var result = await mediator.Send(new ToggleUserActiveCommand(id), ct);
        if (!result.IsSuccess) return NotFound(result.Error);
        return NoContent();
    }
}
