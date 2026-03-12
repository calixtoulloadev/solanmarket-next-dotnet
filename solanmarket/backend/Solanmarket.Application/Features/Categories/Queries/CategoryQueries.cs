using MediatR;
using Solanmarket.Application.Common;
using Solanmarket.Application.DTOs.Catalog;
using Solanmarket.Application.Features.Categories.Commands;
using Solanmarket.Domain.Interfaces;

namespace Solanmarket.Application.Features.Categories.Queries;

public record GetCategoryTreeQuery : IRequest<Result<IEnumerable<CategoryDto>>>;
public record GetCategoriesFlatQuery : IRequest<Result<IEnumerable<CategoryDto>>>;
public record GetCategoryByIdQuery(Guid Id) : IRequest<Result<CategoryDto>>;

public class GetCategoryTreeQueryHandler(IUnitOfWork uow)
    : IRequestHandler<GetCategoryTreeQuery, Result<IEnumerable<CategoryDto>>>
{
    public async Task<Result<IEnumerable<CategoryDto>>> Handle(GetCategoryTreeQuery request, CancellationToken ct)
    {
        var all = await uow.Categories.GetAllAsync(ct);
        var roots = all
            .Where(c => c.ParentId == null)
            .OrderBy(c => c.SortOrder)
            .Select(c => c.ToDto())
            .ToList();
        return Result<IEnumerable<CategoryDto>>.Success(roots);
    }
}

public class GetCategoriesFlatQueryHandler(IUnitOfWork uow)
    : IRequestHandler<GetCategoriesFlatQuery, Result<IEnumerable<CategoryDto>>>
{
    public async Task<Result<IEnumerable<CategoryDto>>> Handle(GetCategoriesFlatQuery request, CancellationToken ct)
    {
        var all = await uow.Categories.GetAllAsync(ct);
        var dtos = all.OrderBy(c => c.SortOrder).Select(c => c.ToDto()).ToList();
        return Result<IEnumerable<CategoryDto>>.Success(dtos);
    }
}

public class GetCategoryByIdQueryHandler(IUnitOfWork uow)
    : IRequestHandler<GetCategoryByIdQuery, Result<CategoryDto>>
{
    public async Task<Result<CategoryDto>> Handle(GetCategoryByIdQuery request, CancellationToken ct)
    {
        var category = await uow.Categories.GetByIdAsync(request.Id, ct);
        return category is null
            ? Result<CategoryDto>.Failure("Category not found.", 404)
            : Result<CategoryDto>.Success(category.ToDto());
    }
}
