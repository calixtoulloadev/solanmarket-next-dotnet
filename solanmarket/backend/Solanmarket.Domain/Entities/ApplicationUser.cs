using Microsoft.AspNetCore.Identity;

namespace Solanmarket.Domain.Entities;

/// <summary>
/// Application user – extends ASP.NET Core Identity IdentityUser with
/// e-commerce specific fields.
/// </summary>
public class ApplicationUser : IdentityUser<Guid>
{
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string? AvatarUrl { get; set; }
    public string? Phone { get; set; }

    /// <summary>Customer | Seller | Admin</summary>
    public string Role { get; set; } = "Customer";

    /// <summary>Bronze | Silver | VIP | Elite</summary>
    public string Tier { get; set; } = "Bronze";

    public int LoyaltyPoints { get; set; } = 0;

    /// <summary>Unique referral code (e.g. SOFIA-REF-2026)</summary>
    public string? ReferralCode { get; set; }

    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }

    // Navigation
    public ICollection<Address> Addresses { get; set; } = [];
    public ICollection<SavedPayment> SavedPayments { get; set; } = [];
    public ICollection<Order> Orders { get; set; } = [];
    public ICollection<Review> Reviews { get; set; } = [];
    public ICollection<Notification> Notifications { get; set; } = [];
    public ICollection<LoyaltyTransaction> LoyaltyTransactions { get; set; } = [];
    public ICollection<LoyaltyRedemption> LoyaltyRedemptions { get; set; } = [];
    public ICollection<SupportTicket> SupportTickets { get; set; } = [];
    public ICollection<RefreshToken> RefreshTokens { get; set; } = [];
}
