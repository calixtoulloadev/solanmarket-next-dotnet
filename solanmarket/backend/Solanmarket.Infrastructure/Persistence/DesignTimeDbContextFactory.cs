using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;
using Microsoft.Extensions.Configuration;

namespace Solanmarket.Infrastructure.Persistence;

/// <summary>Allows EF Core CLI tools to create a DbContext without the full DI host.</summary>
public class DesignTimeDbContextFactory : IDesignTimeDbContextFactory<SolanmarketDbContext>
{
    public SolanmarketDbContext CreateDbContext(string[] args)
    {
        // Look for appsettings in the API project at design time
        var basePath = Path.Combine(Directory.GetCurrentDirectory(), "..", "Solanmarket.API");

        var config = new ConfigurationBuilder()
            .SetBasePath(basePath)
            .AddJsonFile("appsettings.json", optional: false)
            .AddJsonFile("appsettings.Development.json", optional: true)
            .AddEnvironmentVariables()
            .Build();

        var connectionString = config.GetConnectionString("PostgreSQL")
            ?? throw new InvalidOperationException("Connection string 'PostgreSQL' not found.");

        var optionsBuilder = new DbContextOptionsBuilder<SolanmarketDbContext>();
        optionsBuilder.UseNpgsql(connectionString);

        return new SolanmarketDbContext(optionsBuilder.Options);
    }
}
