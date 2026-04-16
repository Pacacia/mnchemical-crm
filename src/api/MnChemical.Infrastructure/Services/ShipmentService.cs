namespace MnChemical.Infrastructure.Services;

using Microsoft.EntityFrameworkCore;
using MnChemical.Application.DTOs;
using MnChemical.Application.Services;
using MnChemical.Domain.Entities;
using MnChemical.Infrastructure.Data;

public class ShipmentService(AppDbContext db) : IShipmentService
{
    public async Task<List<ShipmentDto>> GetAllAsync()
    {
        return await db.Shipments
            .Include(s => s.Order).ThenInclude(o => o.Customer)
            .Include(s => s.TransportRecords)
            .OrderByDescending(s => s.ShipmentDate)
            .Select(s => MapToDto(s))
            .ToListAsync();
    }

    public async Task<List<ShipmentDto>> GetByOrderAsync(Guid orderId)
    {
        return await db.Shipments
            .Include(s => s.Order).ThenInclude(o => o.Customer)
            .Include(s => s.TransportRecords)
            .Where(s => s.OrderId == orderId)
            .Select(s => MapToDto(s))
            .ToListAsync();
    }

    public async Task<ShipmentDto?> GetByIdAsync(Guid id)
    {
        var s = await db.Shipments
            .Include(s => s.Order).ThenInclude(o => o.Customer)
            .Include(s => s.TransportRecords)
            .FirstOrDefaultAsync(s => s.Id == id);
        return s is null ? null : MapToDto(s);
    }

    public async Task<ShipmentDto> CreateAsync(CreateShipmentDto dto)
    {
        var shipment = new Shipment
        {
            BatchNumber = dto.BatchNumber,
            ContainerNumber = dto.ContainerNumber,
            NetWeightKg = dto.NetWeightKg,
            GrossWeightKg = dto.GrossWeightKg,
            BigBagCount = dto.BigBagCount,
            SmallBagCount = dto.SmallBagCount,
            PalletCount = dto.PalletCount,
            ShipmentDate = dto.ShipmentDate,
            DepartureDate = dto.DepartureDate,
            OrderId = dto.OrderId,
        };
        db.Shipments.Add(shipment);
        await db.SaveChangesAsync();
        return await GetByIdAsync(shipment.Id) ?? throw new InvalidOperationException();
    }

    public async Task<ShipmentDto?> UpdateAsync(Guid id, CreateShipmentDto dto)
    {
        var shipment = await db.Shipments.FindAsync(id);
        if (shipment is null) return null;

        shipment.BatchNumber = dto.BatchNumber;
        shipment.ContainerNumber = dto.ContainerNumber;
        shipment.NetWeightKg = dto.NetWeightKg;
        shipment.GrossWeightKg = dto.GrossWeightKg;
        shipment.BigBagCount = dto.BigBagCount;
        shipment.SmallBagCount = dto.SmallBagCount;
        shipment.PalletCount = dto.PalletCount;
        shipment.ShipmentDate = dto.ShipmentDate;
        shipment.DepartureDate = dto.DepartureDate;
        shipment.OrderId = dto.OrderId;

        await db.SaveChangesAsync();
        return await GetByIdAsync(id);
    }

    public async Task<bool> DeleteAsync(Guid id)
    {
        var shipment = await db.Shipments.FindAsync(id);
        if (shipment is null) return false;
        db.Shipments.Remove(shipment);
        await db.SaveChangesAsync();
        return true;
    }

    private static ShipmentDto MapToDto(Shipment s) => new(
        s.Id, s.BatchNumber, s.ContainerNumber, s.NetWeightKg, s.GrossWeightKg,
        s.BigBagCount, s.SmallBagCount, s.PalletCount, s.ShipmentDate, s.DepartureDate,
        s.OrderId, s.Order.InvoiceNumber, s.Order.Customer.Name, s.Order.Destination,
        s.TransportRecords.Count > 0,
        s.TransportRecords.Sum(t => t.TotalWithVatUsd));
}
