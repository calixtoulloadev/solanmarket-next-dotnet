namespace Solanmarket.Domain.Interfaces;

/// <summary>
/// Manages the product/price catalog in a payment provider (Stripe implementation in Infrastructure).
/// </summary>
public interface IPaymentCatalogService
{
    /// <summary>Creates a Product in the payment provider. Returns the provider Product ID.</summary>
    Task<string> CreateProductAsync(string name, string? description, string? imageUrl, Guid internalId, CancellationToken ct = default);

    /// <summary>Updates name, description and/or images of an existing provider Product.</summary>
    Task UpdateProductAsync(string stripeProductId, string name, string? description, string? imageUrl, CancellationToken ct = default);

    /// <summary>
    /// Creates a new Price for the product (Stripe Prices are immutable).
    /// Returns the new provider Price ID.
    /// </summary>
    Task<string> CreatePriceAsync(string stripeProductId, decimal amount, string currency = "usd", CancellationToken ct = default);

    /// <summary>Archives (deactivates) a provider Product. Does not permanently delete it.</summary>
    Task ArchiveProductAsync(string stripeProductId, CancellationToken ct = default);
}
