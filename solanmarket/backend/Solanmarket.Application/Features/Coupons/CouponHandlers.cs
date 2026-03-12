using MediatR;
using Solanmarket.Application.Common;
using Solanmarket.Domain.Entities;
using Solanmarket.Domain.Interfaces;

namespace Solanmarket.Application.Features.Coupons;

// ── DTOs ─────────────────────────────────────────────────────────────────────

public record CouponDto(
    Guid Id,
    string Code,
    string Description,
    string DiscountType,
    decimal DiscountValue,
    decimal? MinOrderAmount,
    DateTime? ExpiresAt,
    bool IsUsed);

public record ValidateCouponRequest(string Code);

public record ValidateCouponResponse(bool Valid, CouponDto? Coupon);

// ── Get User Coupons ──────────────────────────────────────────────────────────

public record GetUserCouponsQuery : IRequest<Result<IEnumerable<CouponDto>>>;

public class GetUserCouponsQueryHandler(
    IRepository<Discount> discounts) : IRequestHandler<GetUserCouponsQuery, Result<IEnumerable<CouponDto>>>
{
    public async Task<Result<IEnumerable<CouponDto>>> Handle(GetUserCouponsQuery _, CancellationToken ct)
    {
        var now = DateTime.UtcNow;
        var active = (await discounts.FindAsync(
            d => d.IsActive && d.StartDate <= now && d.EndDate >= now && d.DeletedAt == null, ct))
            .Select(ToDto);

        return Result<IEnumerable<CouponDto>>.Success(active);
    }

    internal static CouponDto ToDto(Discount d) => new(
        d.Id,
        d.Code,
        d.Name,
        d.Type.ToString(),
        d.Value,
        d.MinOrderAmount == 0 ? null : d.MinOrderAmount,
        d.EndDate,
        false);
}

// ── Validate Coupon ───────────────────────────────────────────────────────────

public record ValidateCouponCommand(string Code) : IRequest<Result<ValidateCouponResponse>>;

public class ValidateCouponCommandHandler(
    IRepository<Discount> discounts) : IRequestHandler<ValidateCouponCommand, Result<ValidateCouponResponse>>
{
    public async Task<Result<ValidateCouponResponse>> Handle(ValidateCouponCommand cmd, CancellationToken ct)
    {
        var now = DateTime.UtcNow;
        var code = cmd.Code.Trim().ToUpperInvariant();

        var discount = (await discounts.FindAsync(
            d => d.Code == code && d.IsActive && d.StartDate <= now && d.EndDate >= now && d.DeletedAt == null, ct))
            .FirstOrDefault();

        if (discount is null)
            return Result<ValidateCouponResponse>.Success(new ValidateCouponResponse(false, null));

        if (discount.UsageLimit.HasValue && discount.CurrentUses >= discount.UsageLimit.Value)
            return Result<ValidateCouponResponse>.Success(new ValidateCouponResponse(false, null));

        return Result<ValidateCouponResponse>.Success(
            new ValidateCouponResponse(true, GetUserCouponsQueryHandler.ToDto(discount)));
    }
}
