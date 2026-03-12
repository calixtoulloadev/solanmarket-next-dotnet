using MediatR;
using Solanmarket.Application.Common;
using Solanmarket.Domain.Interfaces;

namespace Solanmarket.Application.Features.Discounts.Queries;

// ── DTOs ──────────────────────────────────────────────────────────────

public record DiscountDto(Guid Id, string Code, string Type, decimal Value, DateTime? ExpiresAt, bool IsActive, int UsageCount, int? UsageLimit);

/// <summary>Full coupon DTO matching the frontend admin Coupon interface.</summary>
public record CouponAdminDto(
    Guid Id, string Code, string Description, string DiscountType, decimal DiscountValue,
    decimal MinOrderAmount, int? MaxUses, int UsedCount, DateTime? ExpiresAt, bool IsActive);

public record LoyaltyPointsDto(int Points, string Tier, int PointsToNextTier);
public record LoyaltyRewardDto(Guid Id, string Name, string Description, int PointsCost, string Type);
public record LoyaltyTransactionDto(DateTime Date, string Type, int Points, string Description);

// ── Queries ───────────────────────────────────────────────────────────────

public record GetDiscountsQuery(int Page, int PageSize) : IRequest<Result<PagedResult<DiscountDto>>>;
public record GetCouponsAdminQuery(int Page, int PageSize) : IRequest<Result<PagedResult<CouponAdminDto>>>;
public record GetLoyaltyPointsQuery : IRequest<Result<LoyaltyPointsDto>>;
public record GetLoyaltyRewardsQuery : IRequest<Result<IEnumerable<LoyaltyRewardDto>>>;
public record GetLoyaltyHistoryQuery(int Page, int PageSize) : IRequest<Result<PagedResult<LoyaltyTransactionDto>>>;

// ── Handlers ──────────────────────────────────────────────────────────────────

public class GetDiscountsQueryHandler : IRequestHandler<GetDiscountsQuery, Result<PagedResult<DiscountDto>>>
{
    public Task<Result<PagedResult<DiscountDto>>> Handle(GetDiscountsQuery request, CancellationToken ct)
        => Task.FromResult(Result<PagedResult<DiscountDto>>.Success(
               new PagedResult<DiscountDto>([], 0, request.Page, request.PageSize)));
}

public class GetCouponsAdminQueryHandler(IUnitOfWork uow) : IRequestHandler<GetCouponsAdminQuery, Result<PagedResult<CouponAdminDto>>>
{
    public async Task<Result<PagedResult<CouponAdminDto>>> Handle(GetCouponsAdminQuery request, CancellationToken ct)
    {
        var all = (await uow.Discounts.GetAllAsync(ct))
            .OrderByDescending(d => d.StartDate)
            .ToList();

        var total = all.Count;
        var cutoff = DateTime.UtcNow.AddYears(5);
        var items = all
            .Skip((request.Page - 1) * request.PageSize)
            .Take(request.PageSize)
            .Select(d => new CouponAdminDto(
                d.Id, d.Code, d.Name, d.Type.ToString(), d.Value,
                d.MinOrderAmount, d.UsageLimit, d.CurrentUses,
                d.EndDate > cutoff ? null : (DateTime?)d.EndDate,
                d.IsActive))
            .ToList();

        return Result<PagedResult<CouponAdminDto>>.Success(
            new PagedResult<CouponAdminDto>(items, total, request.Page, request.PageSize));
    }
}

public class GetLoyaltyPointsQueryHandler : IRequestHandler<GetLoyaltyPointsQuery, Result<LoyaltyPointsDto>>
{
    public Task<Result<LoyaltyPointsDto>> Handle(GetLoyaltyPointsQuery request, CancellationToken ct)
        => Task.FromResult(Result<LoyaltyPointsDto>.Success(new LoyaltyPointsDto(0, "Bronze", 100)));
}

public class GetLoyaltyRewardsQueryHandler : IRequestHandler<GetLoyaltyRewardsQuery, Result<IEnumerable<LoyaltyRewardDto>>>
{
    public Task<Result<IEnumerable<LoyaltyRewardDto>>> Handle(GetLoyaltyRewardsQuery request, CancellationToken ct)
        => Task.FromResult(Result<IEnumerable<LoyaltyRewardDto>>.Success([]));
}

public class GetLoyaltyHistoryQueryHandler : IRequestHandler<GetLoyaltyHistoryQuery, Result<PagedResult<LoyaltyTransactionDto>>>
{
    public Task<Result<PagedResult<LoyaltyTransactionDto>>> Handle(GetLoyaltyHistoryQuery request, CancellationToken ct)
        => Task.FromResult(Result<PagedResult<LoyaltyTransactionDto>>.Success(
               new PagedResult<LoyaltyTransactionDto>([], 0, request.Page, request.PageSize)));
}
