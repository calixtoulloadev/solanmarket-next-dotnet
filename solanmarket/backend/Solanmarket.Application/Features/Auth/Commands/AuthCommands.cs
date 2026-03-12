using System.Security.Claims;
using MediatR;
using Microsoft.Extensions.Logging;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Solanmarket.Application.Common;
using Solanmarket.Application.DTOs.Auth;
using Solanmarket.Application.Interfaces;
using Solanmarket.Domain.Entities;

namespace Solanmarket.Application.Features.Auth.Commands;

// ══ Register ════════════════════════════════════════════════════════════════

public record RegisterCommand(RegisterRequest Request) : IRequest<Result<AuthResponse>>;

public class RegisterCommandHandler(
    UserManager<ApplicationUser> userManager,
    ITokenService tokenService) : IRequestHandler<RegisterCommand, Result<AuthResponse>>
{
    public async Task<Result<AuthResponse>> Handle(RegisterCommand cmd, CancellationToken ct)
    {
        var req = cmd.Request;
        if (await userManager.FindByEmailAsync(req.Email) is not null)
            return Result<AuthResponse>.Failure("Email is already registered.", 409);

        var user = new ApplicationUser
        {
            FirstName = req.FirstName,
            LastName = req.LastName,
            Email = req.Email,
            UserName = req.Email,
            Role = "Customer",
            Tier = "Bronze",
            ReferralCode = $"{req.FirstName.ToUpper()}-{Guid.NewGuid().ToString()[..6].ToUpper()}",
            CreatedAt = DateTime.UtcNow
        };

        var result = await userManager.CreateAsync(user, req.Password);
        if (!result.Succeeded)
            return Result<AuthResponse>.Failure(result.Errors.First().Description);

        await userManager.AddToRoleAsync(user, "Customer");
        var tokens = await tokenService.GenerateTokensAsync(user);

        return Result<AuthResponse>.Success(AuthHelper.BuildResponse(user, tokens));
    }
}

// ══ Login ════════════════════════════════════════════════════════════════════

public record LoginCommand(LoginRequest Request) : IRequest<Result<AuthResponse>>;

public class LoginCommandHandler(
    UserManager<ApplicationUser> userManager,
    ITokenService tokenService) : IRequestHandler<LoginCommand, Result<AuthResponse>>
{
    public async Task<Result<AuthResponse>> Handle(LoginCommand cmd, CancellationToken ct)
    {
        var req = cmd.Request;
        var user = await userManager.FindByEmailAsync(req.Email);
        if (user is null || !await userManager.CheckPasswordAsync(user, req.Password))
            return Result<AuthResponse>.Failure("Invalid email or password.", 401);

        if (!user.IsActive)
            return Result<AuthResponse>.Failure("Account is disabled.", 401);

        var tokens = await tokenService.GenerateTokensAsync(user);
        return Result<AuthResponse>.Success(AuthHelper.BuildResponse(user, tokens));
    }
}

// ══ Refresh Token ════════════════════════════════════════════════════════════

public record RefreshTokenCommand(RefreshTokenRequest Request) : IRequest<Result<AuthResponse>>;

public class RefreshTokenCommandHandler(
    ITokenService tokenService,
    UserManager<ApplicationUser> userManager) : IRequestHandler<RefreshTokenCommand, Result<AuthResponse>>
{
    public async Task<Result<AuthResponse>> Handle(RefreshTokenCommand cmd, CancellationToken ct)
    {
        var userId = await tokenService.ValidateRefreshTokenAsync(cmd.Request.RefreshToken);
        if (userId is null)
            return Result<AuthResponse>.Failure("Invalid or expired refresh token.", 401);

        var user = await userManager.FindByIdAsync(userId);
        if (user is null || !user.IsActive)
            return Result<AuthResponse>.Failure("User not found or disabled.", 401);

        var tokens = await tokenService.GenerateTokensAsync(user);
        return Result<AuthResponse>.Success(AuthHelper.BuildResponse(user, tokens));
    }
}

// ══ Logout ══════════════════════════════════════════════════════════════════

public record LogoutCommand(string RefreshToken) : IRequest<Unit>;

public class LogoutCommandHandler(ITokenService tokenService) : IRequestHandler<LogoutCommand, Unit>
{
    public async Task<Unit> Handle(LogoutCommand cmd, CancellationToken ct)
    {
        await tokenService.RevokeRefreshTokenAsync(cmd.RefreshToken);
        return Unit.Value;
    }
}

// ══ Forgot Password ══════════════════════════════════════════════════════════

public record ForgotPasswordCommand(ForgotPasswordRequest Request) : IRequest<Unit>;

public class ForgotPasswordCommandHandler(
    UserManager<ApplicationUser> userManager,
    IEmailService emailService,
    ILogger<ForgotPasswordCommandHandler> logger) : IRequestHandler<ForgotPasswordCommand, Unit>
{
    public async Task<Unit> Handle(ForgotPasswordCommand cmd, CancellationToken ct)
    {
        var user = await userManager.FindByEmailAsync(cmd.Request.Email);
        if (user is null)
        {
            logger.LogInformation("ForgotPassword: no user found for {Email}", cmd.Request.Email);
            return Unit.Value; // Silent — no user enumeration
        }

        logger.LogInformation("ForgotPassword: generating password reset token for {Email}", user.Email);
        var token = await userManager.GeneratePasswordResetTokenAsync(user);
        try
        {
            logger.LogInformation("ForgotPassword: sending password reset email to {Email}", user.Email);
            await emailService.SendPasswordResetAsync(user.Email!, token, ct);
            logger.LogInformation("ForgotPassword: send attempted for {Email}", user.Email);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "ForgotPassword: email send failed for {Email}", user.Email);
        }

        return Unit.Value;
    }
}

// ══ Reset Password ═══════════════════════════════════════════════════════════

public record ResetPasswordCommand(ResetPasswordRequest Request) : IRequest<Result>;

public class ResetPasswordCommandHandler(UserManager<ApplicationUser> userManager)
    : IRequestHandler<ResetPasswordCommand, Result>
{
    public async Task<Result> Handle(ResetPasswordCommand cmd, CancellationToken ct)
    {
        var req = cmd.Request;
        var user = await userManager.FindByEmailAsync(req.Email);
        if (user is null)
            return Result.Failure("Invalid request.");

        var result = await userManager.ResetPasswordAsync(user, req.Token, req.NewPassword);
        return result.Succeeded
            ? Result.Success()
            : Result.Failure(result.Errors.First().Description);
    }
}

// ══ Get Current User (me) ════════════════════════════════════════════════════

public record GetCurrentUserQuery : IRequest<Result<UserProfileDto>>;

public class GetCurrentUserQueryHandler(
    UserManager<ApplicationUser> userManager,
    IHttpContextAccessor httpContextAccessor) : IRequestHandler<GetCurrentUserQuery, Result<UserProfileDto>>
{
    public async Task<Result<UserProfileDto>> Handle(GetCurrentUserQuery _, CancellationToken ct)
    {
        var email = httpContextAccessor.HttpContext?.User.FindFirstValue(ClaimTypes.Email);
        if (email is null)
            return Result<UserProfileDto>.Failure("Not authenticated.", 401);

        var user = await userManager.FindByEmailAsync(email);
        if (user is null)
            return Result<UserProfileDto>.Failure("User not found.", 404);

        return Result<UserProfileDto>.Success(
            new UserProfileDto(user.Id, user.FirstName, user.LastName, user.Email!,
                               user.AvatarUrl, user.Role, user.Tier, user.LoyaltyPoints, user.ReferralCode));
    }
}

// ── Shared helper ─────────────────────────────────────────────────────────────
file static class AuthHelper
{
    internal static AuthResponse BuildResponse(ApplicationUser user, TokenResult tokens)
        => new(tokens.AccessToken, tokens.RefreshToken, tokens.ExpiresIn,
               new UserProfileDto(user.Id, user.FirstName, user.LastName, user.Email!,
                                  user.AvatarUrl, user.Role, user.Tier, user.LoyaltyPoints, user.ReferralCode));
}
