namespace Solanmarket.Application.Interfaces;

/// <summary>Token pair returned by the token service.</summary>
public record TokenResult(string AccessToken, string RefreshToken, int ExpiresIn);

/// <summary>
/// Abstraction over JWT + Refresh Token generation.
/// Implemented in Infrastructure.Services.Auth.
/// </summary>
public interface ITokenService
{
    Task<TokenResult> GenerateTokensAsync(Domain.Entities.ApplicationUser user);
    /// <summary>Returns the user ID if the refresh token is valid and not revoked, otherwise null.</summary>
    Task<string?> ValidateRefreshTokenAsync(string refreshToken);
    Task RevokeRefreshTokenAsync(string refreshToken);
}
