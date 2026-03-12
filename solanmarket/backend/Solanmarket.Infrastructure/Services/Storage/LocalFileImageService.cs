using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Configuration;
using Solanmarket.Domain.Interfaces;

namespace Solanmarket.Infrastructure.Services.Storage;

/// <summary>
/// Development-only image service. Saves images to wwwroot/uploads/
/// and returns URLs pointing to the local backend server.
/// </summary>
public sealed class LocalFileImageService : IImageService
{
    private readonly string _webRoot;
    private readonly string _uploadsRoot;
    private readonly string _backendUrl;

    public LocalFileImageService(IWebHostEnvironment env, IConfiguration configuration)
    {
        // Always build from ContentRootPath so it works even before wwwroot exists on disk.
        _webRoot = Path.Combine(env.ContentRootPath, "wwwroot");
        _uploadsRoot = Path.Combine(_webRoot, "uploads");
        _backendUrl = configuration["BackendUrl"] ?? "http://localhost:5085";

        // Create at startup so static-file middleware can serve immediately.
        Directory.CreateDirectory(_uploadsRoot);
    }

    public async Task<(string Url, string PublicId)> UploadAsync(
        Stream stream, string fileName, string folder = "products", CancellationToken ct = default)
    {
        var dir = Path.Combine(_uploadsRoot, folder);
        Directory.CreateDirectory(dir);

        var ext = Path.GetExtension(fileName);
        var uniqueName = $"{Guid.NewGuid()}{ext}";
        var filePath = Path.Combine(dir, uniqueName);

        await using var fs = File.Create(filePath);
        await stream.CopyToAsync(fs, ct);

        var relativePath = $"/uploads/{folder}/{uniqueName}";
        var publicId = relativePath; // used as PublicId for deletion

        return ($"{_backendUrl}{relativePath}", publicId);
    }

    public Task DeleteAsync(string publicId, CancellationToken ct = default)
    {
        // publicId is the relative URL path e.g. /uploads/products/guid.jpg
        var relative = publicId.TrimStart('/').Replace('/', Path.DirectorySeparatorChar);
        var filePath = Path.Combine(_webRoot, relative);

        if (File.Exists(filePath))
            File.Delete(filePath);

        return Task.CompletedTask;
    }

    public async Task DeleteManyAsync(IEnumerable<string> publicIds, CancellationToken ct = default)
    {
        foreach (var id in publicIds)
            await DeleteAsync(id, ct);
    }
}
