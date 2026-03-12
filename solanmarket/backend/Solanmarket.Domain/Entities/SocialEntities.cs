using Solanmarket.Domain.Common;
using Solanmarket.Domain.Enums;

namespace Solanmarket.Domain.Entities;

public class Review : BaseEntity
{
    public Guid UserId { get; set; }
    public ApplicationUser User { get; set; } = null!;

    public Guid ProductId { get; set; }
    public Product Product { get; set; } = null!;

    /// <summary>Linked order – used to verify the user actually bought the product</summary>
    public Guid? OrderId { get; set; }
    public Order? Order { get; set; }

    public int Rating { get; set; }   // 1-5
    public string? Title { get; set; }
    public string? Comment { get; set; }
    public bool IsVerified { get; set; } = false;
    public bool IsApproved { get; set; } = true;
}

public class Notification : BaseEntity
{
    public Guid UserId { get; set; }
    public ApplicationUser User { get; set; } = null!;

    public NotificationType Type { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
    public bool IsRead { get; set; } = false;

    /// <summary>Extra metadata as JSON (e.g. orderId, productId)</summary>
    public string? Data { get; set; }
    public string? IconType { get; set; }
    public DateTime? ReadAt { get; set; }
}

public class SupportTicket : BaseEntity
{
    public Guid UserId { get; set; }
    public ApplicationUser User { get; set; } = null!;

    public Guid? OrderId { get; set; }
    public Order? Order { get; set; }

    public string Subject { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
    public SupportTicketStatus Status { get; set; } = SupportTicketStatus.Open;
    public SupportPriority Priority { get; set; } = SupportPriority.Medium;
    public DateTime? ResolvedAt { get; set; }

    // Navigation
    public ICollection<SupportMessage> Messages { get; set; } = [];
}

public class SupportMessage : BaseEntity
{
    public Guid TicketId { get; set; }
    public SupportTicket Ticket { get; set; } = null!;

    public Guid UserId { get; set; }
    public ApplicationUser User { get; set; } = null!;

    public string Message { get; set; } = string.Empty;
    public bool IsFromAgent { get; set; } = false;
}
