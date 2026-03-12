using MediatR;
using Solanmarket.Application.Common;

namespace Solanmarket.Application.Features.Admin.Queries;

// ── DTOs ──────────────────────────────────────────────────────────────────────

public record DashboardRecentOrderDto(string Id, string OrderNumber, string CustomerName, decimal Total, string Status, DateTime CreatedAt);
public record DashboardTopProductDto(string Id, string Name, int SalesCount, decimal Revenue, string? ImageUrl);

public record DashboardStatsDto(
    decimal TotalRevenue,
    int TotalOrders,
    int TotalUsers,
    int TotalProducts,
    decimal RevenueChange,
    int OrdersChange,
    int UsersChange,
    IEnumerable<DashboardRecentOrderDto> RecentOrders,
    IEnumerable<DashboardTopProductDto> TopProducts);

public record RevenuePeriodDto(DateTime Period, decimal Revenue, int OrderCount);
public record TopProductDto(Guid Id, string Name, string Slug, int UnitsSold, decimal Revenue);
public record UserSummaryDto(Guid Id, string FullName, string Email, string Role, bool IsActive, DateTime CreatedAt);

// ── Queries ───────────────────────────────────────────────────────────────────

public record GetDashboardStatsQuery : IRequest<Result<DashboardStatsDto>>;
public record GetRevenueReportQuery(DateTime From, DateTime To, string GroupBy) : IRequest<Result<IEnumerable<RevenuePeriodDto>>>;
public record GetTopProductsQuery(DateTime From, DateTime To, int Top) : IRequest<Result<IEnumerable<TopProductDto>>>;
public record GetUsersQuery(int Page, int PageSize, string? Role) : IRequest<Result<PagedResult<UserSummaryDto>>>;

// ── Commands ──────────────────────────────────────────────────────────────────

public record ToggleUserActiveCommand(Guid UserId) : IRequest<Result>;

// ── Handlers (stub) ───────────────────────────────────────────────────────────

public class GetDashboardStatsQueryHandler : IRequestHandler<GetDashboardStatsQuery, Result<DashboardStatsDto>>
{
    public Task<Result<DashboardStatsDto>> Handle(GetDashboardStatsQuery request, CancellationToken ct)
        => Task.FromResult(Result<DashboardStatsDto>.Success(
               new DashboardStatsDto(0m, 0, 0, 0, 0m, 0, 0, [], [])));
}

public class GetRevenueReportQueryHandler : IRequestHandler<GetRevenueReportQuery, Result<IEnumerable<RevenuePeriodDto>>>
{
    public Task<Result<IEnumerable<RevenuePeriodDto>>> Handle(GetRevenueReportQuery request, CancellationToken ct)
        => Task.FromResult(Result<IEnumerable<RevenuePeriodDto>>.Success([]));
}

public class GetTopProductsQueryHandler : IRequestHandler<GetTopProductsQuery, Result<IEnumerable<TopProductDto>>>
{
    public Task<Result<IEnumerable<TopProductDto>>> Handle(GetTopProductsQuery request, CancellationToken ct)
        => Task.FromResult(Result<IEnumerable<TopProductDto>>.Success([]));
}

public class GetUsersQueryHandler : IRequestHandler<GetUsersQuery, Result<PagedResult<UserSummaryDto>>>
{
    public Task<Result<PagedResult<UserSummaryDto>>> Handle(GetUsersQuery request, CancellationToken ct)
        => Task.FromResult(Result<PagedResult<UserSummaryDto>>.Success(
               new PagedResult<UserSummaryDto>([], 0, request.Page, request.PageSize)));
}

public class ToggleUserActiveCommandHandler : IRequestHandler<ToggleUserActiveCommand, Result>
{
    public Task<Result> Handle(ToggleUserActiveCommand request, CancellationToken ct)
        => Task.FromResult(Result.Failure("Not implemented yet.", 501));
}
