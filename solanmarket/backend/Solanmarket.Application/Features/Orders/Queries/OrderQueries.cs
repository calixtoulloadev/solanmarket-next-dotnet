using MediatR;
using Solanmarket.Application.Common;
using Solanmarket.Application.DTOs.Orders;

namespace Solanmarket.Application.Features.Orders.Queries;

public record GetMyOrdersQuery(int Page, int PageSize) : IRequest<Result<PagedResult<OrderSummaryDto>>>;
public record GetOrderByIdQuery(Guid Id) : IRequest<Result<OrderDetailDto>>;
public record GetAllOrdersQuery(int Page, int PageSize, string? Status) : IRequest<Result<PagedResult<OrderSummaryDto>>>;
public record ValidateCouponQuery(ValidateCouponRequest Request) : IRequest<Result<ValidateCouponResponse>>;

public class GetMyOrdersQueryHandler : IRequestHandler<GetMyOrdersQuery, Result<PagedResult<OrderSummaryDto>>>
{
    public Task<Result<PagedResult<OrderSummaryDto>>> Handle(GetMyOrdersQuery request, CancellationToken ct)
        => Task.FromResult(Result<PagedResult<OrderSummaryDto>>.Success(
               new PagedResult<OrderSummaryDto>([], 0, request.Page, request.PageSize)));
}

public class GetOrderByIdQueryHandler : IRequestHandler<GetOrderByIdQuery, Result<OrderDetailDto>>
{
    public Task<Result<OrderDetailDto>> Handle(GetOrderByIdQuery request, CancellationToken ct)
        => Task.FromResult(Result<OrderDetailDto>.Failure("Not found.", 404));
}

public class GetAllOrdersQueryHandler : IRequestHandler<GetAllOrdersQuery, Result<PagedResult<OrderSummaryDto>>>
{
    public Task<Result<PagedResult<OrderSummaryDto>>> Handle(GetAllOrdersQuery request, CancellationToken ct)
        => Task.FromResult(Result<PagedResult<OrderSummaryDto>>.Success(
               new PagedResult<OrderSummaryDto>([], 0, request.Page, request.PageSize)));
}

public class ValidateCouponQueryHandler : IRequestHandler<ValidateCouponQuery, Result<ValidateCouponResponse>>
{
    public Task<Result<ValidateCouponResponse>> Handle(ValidateCouponQuery request, CancellationToken ct)
        => Task.FromResult(Result<ValidateCouponResponse>.Failure("Coupon not found.", 404));
}
