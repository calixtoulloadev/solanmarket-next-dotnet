using CloudinaryDotNet;
using CloudinaryDotNet.Actions;
using Microsoft.Extensions.Configuration;
using Solanmarket.Domain.Interfaces;

namespace Solanmarket.Infrastructure.Services.Storage;

/// <summary>
/// Uploads and deletes images using the Cloudinary media platform.
/// Configuration keys: Cloudinary:CloudName, Cloudinary:ApiKey, Cloudinary:ApiSecret.
/// </summary>
public sealed class CloudinaryImageService : IImageService
{
    private readonly Cloudinary _cloudinary;

    public CloudinaryImageService(IConfiguration configuration)
    {
        var cfg = configuration.GetSection("Cloudinary");
        var account = new Account(
            cfg["CloudName"] ?? throw new InvalidOperationException("Cloudinary:CloudName is not configured."),
            cfg["ApiKey"] ?? throw new InvalidOperationException("Cloudinary:ApiKey is not configured."),
            cfg["ApiSecret"] ?? throw new InvalidOperationException("Cloudinary:ApiSecret is not configured.")
        );
        _cloudinary = new Cloudinary(account) { Api = { Secure = true } };
    }

    public async Task<(string Url, string PublicId)> UploadAsync(
        Stream stream, string fileName, string folder = "products", CancellationToken ct = default)
    {
        var uploadParams = new ImageUploadParams
        {
            File = new FileDescription(fileName, stream),
            Folder = folder,
            UseFilename = false,
            UniqueFilename = true,
            Overwrite = false,
            Transformation = new Transformation().Quality("auto").FetchFormat("auto"),
        };

        var result = await _cloudinary.UploadAsync(uploadParams);

        if (result.Error is not null)
            throw new InvalidOperationException($"Cloudinary upload failed: {result.Error.Message}");

        return (result.SecureUrl.ToString(), result.PublicId);
    }

    public async Task DeleteAsync(string publicId, CancellationToken ct = default)
    {
        var deleteParams = new DeletionParams(publicId);
        await _cloudinary.DestroyAsync(deleteParams);
    }

    public async Task DeleteManyAsync(IEnumerable<string> publicIds, CancellationToken ct = default)
    {
        var ids = publicIds.ToList();
        if (ids.Count == 0) return;

        // Cloudinary bulk-delete accepts up to 100 ids per call
        foreach (var batch in ids.Chunk(100))
        {
            var delParams = new DelResParams { PublicIds = [.. batch], ResourceType = ResourceType.Image };
            await _cloudinary.DeleteResourcesAsync(delParams);
        }
    }
}
