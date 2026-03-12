using MediatR;
using Solanmarket.Application.Common;
using Solanmarket.Application.DTOs.Catalog;

namespace Solanmarket.Application.Features.Products.Queries;

// ── Already implemented in ProductQueries.cs:
//    GetProductsQuery, GetProductBySlugQuery
// ── Stubs below ──────────────────────────────────────────────────────────────

public record GetRelatedProductsQuery(Guid ProductId) : IRequest<Result<IEnumerable<ProductListItemDto>>>;

public class GetRelatedProductsQueryHandler : IRequestHandler<GetRelatedProductsQuery, Result<IEnumerable<ProductListItemDto>>>
{
    public Task<Result<IEnumerable<ProductListItemDto>>> Handle(GetRelatedProductsQuery request, CancellationToken ct)
        => Task.FromResult(Result<IEnumerable<ProductListItemDto>>.Success([]));
}
