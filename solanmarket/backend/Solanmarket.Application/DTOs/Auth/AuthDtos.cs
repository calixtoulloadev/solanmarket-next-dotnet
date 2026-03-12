namespace Solanmarket.Application.DTOs.Auth;

// ── Requests ────────────────────────────────────────────────────────────────

public record RegisterRequest(
    string FirstName,
    string LastName,
    string Email,
    string Password
);

public record LoginRequest(
    string Email,
    string Password
);

public record ForgotPasswordRequest(string Email);

public record ResetPasswordRequest(
    string Email,
    string Token,
    string NewPassword
);

public record RefreshTokenRequest(string RefreshToken);

// ── Responses ───────────────────────────────────────────────────────────────

public record AuthResponse(
    string AccessToken,
    string RefreshToken,
    int ExpiresIn,      // seconds
    UserProfileDto User
);

public record UserProfileDto(
    Guid Id,
    string FirstName,
    string LastName,
    string Email,
    string? AvatarUrl,
    string Role,
    string Tier,
    int LoyaltyPoints,
    string? ReferralCode
);
