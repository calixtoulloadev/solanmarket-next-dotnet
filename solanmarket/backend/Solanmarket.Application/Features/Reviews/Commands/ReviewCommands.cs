using MediatR;
using Solanmarket.Application.Common;
using Solanmarket.Application.Features.Reviews.Queries;
using Solanmarket.Domain.Interfaces;

namespace Solanmarket.Application.Features.Reviews.Commands;

public record CreateReviewRequest(int Rating, string? Title, string? Body, Guid? OrderId);
public record UpdateReviewStatusRequest(string Status); // "Approved" | "Rejected"

public record CreateReviewCommand(Guid ProductId, CreateReviewRequest Request) : IRequest<Result<ReviewDto>>;
public record DeleteReviewCommand(Guid ReviewId) : IRequest<Result>;
public record UpdateReviewStatusCommand(Guid ReviewId, string Status) : IRequest<Result>;

public class CreateReviewCommandHandler : IRequestHandler<CreateReviewCommand, Result<ReviewDto>>
{
    public Task<Result<ReviewDto>> Handle(CreateReviewCommand request, CancellationToken ct)
        => Task.FromResult(Result<ReviewDto>.Failure("Not implemented yet.", 501));
}

public class DeleteReviewCommandHandler : IRequestHandler<DeleteReviewCommand, Result>
{
    public Task<Result> Handle(DeleteReviewCommand request, CancellationToken ct)
        => Task.FromResult(Result.Failure("Not implemented yet.", 501));
}

public class UpdateReviewStatusCommandHandler(IUnitOfWork uow) : IRequestHandler<UpdateReviewStatusCommand, Result>
{
    public async Task<Result> Handle(UpdateReviewStatusCommand cmd, CancellationToken ct)
    {
        var review = await uow.Reviews.GetByIdAsync(cmd.ReviewId, ct);
        if (review is null)
            return Result.Failure("Review not found.", 404);

        review.IsApproved = cmd.Status.Equals("Approved", StringComparison.OrdinalIgnoreCase);
        await uow.Reviews.UpdateAsync(review, ct);
        await uow.SaveChangesAsync(ct);

        return Result.Success();
    }
}
