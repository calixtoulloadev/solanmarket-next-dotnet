using System.Security.Claims;
using MediatR;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Solanmarket.Application.Common;
using Solanmarket.Application.DTOs.Catalog;
using Solanmarket.Application.Features.Wishlist;
using Solanmarket.Domain.Entities;
using Solanmarket.Infrastructure.Persistence;

namespace Solanmarket.Infrastructure.Features.Wishlist;

// ── Get Wishlist ──────────────────────────────────────────────────────────────

public class GetWishlistQueryHandler(
    SolanmarketDbContext context,
    UserManager<ApplicationUser> userManager,
    IHttpContextAccessor httpContextAccessor) : IRequestHandler<GetWishlistQuery, Result<IEnumerable<ProductListItemDto>>>
{
    public async Task<Result<IEnumerable<ProductListItemDto>>> Handle(GetWishlistQuery _, CancellationToken ct)
    {
        var email = httpContextAccessor.HttpContext?.User.FindFirstValue(ClaimTypes.Email);
        if (email is null)
            return Result<IEnumerable<ProductListItemDto>>.Failure("Not authenticated.", 401);

        var user = await userManager.FindByEmailAsync(email);
        if (user is null)
            return Result<IEnumerable<ProductListItemDto>>.Failure("User not found.", 404);

        var items = await context.WishlistItems
            .Where(w => w.UserId == user.Id && w.DeletedAt == null)
            .Include(w => w.Product).ThenInclude(p => p.Images)
            .Include(w => w.Product).ThenInclude(p => p.Variants)
            .Include(w => w.Product).ThenInclude(p => p.Category)
            .ToListAsync(ct);

        var dtos = items.Select(w =>
        {
            var p = w.Product;
            var mainImage = p.Images.FirstOrDefault(i => i.IsMain)?.Url ?? p.Images.FirstOrDefault()?.Url;
            return new ProductListItemDto(
                p.Id, p.Name, p.Slug, p.Brand,
                p.Category?.Name ?? string.Empty,
                p.Price, p.OriginalPrice, p.DiscountPercent,
                p.Rating, p.ReviewCount,
                mainImage,
                p.Status.ToString(),
                p.IsPublished, p.IsFeatured,
                p.Variants.Sum(v => v.Stock));
        });

        return Result<IEnumerable<ProductListItemDto>>.Success(dtos);
    }
}

// ── Add Wishlist Item ─────────────────────────────────────────────────────────

public class AddWishlistItemCommandHandler(
    SolanmarketDbContext context,
    UserManager<ApplicationUser> userManager,
    IHttpContextAccessor httpContextAccessor) : IRequestHandler<AddWishlistItemCommand, Result<bool>>
{
    public async Task<Result<bool>> Handle(AddWishlistItemCommand cmd, CancellationToken ct)
    {
        var email = httpContextAccessor.HttpContext?.User.FindFirstValue(ClaimTypes.Email);
        if (email is null)
            return Result<bool>.Failure("Not authenticated.", 401);

        var user = await userManager.FindByEmailAsync(email);
        if (user is null)
            return Result<bool>.Failure("User not found.", 404);

        var exists = await context.WishlistItems
            .AnyAsync(w => w.UserId == user.Id && w.ProductId == cmd.ProductId && w.DeletedAt == null, ct);

        if (exists)
            return Result<bool>.Success(true);

        var productExists = await context.Products
            .AnyAsync(p => p.Id == cmd.ProductId && p.DeletedAt == null, ct);

        if (!productExists)
            return Result<bool>.Failure("Product not found.", 404);

        context.WishlistItems.Add(new WishlistItem { UserId = user.Id, ProductId = cmd.ProductId });
        await context.SaveChangesAsync(ct);

        return Result<bool>.Success(true);
    }
}

// ── Remove Wishlist Item ──────────────────────────────────────────────────────

public class RemoveWishlistItemCommandHandler(
    SolanmarketDbContext context,
    UserManager<ApplicationUser> userManager,
    IHttpContextAccessor httpContextAccessor) : IRequestHandler<RemoveWishlistItemCommand, Result<bool>>
{
    public async Task<Result<bool>> Handle(RemoveWishlistItemCommand cmd, CancellationToken ct)
    {
        var email = httpContextAccessor.HttpContext?.User.FindFirstValue(ClaimTypes.Email);
        if (email is null)
            return Result<bool>.Failure("Not authenticated.", 401);

        var user = await userManager.FindByEmailAsync(email);
        if (user is null)
            return Result<bool>.Failure("User not found.", 404);

        var item = await context.WishlistItems
            .FirstOrDefaultAsync(w => w.UserId == user.Id && w.ProductId == cmd.ProductId && w.DeletedAt == null, ct);

        if (item is null)
            return Result<bool>.Success(false);

        context.WishlistItems.Remove(item);
        await context.SaveChangesAsync(ct);

        return Result<bool>.Success(true);
    }
}
