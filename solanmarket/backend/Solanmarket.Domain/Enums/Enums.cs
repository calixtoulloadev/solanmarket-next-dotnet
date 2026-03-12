namespace Solanmarket.Domain.Enums;

public enum UserRole { Customer, Seller, Admin }
public enum UserTier { Bronze, Silver, VIP, Elite }

public enum OrderStatus
{
    Processing,
    Shipped,
    Delivered,
    Cancelled,
    Refunded
}

public enum ShippingMethod { Standard, Express, NextDay, Pickup }
public enum PaymentType { Card, PayPal, ApplePay, GooglePay, BankTransfer, Cash }

public enum ProductStatus { Active, Draft, Archived }

public enum DiscountType { Percentage, Fixed, BOGO, FreeShipping }

public enum TransferStatus { Pending, InTransit, Done, Cancelled }

public enum PurchaseOrderStatus
{
    Draft,
    Pending,
    Approved,
    Shipped,
    Received,
    Cancelled
}

public enum CreditNoteType { Supplier, Customer }
public enum CreditNoteStatus { Pending, Approved, Applied, Rejected }

public enum SupplierStatus { Active, Inactive, Blacklisted }

public enum LoyaltyTransactionType
{
    Purchase,
    Review,
    Referral,
    Redemption,
    Birthday,
    Adjustment
}

public enum LoyaltyRewardType { Discount, FreeShipping, GiftCard }
public enum LoyaltyRedemptionStatus { Pending, Applied, Expired }

public enum NotificationType { Order, Promo, Loyalty, System, Review }

public enum SupportTicketStatus { Open, InProgress, Resolved, Closed }
public enum SupportPriority { Low, Medium, High, Urgent }
