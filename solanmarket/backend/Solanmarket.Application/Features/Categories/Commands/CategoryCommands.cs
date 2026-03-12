using MediatR;
using Solanmarket.Application.Common;
using Solanmarket.Application.DTOs.Catalog;
using Solanmarket.Domain.Entities;
using Solanmarket.Domain.Interfaces;

namespace Solanmarket.Application.Features.Categories.Commands;

// ── Request DTOs ──────────────────────────────────────────────────────────────

public record CreateCategoryRequest(
    string Name,
    string Slug,
    string? Description,
    string? IconEmoji,
    Guid? ParentId,
    int SortOrder = 0);

public record UpdateCategoryRequest(
    string Name,
    string Slug,
    string? Description,
    string? IconEmoji,
    Guid? ParentId,
    int SortOrder);

// ── Commands ──────────────────────────────────────────────────────────────────

public record CreateCategoryCommand(CreateCategoryRequest Request) : IRequest<Result<CategoryDto>>;
public record UpdateCategoryCommand(Guid Id, UpdateCategoryRequest Request) : IRequest<Result<CategoryDto>>;
public record DeleteCategoryCommand(Guid Id) : IRequest<Result>;

// ── Handlers ──────────────────────────────────────────────────────────────────

public class CreateCategoryCommandHandler(IUnitOfWork uow)
    : IRequestHandler<CreateCategoryCommand, Result<CategoryDto>>
{
    public async Task<Result<CategoryDto>> Handle(CreateCategoryCommand cmd, CancellationToken ct)
    {
        var req = cmd.Request;

        if (await uow.Categories.ExistsAsync(c => c.Slug == req.Slug, ct))
            return Result<CategoryDto>.Failure($"A category with slug '{req.Slug}' already exists.", 409);

        var category = new Category
        {
            Name = req.Name,
            Slug = req.Slug,
            IconEmoji = req.IconEmoji,
            ParentId = req.ParentId,
            SortOrder = req.SortOrder,
            IsActive = true,
        };

        await uow.Categories.AddAsync(category, ct);
        await uow.SaveChangesAsync(ct);

        return Result<CategoryDto>.Success(category.ToDto());
    }
}

public class UpdateCategoryCommandHandler(IUnitOfWork uow)
    : IRequestHandler<UpdateCategoryCommand, Result<CategoryDto>>
{
    public async Task<Result<CategoryDto>> Handle(UpdateCategoryCommand cmd, CancellationToken ct)
    {
        var category = await uow.Categories.GetByIdAsync(cmd.Id, ct);
        if (category is null)
            return Result<CategoryDto>.Failure("Category not found.", 404);

        var req = cmd.Request;

        if (await uow.Categories.ExistsAsync(c => c.Slug == req.Slug && c.Id != cmd.Id, ct))
            return Result<CategoryDto>.Failure($"A category with slug '{req.Slug}' already exists.", 409);

        category.Name = req.Name;
        category.Slug = req.Slug;
        category.IconEmoji = req.IconEmoji;
        category.ParentId = req.ParentId;
        category.SortOrder = req.SortOrder;

        await uow.Categories.UpdateAsync(category, ct);
        await uow.SaveChangesAsync(ct);

        return Result<CategoryDto>.Success(category.ToDto());
    }
}

public class DeleteCategoryCommandHandler(IUnitOfWork uow)
    : IRequestHandler<DeleteCategoryCommand, Result>
{
    public async Task<Result> Handle(DeleteCategoryCommand cmd, CancellationToken ct)
    {
        var category = await uow.Categories.GetByIdAsync(cmd.Id, ct);
        if (category is null)
            return Result.Failure("Category not found.", 404);

        await uow.Categories.DeleteAsync(category, ct);
        await uow.SaveChangesAsync(ct);

        return Result.Success();
    }
}

// ── Mapper extension ──────────────────────────────────────────────────────────

internal static class CategoryExtensions
{
    internal static CategoryDto ToDto(this Category c) =>
        new(c.Id, c.Name, c.Slug, c.IconEmoji, c.ParentId, c.SortOrder,
            c.Children.Select(ch => ch.ToDto()));
}
