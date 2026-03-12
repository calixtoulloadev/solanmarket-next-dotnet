using Microsoft.EntityFrameworkCore;
using Solanmarket.Domain.Entities;
using Solanmarket.Domain.Interfaces;
using Solanmarket.Infrastructure.Persistence;
using System.Linq.Expressions;

namespace Solanmarket.Infrastructure.Persistence.Repositories;

/// <summary>
/// Product-specific repository that always eager-loads Images, Variants, Tags, Category and Supplier.
/// </summary>
public sealed class ProductRepository : Repository<Product>
{
    public ProductRepository(SolanmarketDbContext context) : base(context) { }

    private IQueryable<Product> WithIncludes()
        => _set
            .Include(p => p.Images)
            .Include(p => p.Variants)
            .Include(p => p.Tags)
            .Include(p => p.Category)
            .Include(p => p.Supplier);

    public override async Task<Product?> GetByIdAsync(Guid id, CancellationToken ct = default)
        => await WithIncludes().FirstOrDefaultAsync(p => p.Id == id, ct);

    public override async Task<IEnumerable<Product>> GetAllAsync(CancellationToken ct = default)
        => await WithIncludes().ToListAsync(ct);

    public override async Task<IEnumerable<Product>> FindAsync(
        Expression<Func<Product, bool>> predicate, CancellationToken ct = default)
        => await WithIncludes().Where(predicate).ToListAsync(ct);
}
