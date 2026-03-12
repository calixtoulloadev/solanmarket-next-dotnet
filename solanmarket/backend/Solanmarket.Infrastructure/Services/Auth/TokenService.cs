using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using Solanmarket.Application.Interfaces;
using Solanmarket.Domain.Entities;
using Solanmarket.Infrastructure.Persistence;

namespace Solanmarket.Infrastructure.Services.Auth;

public class TokenService : ITokenService
{
    private readonly IConfiguration _config;
    private readonly SolanmarketDbContext _db;
    private readonly UserManager<ApplicationUser> _userManager;

    public TokenService(IConfiguration config, SolanmarketDbContext db, UserManager<ApplicationUser> userManager)
    {
        _config = config;
        _db = db;
        _userManager = userManager;
    }

    public async Task<TokenResult> GenerateTokensAsync(ApplicationUser user)
    {
        var jwtSection = _config.GetSection("Jwt");
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSection["Key"]!));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
        var expiryMinutes = int.Parse(jwtSection["AccessTokenExpiryMinutes"] ?? "15");

        var claims = new List<Claim>
        {
            new(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
            new(JwtRegisteredClaimNames.Email, user.Email!),
            new(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
            new(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new("firstName", user.FirstName),
            new("lastName", user.LastName),
        };

        var roles = await _userManager.GetRolesAsync(user);
        // Primary role stored in ApplicationUser.Role; also add Identity roles
        claims.Add(new Claim(ClaimTypes.Role, user.Role));
        foreach (var role in roles.Where(r => r != user.Role))
            claims.Add(new Claim(ClaimTypes.Role, role));

        var jwtToken = new JwtSecurityToken(
            issuer: jwtSection["Issuer"],
            audience: jwtSection["Audience"],
            claims: claims,
            expires: DateTime.UtcNow.AddMinutes(expiryMinutes),
            signingCredentials: creds);

        var accessToken = new JwtSecurityTokenHandler().WriteToken(jwtToken);

        var refreshDays = int.Parse(jwtSection["RefreshTokenExpiryDays"] ?? "7");
        var refreshTokenValue = Convert.ToBase64String(RandomNumberGenerator.GetBytes(64));

        _db.RefreshTokens.Add(new RefreshToken
        {
            UserId = user.Id,
            Token = refreshTokenValue,
            ExpiresAt = DateTime.UtcNow.AddDays(refreshDays),
        });
        await _db.SaveChangesAsync();

        return new TokenResult(accessToken, refreshTokenValue, expiryMinutes * 60);
    }

    public async Task<string?> ValidateRefreshTokenAsync(string refreshToken)
    {
        var token = await _db.RefreshTokens
            .FirstOrDefaultAsync(t => t.Token == refreshToken
                                   && !t.IsRevoked
                                   && t.ExpiresAt > DateTime.UtcNow);
        return token?.UserId.ToString();
    }

    public async Task RevokeRefreshTokenAsync(string refreshToken)
    {
        var token = await _db.RefreshTokens
            .FirstOrDefaultAsync(t => t.Token == refreshToken);
        if (token is null) return;

        token.IsRevoked = true;
        await _db.SaveChangesAsync();
    }
}
