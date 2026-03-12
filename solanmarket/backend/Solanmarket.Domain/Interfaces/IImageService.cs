namespace Solanmarket.Domain.Interfaces;

/// <summary>
/// Abstraction for cloud image storage (Cloudinary implementation in Infrastructure).
/// </summary>
public interface IImageService
{
    /// <summary>
    /// Uploads a stream and returns the public URL and the provider's public_id (needed for deletion).
    /// </summary>
    Task<(string Url, string PublicId)> UploadAsync(Stream stream, string fileName, string folder = "products", CancellationToken ct = default);

    /// <summary>
    /// Deletes an image by its provider public_id. Safe to call even if the image does not exist.
    /// </summary>
    Task DeleteAsync(string publicId, CancellationToken ct = default);

    /// <summary>Deletes multiple images in a single batch call.</summary>
    Task DeleteManyAsync(IEnumerable<string> publicIds, CancellationToken ct = default);
}
