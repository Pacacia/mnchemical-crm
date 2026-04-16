namespace MnChemical.Infrastructure.Services;

using Microsoft.EntityFrameworkCore;
using MnChemical.Application.DTOs;
using MnChemical.Application.Services;
using MnChemical.Domain.Entities;
using MnChemical.Infrastructure.Data;

public class TransportService(AppDbContext db) : ITransportService
{
    public async Task<List<TransportRecordDto>> GetAllAsync()
    {
        return await db.TransportRecords
            .Include(t => t.Shipment).ThenInclude(s => s.Order)
            .OrderByDescending(t => t.InvoiceDate)
            .Select(t => MapToDto(t))
            .ToListAsync();
    }

    public async Task<List<TransportRecordDto>> GetByShipmentAsync(Guid shipmentId)
    {
        return await db.TransportRecords
            .Include(t => t.Shipment).ThenInclude(s => s.Order)
            .Where(t => t.ShipmentId == shipmentId)
            .Select(t => MapToDto(t))
            .ToListAsync();
    }

    public async Task<TransportRecordDto?> GetByIdAsync(Guid id)
    {
        var t = await db.TransportRecords
            .Include(t => t.Shipment).ThenInclude(s => s.Order)
            .FirstOrDefaultAsync(t => t.Id == id);
        return t is null ? null : MapToDto(t);
    }

    public async Task<TransportRecordDto> CreateAsync(CreateTransportRecordDto dto)
    {
        var record = new TransportRecord
        {
            CarrierInvoiceNumber = dto.CarrierInvoiceNumber,
            InvoiceDate = dto.InvoiceDate,
            CarrierName = dto.CarrierName,
            RouteLeg = dto.RouteLeg,
            CostUsd = dto.CostUsd,
            CostGel = dto.CostGel,
            ExchangeRate = dto.ExchangeRate,
            VatRate = dto.VatRate,
            VatAmountUsd = Math.Round(dto.CostUsd * dto.VatRate / 100, 2),
            TotalWithVatUsd = Math.Round(dto.CostUsd + dto.CostUsd * dto.VatRate / 100, 2),
            ShipmentId = dto.ShipmentId,
        };
        db.TransportRecords.Add(record);
        await db.SaveChangesAsync();
        return await GetByIdAsync(record.Id) ?? throw new InvalidOperationException();
    }

    public async Task<TransportRecordDto?> UpdateAsync(Guid id, CreateTransportRecordDto dto)
    {
        var record = await db.TransportRecords.FindAsync(id);
        if (record is null) return null;

        record.CarrierInvoiceNumber = dto.CarrierInvoiceNumber;
        record.InvoiceDate = dto.InvoiceDate;
        record.CarrierName = dto.CarrierName;
        record.RouteLeg = dto.RouteLeg;
        record.CostUsd = dto.CostUsd;
        record.CostGel = dto.CostGel;
        record.ExchangeRate = dto.ExchangeRate;
        record.VatRate = dto.VatRate;
        record.VatAmountUsd = dto.CostUsd * dto.VatRate / 100;
        record.TotalWithVatUsd = dto.CostUsd + dto.CostUsd * dto.VatRate / 100;
        record.ShipmentId = dto.ShipmentId;

        await db.SaveChangesAsync();
        return await GetByIdAsync(id);
    }

    public async Task<bool> DeleteAsync(Guid id)
    {
        var record = await db.TransportRecords.FindAsync(id);
        if (record is null) return false;
        db.TransportRecords.Remove(record);
        await db.SaveChangesAsync();
        return true;
    }

    public async Task<List<ShipmentDto>> GetUnmatchedShipmentsAsync()
    {
        return await db.Shipments
            .Include(s => s.Order).ThenInclude(o => o.Customer)
            .Include(s => s.TransportRecords)
            .Where(s => !s.TransportRecords.Any())
            .Select(s => new ShipmentDto(
                s.Id, s.BatchNumber, s.ContainerNumber, s.NetWeightKg, s.GrossWeightKg,
                s.BigBagCount, s.SmallBagCount, s.PalletCount, s.ShipmentDate, s.DepartureDate,
                s.OrderId, s.Order.InvoiceNumber, s.Order.Customer.Name, s.Order.Destination,
                false, 0))
            .ToListAsync();
    }

    private static TransportRecordDto MapToDto(TransportRecord t) => new(
        t.Id, t.CarrierInvoiceNumber, t.InvoiceDate, t.CarrierName, t.RouteLeg,
        t.CostUsd, t.CostGel, t.ExchangeRate, t.VatRate, t.VatAmountUsd, t.TotalWithVatUsd,
        t.ShipmentId, t.Shipment.ContainerNumber, t.Shipment.Order.InvoiceNumber,
        t.CreatedAt);
}
