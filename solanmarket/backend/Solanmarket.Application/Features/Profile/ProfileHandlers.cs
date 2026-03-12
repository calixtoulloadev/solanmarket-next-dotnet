using System.Security.Claims;
using MediatR;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Solanmarket.Application.Common;
using Solanmarket.Domain.Entities;

namespace Solanmarket.Application.Features.Profile;

// ── DTOs ─────────────────────────────────────────────────────────────────────

public record ProfileDto(
    Guid Id,
    string FirstName,
    string LastName,
    string Email,
    string? Phone,
    string? AvatarUrl);

public record UpdateProfileRequest(
    string FirstName,
    string LastName,
    string? Phone);

// ── Get Profile ───────────────────────────────────────────────────────────────

public record GetProfileQuery : IRequest<Result<ProfileDto>>;

public class GetProfileQueryHandler(
    UserManager<ApplicationUser> userManager,
    IHttpContextAccessor httpContextAccessor) : IRequestHandler<GetProfileQuery, Result<ProfileDto>>
{
    public async Task<Result<ProfileDto>> Handle(GetProfileQuery _, CancellationToken ct)
    {
        var email = httpContextAccessor.HttpContext?.User.FindFirstValue(ClaimTypes.Email);
        if (email is null)
            return Result<ProfileDto>.Failure("Not authenticated.", 401);

        var user = await userManager.FindByEmailAsync(email);
        if (user is null)
            return Result<ProfileDto>.Failure("User not found.", 404);

        return Result<ProfileDto>.Success(
            new ProfileDto(user.Id, user.FirstName, user.LastName, user.Email!,
                           user.Phone, user.AvatarUrl));
    }
}

// ── Update Profile ────────────────────────────────────────────────────────────

public record UpdateProfileCommand(UpdateProfileRequest Request) : IRequest<Result<ProfileDto>>;

public class UpdateProfileCommandHandler(
    UserManager<ApplicationUser> userManager,
    IHttpContextAccessor httpContextAccessor) : IRequestHandler<UpdateProfileCommand, Result<ProfileDto>>
{
    public async Task<Result<ProfileDto>> Handle(UpdateProfileCommand cmd, CancellationToken ct)
    {
        var email = httpContextAccessor.HttpContext?.User.FindFirstValue(ClaimTypes.Email);
        if (email is null)
            return Result<ProfileDto>.Failure("Not authenticated.", 401);

        var user = await userManager.FindByEmailAsync(email);
        if (user is null)
            return Result<ProfileDto>.Failure("User not found.", 404);

        user.FirstName = cmd.Request.FirstName;
        user.LastName = cmd.Request.LastName;
        user.Phone = cmd.Request.Phone;
        user.UpdatedAt = DateTime.UtcNow;

        var result = await userManager.UpdateAsync(user);
        if (!result.Succeeded)
            return Result<ProfileDto>.Failure(result.Errors.First().Description);

        return Result<ProfileDto>.Success(
            new ProfileDto(user.Id, user.FirstName, user.LastName, user.Email!,
                           user.Phone, user.AvatarUrl));
    }
}
