using MediatR;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Identity;
using Solanmarket.Domain.Entities;
using Solanmarket.Domain.Interfaces;
using Solanmarket.Infrastructure.Persistence;
using Solanmarket.Infrastructure.Persistence.Repositories;
using Solanmarket.Application.Interfaces;
using Solanmarket.Infrastructure.Services.Auth;
using Solanmarket.Infrastructure.Services.Email;
using Solanmarket.Infrastructure.Services.Payment;
using Solanmarket.Infrastructure.Services.Storage;

namespace Solanmarket.Infrastructure;

/// <summary>
/// Registers all Infrastructure services into the DI container.
/// Called from API's Program.cs: builder.Services.AddInfrastructure(configuration);
/// </summary>
public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(
        this IServiceCollection services,
        IConfiguration configuration,
        IWebHostEnvironment environment)
    {
        // ── PostgreSQL via EF Core ───────────────────────────────────────────
        services.AddDbContext<SolanmarketDbContext>(options =>
            options.UseNpgsql(
                configuration.GetConnectionString("PostgreSQL"),
                npgsql => npgsql.MigrationsAssembly(typeof(SolanmarketDbContext).Assembly.FullName)));

        // ── ASP.NET Core Identity ────────────────────────────────────────────
        services.AddIdentity<ApplicationUser, IdentityRole<Guid>>(opts =>
        {
            opts.Password.RequireDigit = true;
            opts.Password.RequiredLength = 8;
            opts.Password.RequireNonAlphanumeric = false;
            opts.Password.RequireUppercase = true;
            opts.User.RequireUniqueEmail = true;
        })
        .AddEntityFrameworkStores<SolanmarketDbContext>()
        .AddDefaultTokenProviders();

        // ── Redis ────────────────────────────────────────────────────────────
        services.AddStackExchangeRedisCache(options =>
            options.Configuration = configuration.GetConnectionString("Redis"));

        // ── Repositories ────────────────────────────────────────────────────
        services.AddScoped(typeof(IRepository<>), typeof(Repository<>));
        services.AddScoped<IRepository<Product>, ProductRepository>();
        services.AddScoped<IUnitOfWork, UnitOfWork>();

        // ── Image service — local storage in Development, Cloudinary in Production ─
        if (environment.IsDevelopment())
            services.AddSingleton<IImageService, LocalFileImageService>();
        else
            services.AddSingleton<IImageService, CloudinaryImageService>();

        // ── Stripe catalog service ───────────────────────────────────────────
        services.AddSingleton<IPaymentCatalogService, StripeCatalogService>();

        // ── Auth services ────────────────────────────────────────────────────
        services.AddScoped<ITokenService, TokenService>();
        services.AddScoped<IEmailService, SmtpEmailService>();

        // ── MediatR handlers that live in Infrastructure (need DbContext) ────
        services.AddMediatR(cfg =>
            cfg.RegisterServicesFromAssembly(typeof(DependencyInjection).Assembly));

        return services;
    }
}
