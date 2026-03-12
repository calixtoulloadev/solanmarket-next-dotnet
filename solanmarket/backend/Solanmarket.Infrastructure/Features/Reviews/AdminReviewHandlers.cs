using MediatR;
using Microsoft.EntityFrameworkCore;
using Solanmarket.Application.Common;
using Solanmarket.Application.Features.Reviews.Queries;
using Solanmarket.Infrastructure.Persistence;

namespace Solanmarket.Infrastructure.Features.Reviews;

public class GetAdminReviewsQueryHandler(SolanmarketDbContext context)
    : IRequestHandler<GetAdminReviewsQuery, Result<PagedResult<AdminReviewDto>>>
{
    public async Task<Result<PagedResult<AdminReviewDto>>> Handle(GetAdminReviewsQuery request, CancellationToken ct)
    {
        var query = context.Reviews
            .Where(r => r.DeletedAt == null)
            .Include(r => r.User)
            .Include(r => r.Product)
            .AsQueryable();

        if (!string.IsNullOrEmpty(request.Status) &&
            !request.Status.Equals("All", StringComparison.OrdinalIgnoreCase))
        {
            var approved = request.Status.Equals("Approved", StringComparison.OrdinalIgnoreCase);
            query = query.Where(r => r.IsApproved == approved);
        }

        var total = await query.CountAsync(ct);
        var items = await query
            .OrderByDescending(r => r.CreatedAt)
            .Skip((request.Page - 1) * request.PageSize)
            .Take(request.PageSize)
            .Select(r => new AdminReviewDto(
                r.Id,
                r.ProductId,
                r.Product.Name,
                r.User.FirstName,
                r.User.LastName,
                r.Rating,
                r.Title,
                r.Comment,
                r.IsApproved ? "Approved" : "Pending",
                r.CreatedAt))
            .ToListAsync(ct);

        return Result<PagedResult<AdminReviewDto>>.Success(
            new PagedResult<AdminReviewDto>(items, total, request.Page, request.PageSize));
    }
}
