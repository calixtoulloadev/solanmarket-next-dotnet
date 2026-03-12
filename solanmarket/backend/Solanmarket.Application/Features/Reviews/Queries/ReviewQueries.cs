using MediatR;
using Solanmarket.Application.Common;

namespace Solanmarket.Application.Features.Reviews.Queries;

public record ReviewDto(Guid Id, Guid UserId, string UserFullName, int Rating, string? Title, string? Body, DateTime CreatedAt, bool IsVerifiedPurchase);

public record AdminReviewDto(
    Guid Id, Guid ProductId, string ProductName,
    string UserFirstName, string UserLastName,
    int Rating, string? Title, string? Body, string Status, DateTime CreatedAt);

public record GetProductReviewsQuery(Guid ProductId, int Page, int PageSize) : IRequest<Result<PagedResult<ReviewDto>>>;
public record GetAdminReviewsQuery(int Page, int PageSize, string? Status) : IRequest<Result<PagedResult<AdminReviewDto>>>;

public class GetProductReviewsQueryHandler : IRequestHandler<GetProductReviewsQuery, Result<PagedResult<ReviewDto>>>
{
    public Task<Result<PagedResult<ReviewDto>>> Handle(GetProductReviewsQuery request, CancellationToken ct)
        => Task.FromResult(Result<PagedResult<ReviewDto>>.Success(
               new PagedResult<ReviewDto>([], 0, request.Page, request.PageSize)));
}
// GetAdminReviewsQueryHandler is in Solanmarket.Infrastructure (needs EF Include)
