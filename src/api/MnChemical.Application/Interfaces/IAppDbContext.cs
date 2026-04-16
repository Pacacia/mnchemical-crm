namespace MnChemical.Application.Interfaces;

using Microsoft.EntityFrameworkCore;
using MnChemical.Domain.Entities;

public interface IAppDbContext
{
    DbSet<Customer> Customers { get; }
    DbSet<Order> Orders { get; }
    DbSet<OrderLine> OrderLines { get; }
    DbSet<Shipment> Shipments { get; }
    DbSet<TransportRecord> TransportRecords { get; }
    DbSet<PackagingMaterial> PackagingMaterials { get; }
    DbSet<MaterialLot> MaterialLots { get; }
    DbSet<MaterialConsumption> MaterialConsumptions { get; }
    DbSet<Payment> Payments { get; }
    DbSet<Employee> Employees { get; }
    DbSet<AttendanceRecord> AttendanceRecords { get; }
    DbSet<LeaveRequest> LeaveRequests { get; }

    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
}
