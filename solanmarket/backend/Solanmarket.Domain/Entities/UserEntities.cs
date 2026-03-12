using Solanmarket.Domain.Common;

namespace Solanmarket.Domain.Entities;

public class WishlistItem : BaseEntity
{
    public Guid UserId { get; set; }
    public ApplicationUser User { get; set; } = null!;
    public Guid ProductId { get; set; }
    public Product Product { get; set; } = null!;
}

public class Address : BaseEntity
{
    public Guid UserId { get; set; }
    public ApplicationUser User { get; set; } = null!;

    /// <summary>Home | Work | Other</summary>
    public string Label { get; set; } = "Home";
    public string Street { get; set; } = string.Empty;
    public string City { get; set; } = string.Empty;
    public string? State { get; set; }
    public string? ZipCode { get; set; }
    public string Country { get; set; } = string.Empty;
    public bool IsDefault { get; set; } = false;
}

public class SavedPayment : BaseEntity
{
    public Guid UserId { get; set; }
    public ApplicationUser User { get; set; } = null!;

    /// <summary>Visa | Mastercard | PayPal | ApplePay | GooglePay</summary>
    public string Type { get; set; } = string.Empty;
    public string? Last4 { get; set; }

    /// <summary>Stripe Customer ID</summary>
    public string? StripeCustomerId { get; set; }

    /// <summary>Stripe PaymentMethod ID (stored securely)</summary>
    public string? StripePaymentMethodId { get; set; }

    public bool IsDefault { get; set; } = false;
}

public class RefreshToken : BaseEntity
{
    public Guid UserId { get; set; }
    public ApplicationUser User { get; set; } = null!;

    public string Token { get; set; } = string.Empty;
    public DateTime ExpiresAt { get; set; }
    public bool IsRevoked { get; set; } = false;
}
