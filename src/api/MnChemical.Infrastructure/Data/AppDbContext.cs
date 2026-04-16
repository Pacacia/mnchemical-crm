namespace MnChemical.Infrastructure.Data;

using Microsoft.EntityFrameworkCore;
using MnChemical.Application.Interfaces;
using MnChemical.Domain.Entities;

public class AppDbContext : DbContext, IAppDbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<Customer> Customers => Set<Customer>();
    public DbSet<Order> Orders => Set<Order>();
    public DbSet<OrderLine> OrderLines => Set<OrderLine>();
    public DbSet<Shipment> Shipments => Set<Shipment>();
    public DbSet<TransportRecord> TransportRecords => Set<TransportRecord>();
    public DbSet<PackagingMaterial> PackagingMaterials => Set<PackagingMaterial>();
    public DbSet<MaterialLot> MaterialLots => Set<MaterialLot>();
    public DbSet<MaterialConsumption> MaterialConsumptions => Set<MaterialConsumption>();
    public DbSet<Payment> Payments => Set<Payment>();
    public DbSet<Employee> Employees => Set<Employee>();
    public DbSet<AttendanceRecord> AttendanceRecords => Set<AttendanceRecord>();
    public DbSet<LeaveRequest> LeaveRequests => Set<LeaveRequest>();
    public DbSet<User> Users => Set<User>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<Customer>(e =>
        {
            e.HasIndex(c => c.Name);
        });

        modelBuilder.Entity<Order>(e =>
        {
            e.HasIndex(o => o.InvoiceNumber).IsUnique();
            e.HasOne(o => o.Customer).WithMany(c => c.Orders).HasForeignKey(o => o.CustomerId);
        });

        modelBuilder.Entity<OrderLine>(e =>
        {
            e.HasOne(l => l.Order).WithMany(o => o.Lines).HasForeignKey(l => l.OrderId);
            e.Property(l => l.UnitPriceUsd).HasPrecision(18, 2);
            e.Property(l => l.TotalPriceUsd).HasPrecision(18, 2);
            e.Property(l => l.QuantityTons).HasPrecision(18, 3);
        });

        modelBuilder.Entity<Shipment>(e =>
        {
            e.HasIndex(s => s.ContainerNumber);
            e.HasIndex(s => s.BatchNumber);
            e.HasOne(s => s.Order).WithMany(o => o.Shipments).HasForeignKey(s => s.OrderId);
            e.HasIndex(s => s.OrderId);
            e.Property(s => s.NetWeightKg).HasPrecision(18, 2);
            e.Property(s => s.GrossWeightKg).HasPrecision(18, 2);
        });

        modelBuilder.Entity<TransportRecord>(e =>
        {
            e.HasOne(t => t.Shipment).WithMany(s => s.TransportRecords).HasForeignKey(t => t.ShipmentId);
            e.HasIndex(t => t.ShipmentId);
            e.Property(t => t.CostUsd).HasPrecision(18, 2);
            e.Property(t => t.CostGel).HasPrecision(18, 2);
            e.Property(t => t.ExchangeRate).HasPrecision(18, 4);
            e.Property(t => t.VatRate).HasPrecision(5, 2);
            e.Property(t => t.VatAmountUsd).HasPrecision(18, 2);
            e.Property(t => t.TotalWithVatUsd).HasPrecision(18, 2);
        });

        modelBuilder.Entity<PackagingMaterial>(e =>
        {
            e.HasIndex(m => m.Code).IsUnique();
        });

        modelBuilder.Entity<MaterialLot>(e =>
        {
            e.HasIndex(l => l.LotCode);
            e.HasOne(l => l.Material).WithMany(m => m.Lots).HasForeignKey(l => l.MaterialId);
            e.Property(l => l.InitialQuantity).HasPrecision(18, 2);
            e.Property(l => l.CurrentBalance).HasPrecision(18, 2);
        });

        modelBuilder.Entity<MaterialConsumption>(e =>
        {
            e.HasOne(c => c.Shipment).WithMany(s => s.MaterialConsumptions).HasForeignKey(c => c.ShipmentId);
            e.HasOne(c => c.MaterialLot).WithMany(l => l.Consumptions).HasForeignKey(c => c.MaterialLotId);
            e.HasIndex(c => c.ShipmentId);
            e.Property(c => c.Quantity).HasPrecision(18, 2);
        });

        modelBuilder.Entity<Payment>(e =>
        {
            e.HasOne(p => p.Order).WithMany(o => o.Payments).HasForeignKey(p => p.OrderId);
            e.HasIndex(p => p.OrderId);
            e.Property(p => p.AmountUsd).HasPrecision(18, 2);
        });

        modelBuilder.Entity<Employee>(e =>
        {
            e.HasIndex(emp => emp.BadgeId).IsUnique();
        });

        modelBuilder.Entity<AttendanceRecord>(e =>
        {
            e.HasOne(a => a.Employee).WithMany(emp => emp.AttendanceRecords).HasForeignKey(a => a.EmployeeId);
            e.HasIndex(a => new { a.EmployeeId, a.Date });
            e.HasIndex(a => a.Date);
        });

        modelBuilder.Entity<LeaveRequest>(e =>
        {
            e.HasOne(l => l.Employee).WithMany(emp => emp.LeaveRequests).HasForeignKey(l => l.EmployeeId);
            e.HasIndex(l => new { l.EmployeeId, l.StartDate });
        });

        modelBuilder.Entity<User>(e =>
        {
            e.HasIndex(u => u.Username).IsUnique();
        });
    }

    public override Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        foreach (var entry in ChangeTracker.Entries<Domain.Common.BaseEntity>())
        {
            if (entry.State == EntityState.Modified)
                entry.Entity.UpdatedAt = DateTime.UtcNow;
        }

        return base.SaveChangesAsync(cancellationToken);
    }
}
