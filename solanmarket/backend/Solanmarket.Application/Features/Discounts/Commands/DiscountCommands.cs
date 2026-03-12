using MediatR;
using Solanmarket.Application.Common;
using Solanmarket.Application.Features.Discounts.Queries;
using Solanmarket.Domain.Entities;
using Solanmarket.Domain.Enums;
using Solanmarket.Domain.Interfaces;

namespace Solanmarket.Application.Features.Discounts.Commands;

// ── Request DTOs ──────────────────────────────────────────────────────────────

public record CreateDiscountRequest(
    string Code,
    string Description,
    string DiscountType,   // "Percentage" | "Fixed"
    decimal DiscountValue,
    decimal MinOrderAmount,
    int? MaxUses,
    DateTime? ExpiresAt,
    bool IsActive = true);

public record UpdateDiscountRequest(bool? IsActive);

public record RedeemLoyaltyRewardResult(int RemainingPoints, string RedemptionCode);

// ── Commands ──────────────────────────────────────────────────────────────────

public record CreateDiscountCommand(CreateDiscountRequest Request) : IRequest<Result<CouponAdminDto>>;
public record UpdateDiscountCommand(Guid Id, UpdateDiscountRequest Request) : IRequest<Result<CouponAdminDto>>;
public record DeleteDiscountCommand(Guid Id) : IRequest<Result>;
public record RedeemLoyaltyRewardCommand(Guid RewardId) : IRequest<Result<RedeemLoyaltyRewardResult>>;

// ── Handlers ──────────────────────────────────────────────────────────────────

public class CreateDiscountCommandHandler(IUnitOfWork uow) : IRequestHandler<CreateDiscountCommand, Result<CouponAdminDto>>
{
    public async Task<Result<CouponAdminDto>> Handle(CreateDiscountCommand cmd, CancellationToken ct)
    {
        var req = cmd.Request;
        var code = req.Code.ToUpper();

        if (await uow.Discounts.ExistsAsync(d => d.Code == code, ct))
            return Result<CouponAdminDto>.Failure($"A coupon with code '{code}' already exists.", 409);

        if (!Enum.TryParse<DiscountType>(req.DiscountType, true, out var discountType))
            return Result<CouponAdminDto>.Failure($"Invalid discount type '{req.DiscountType}'.", 400);

        var discount = new Discount
        {
            Name = req.Description,
            Code = code,
            Type = discountType,
            Value = req.DiscountValue,
            MinOrderAmount = req.MinOrderAmount,
            UsageLimit = req.MaxUses,
            StartDate = DateTime.UtcNow,
            EndDate = req.ExpiresAt ?? DateTime.UtcNow.AddYears(10),
            IsActive = req.IsActive,
        };

        await uow.Discounts.AddAsync(discount, ct);
        await uow.SaveChangesAsync(ct);

        return Result<CouponAdminDto>.Success(discount.ToCouponAdminDto());
    }
}

public class UpdateDiscountCommandHandler(IUnitOfWork uow) : IRequestHandler<UpdateDiscountCommand, Result<CouponAdminDto>>
{
    public async Task<Result<CouponAdminDto>> Handle(UpdateDiscountCommand cmd, CancellationToken ct)
    {
        var discount = await uow.Discounts.GetByIdAsync(cmd.Id, ct);
        if (discount is null)
            return Result<CouponAdminDto>.Failure("Coupon not found.", 404);

        if (cmd.Request.IsActive.HasValue)
            discount.IsActive = cmd.Request.IsActive.Value;

        await uow.Discounts.UpdateAsync(discount, ct);
        await uow.SaveChangesAsync(ct);

        return Result<CouponAdminDto>.Success(discount.ToCouponAdminDto());
    }
}

public class DeleteDiscountCommandHandler(IUnitOfWork uow) : IRequestHandler<DeleteDiscountCommand, Result>
{
    public async Task<Result> Handle(DeleteDiscountCommand cmd, CancellationToken ct)
    {
        var discount = await uow.Discounts.GetByIdAsync(cmd.Id, ct);
        if (discount is null)
            return Result.Failure("Coupon not found.", 404);

        await uow.Discounts.DeleteAsync(discount, ct);
        await uow.SaveChangesAsync(ct);

        return Result.Success();
    }
}

public class RedeemLoyaltyRewardCommandHandler : IRequestHandler<RedeemLoyaltyRewardCommand, Result<RedeemLoyaltyRewardResult>>
{
    public Task<Result<RedeemLoyaltyRewardResult>> Handle(RedeemLoyaltyRewardCommand request, CancellationToken ct)
        => Task.FromResult(Result<RedeemLoyaltyRewardResult>.Failure("Not implemented yet.", 501));
}

// ── Mapper ────────────────────────────────────────────────────────────────────

internal static class DiscountExtensions
{
    internal static CouponAdminDto ToCouponAdminDto(this Discount d) =>
        new(d.Id, d.Code, d.Name, d.Type.ToString(), d.Value,
            d.MinOrderAmount, d.UsageLimit, d.CurrentUses,
            d.EndDate > DateTime.UtcNow.AddYears(5) ? null : (DateTime?)d.EndDate,
            d.IsActive);
}
