using Microsoft.Extensions.Configuration;
using Solanmarket.Domain.Interfaces;
using Stripe;

namespace Solanmarket.Infrastructure.Services.Payment;

/// <summary>
/// Manages the product catalog in Stripe (Products + Prices).
/// Configuration keys: Stripe:SecretKey.
/// </summary>
public sealed class StripeCatalogService : IPaymentCatalogService
{
    private readonly ProductService _productService;
    private readonly PriceService _priceService;

    public StripeCatalogService(IConfiguration configuration)
    {
        var secretKey = configuration["Stripe:SecretKey"]
            ?? throw new InvalidOperationException("Stripe:SecretKey is not configured.");

        var client = new StripeClient(secretKey);
        _productService = new ProductService(client);
        _priceService = new PriceService(client);
    }

    public async Task<string> CreateProductAsync(
        string name, string? description, string? imageUrl, Guid internalId, CancellationToken ct = default)
    {
        var options = new ProductCreateOptions
        {
            Name = name,
            Description = description,
            Images = imageUrl is not null ? [imageUrl] : null,
            Metadata = new Dictionary<string, string> { ["internalId"] = internalId.ToString() },
        };

        var product = await _productService.CreateAsync(options, cancellationToken: ct);
        return product.Id;
    }

    public async Task UpdateProductAsync(
        string stripeProductId, string name, string? description, string? imageUrl, CancellationToken ct = default)
    {
        var options = new ProductUpdateOptions
        {
            Name = name,
            Description = description,
            Images = imageUrl is not null ? [imageUrl] : null,
        };

        await _productService.UpdateAsync(stripeProductId, options, cancellationToken: ct);
    }

    public async Task<string> CreatePriceAsync(
        string stripeProductId, decimal amount, string currency = "usd", CancellationToken ct = default)
    {
        var options = new PriceCreateOptions
        {
            Product = stripeProductId,
            UnitAmount = (long)(amount * 100), // Stripe uses smallest currency unit
            Currency = currency,
        };

        var price = await _priceService.CreateAsync(options, cancellationToken: ct);
        return price.Id;
    }

    public async Task ArchiveProductAsync(string stripeProductId, CancellationToken ct = default)
    {
        // Deactivate all prices first, then archive the product
        var prices = await _priceService.ListAsync(
            new PriceListOptions { Product = stripeProductId, Active = true, Limit = 100 },
            cancellationToken: ct);

        foreach (var price in prices)
            await _priceService.UpdateAsync(price.Id, new PriceUpdateOptions { Active = false }, cancellationToken: ct);

        await _productService.UpdateAsync(
            stripeProductId,
            new ProductUpdateOptions { Active = false },
            cancellationToken: ct);
    }
}
