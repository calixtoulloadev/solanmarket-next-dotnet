namespace Solanmarket.Domain.Common;

/// <summary>Base entity with UUID primary key and audit timestamps.</summary>
public abstract class BaseEntity
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }
    public DateTime? DeletedAt { get; set; }   // soft-delete

    public bool IsDeleted => DeletedAt.HasValue;
}
