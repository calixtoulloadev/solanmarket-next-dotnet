using Solanmarket.Domain.Common;
using Solanmarket.Domain.Enums;

namespace Solanmarket.Domain.Entities;

public class Discount : BaseEntity
{
    public string Name { get; set; } = string.Empty;
    public string Code { get; set; } = string.Empty;   // UPPERCASE
    public DiscountType Type { get; set; } = DiscountType.Percentage;
    public decimal Value { get; set; }

    public decimal MinOrderAmount { get; set; } = 0;

    /// <summary>If set, discount only applies to this category</summary>
    public Guid? CategoryId { get; set; }
    public Category? Category { get; set; }

    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }

    /// <summary>null = unlimited</summary>
    public int? UsageLimit { get; set; }
    public int CurrentUses { get; set; } = 0;
    public bool IsActive { get; set; } = true;

    // Navigation
    public ICollection<ProductDiscount> ProductDiscounts { get; set; } = [];
}

// ─── Loyalty ────────────────────────────────────────────────────────────────

public class LoyaltyTier : BaseEntity
{
    public string Name { get; set; } = string.Empty;  // Bronze|Silver|VIP|Elite
    public int MinPoints { get; set; }
    public decimal EarningMultiplier { get; set; } = 1.0m;
    public string? BadgeEmoji { get; set; }
    public string? Color { get; set; }
}

public class LoyaltyReward : BaseEntity
{
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public int PointsCost { get; set; }
    public LoyaltyRewardType RewardType { get; set; } = LoyaltyRewardType.Discount;
    public decimal? RewardValue { get; set; }
    public bool IsActive { get; set; } = true;

    /// <summary>null = unlimited stock</summary>
    public int? Stock { get; set; }

    // Navigation
    public ICollection<LoyaltyRedemption> Redemptions { get; set; } = [];
}

public class LoyaltyTransaction : BaseEntity
{
    public Guid UserId { get; set; }
    public ApplicationUser User { get; set; } = null!;

    /// <summary>Positive = earn, negative = redeem</summary>
    public int Points { get; set; }
    public LoyaltyTransactionType Type { get; set; }
    public string Description { get; set; } = string.Empty;

    public Guid? OrderId { get; set; }
    public Order? Order { get; set; }
}

public class LoyaltyRedemption : BaseEntity
{
    public Guid UserId { get; set; }
    public ApplicationUser User { get; set; } = null!;

    public Guid RewardId { get; set; }
    public LoyaltyReward Reward { get; set; } = null!;

    public int PointsSpent { get; set; }
    public LoyaltyRedemptionStatus Status { get; set; } = LoyaltyRedemptionStatus.Pending;

    /// <summary>Generated coupon code if applicable</summary>
    public string? CouponCode { get; set; }
    public DateTime? ExpiresAt { get; set; }
}
