using MediatR;
using Solanmarket.Application.Common;
using Solanmarket.Application.DTOs.Catalog;

namespace Solanmarket.Application.Features.Wishlist;

// Request/Command records — handlers are in Solanmarket.Infrastructure (need DbContext with Include)

public record GetWishlistQuery : IRequest<Result<IEnumerable<ProductListItemDto>>>;

public record AddWishlistItemCommand(Guid ProductId) : IRequest<Result<bool>>;

public record RemoveWishlistItemCommand(Guid ProductId) : IRequest<Result<bool>>;
