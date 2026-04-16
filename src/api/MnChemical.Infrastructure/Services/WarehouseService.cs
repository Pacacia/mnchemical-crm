namespace MnChemical.Infrastructure.Services;

using Microsoft.EntityFrameworkCore;
using MnChemical.Application.DTOs;
using MnChemical.Application.Services;
using MnChemical.Domain.Entities;
using MnChemical.Infrastructure.Data;

public class WarehouseService(AppDbContext db) : IWarehouseService
{
    // Materials
    public async Task<List<PackagingMaterialDto>> GetAllMaterialsAsync()
    {
        return await db.PackagingMaterials
            .Include(m => m.Lots)
            .OrderBy(m => m.Code)
            .Select(m => new PackagingMaterialDto(
                m.Id, m.Code, m.Name, m.SubType, m.Description, m.UnitOfMeasure,
                m.Lots.Count, m.Lots.Sum(l => l.CurrentBalance)))
            .ToListAsync();
    }

    public async Task<PackagingMaterialDto?> GetMaterialByIdAsync(Guid id)
    {
        return await db.PackagingMaterials
            .Include(m => m.Lots)
            .Where(m => m.Id == id)
            .Select(m => new PackagingMaterialDto(
                m.Id, m.Code, m.Name, m.SubType, m.Description, m.UnitOfMeasure,
                m.Lots.Count, m.Lots.Sum(l => l.CurrentBalance)))
            .FirstOrDefaultAsync();
    }

    public async Task<PackagingMaterialDto> CreateMaterialAsync(CreatePackagingMaterialDto dto)
    {
        var material = new PackagingMaterial
        {
            Code = dto.Code, Name = dto.Name, SubType = dto.SubType,
            Description = dto.Description, UnitOfMeasure = dto.UnitOfMeasure,
        };
        db.PackagingMaterials.Add(material);
        await db.SaveChangesAsync();
        return (await GetMaterialByIdAsync(material.Id))!;
    }

    public async Task<bool> DeleteMaterialAsync(Guid id)
    {
        var m = await db.PackagingMaterials.FindAsync(id);
        if (m is null) return false;
        db.PackagingMaterials.Remove(m);
        await db.SaveChangesAsync();
        return true;
    }

    // Lots
    public async Task<List<MaterialLotDto>> GetLotsByMaterialAsync(Guid materialId)
    {
        return await db.MaterialLots
            .Include(l => l.Material)
            .Where(l => l.MaterialId == materialId)
            .OrderByDescending(l => l.PurchaseDate)
            .Select(l => MapLotDto(l))
            .ToListAsync();
    }

    public async Task<List<MaterialLotDto>> GetAllLotsWithBalanceAsync()
    {
        return await db.MaterialLots
            .Include(l => l.Material)
            .Where(l => l.CurrentBalance > 0)
            .OrderBy(l => l.Material.Code).ThenByDescending(l => l.PurchaseDate)
            .Select(l => MapLotDto(l))
            .ToListAsync();
    }

    public async Task<MaterialLotDto> CreateLotAsync(CreateMaterialLotDto dto)
    {
        var lot = new MaterialLot
        {
            LotCode = dto.LotCode, PurchaseDate = dto.PurchaseDate,
            InitialQuantity = dto.InitialQuantity, CurrentBalance = dto.InitialQuantity,
            MaterialId = dto.MaterialId,
        };
        db.MaterialLots.Add(lot);
        await db.SaveChangesAsync();
        var result = await db.MaterialLots.Include(l => l.Material).FirstAsync(l => l.Id == lot.Id);
        return MapLotDto(result);
    }

    public async Task<MaterialLotDto?> ReceiveStockAsync(Guid lotId, decimal quantity)
    {
        var lot = await db.MaterialLots.Include(l => l.Material).FirstOrDefaultAsync(l => l.Id == lotId);
        if (lot is null) return null;
        lot.InitialQuantity += quantity;
        lot.CurrentBalance += quantity;
        await db.SaveChangesAsync();
        return MapLotDto(lot);
    }

    public async Task<bool> DeleteLotAsync(Guid id)
    {
        var l = await db.MaterialLots.FindAsync(id);
        if (l is null) return false;
        db.MaterialLots.Remove(l);
        await db.SaveChangesAsync();
        return true;
    }

    // Consumption
    public async Task<List<MaterialConsumptionDto>> GetConsumptionsByShipmentAsync(Guid shipmentId)
    {
        return await db.MaterialConsumptions
            .Include(c => c.MaterialLot).ThenInclude(l => l.Material)
            .Include(c => c.Shipment).ThenInclude(s => s.Order)
            .Where(c => c.ShipmentId == shipmentId)
            .Select(c => MapConsumptionDto(c))
            .ToListAsync();
    }

    public async Task<MaterialConsumptionDto> RecordConsumptionAsync(CreateMaterialConsumptionDto dto)
    {
        var lot = await db.MaterialLots.FindAsync(dto.MaterialLotId)
            ?? throw new InvalidOperationException("Lot not found");

        if (lot.CurrentBalance < dto.Quantity)
            throw new InvalidOperationException($"Insufficient stock. Available: {lot.CurrentBalance}, requested: {dto.Quantity}");

        lot.CurrentBalance -= dto.Quantity;

        var consumption = new MaterialConsumption
        {
            Quantity = dto.Quantity,
            ConsumedDate = DateTime.UtcNow,
            ShipmentId = dto.ShipmentId,
            MaterialLotId = dto.MaterialLotId,
        };
        db.MaterialConsumptions.Add(consumption);
        await db.SaveChangesAsync();

        var result = await db.MaterialConsumptions
            .Include(c => c.MaterialLot).ThenInclude(l => l.Material)
            .Include(c => c.Shipment).ThenInclude(s => s.Order)
            .FirstAsync(c => c.Id == consumption.Id);
        return MapConsumptionDto(result);
    }

    public async Task<bool> DeleteConsumptionAsync(Guid id)
    {
        var c = await db.MaterialConsumptions.Include(c => c.MaterialLot).FirstOrDefaultAsync(c => c.Id == id);
        if (c is null) return false;

        c.MaterialLot.CurrentBalance += c.Quantity;
        db.MaterialConsumptions.Remove(c);
        await db.SaveChangesAsync();
        return true;
    }

    // Reports
    public async Task<List<ShipmentMaterialsReportDto>> GetShipmentMaterialsReportAsync(DateOnly from, DateOnly to)
    {
        var fromDt = from.ToDateTime(TimeOnly.MinValue);
        var toDt = to.ToDateTime(TimeOnly.MaxValue);

        var shipments = await db.Shipments
            .Include(s => s.Order)
            .Include(s => s.MaterialConsumptions).ThenInclude(c => c.MaterialLot).ThenInclude(l => l.Material)
            .Where(s => s.ShipmentDate >= fromDt && s.ShipmentDate <= toDt)
            .OrderByDescending(s => s.ShipmentDate)
            .ToListAsync();

        return shipments.Select(s => new ShipmentMaterialsReportDto(
            s.Id, s.ContainerNumber, s.BatchNumber, s.Order.InvoiceNumber, s.Order.Destination,
            s.ShipmentDate,
            s.MaterialConsumptions.Select(MapConsumptionDto).ToList()
        )).ToList();
    }

    public async Task<List<WarehouseInventoryDto>> GetInventoryAsync()
    {
        var materials = await db.PackagingMaterials
            .Include(m => m.Lots).ThenInclude(l => l.Consumptions)
            .OrderBy(m => m.Code)
            .ToListAsync();

        return materials.Select(m => new WarehouseInventoryDto(
            m.Id, m.Code, m.Name, m.SubType, m.UnitOfMeasure,
            m.Lots.OrderByDescending(l => l.PurchaseDate).Select(l => new LotInventoryDto(
                l.Id, l.LotCode, l.PurchaseDate, l.InitialQuantity, l.CurrentBalance,
                l.Consumptions.Sum(c => c.Quantity)
            )).ToList(),
            m.Lots.Sum(l => l.CurrentBalance)
        )).ToList();
    }

    // Seed reference data
    public async Task SeedReferenceMaterialsAsync()
    {
        if (await db.PackagingMaterials.AnyAsync()) return;

        var materials = new PackagingMaterial[]
        {
            new() { Code = "02-1", Name = "Bag", SubType = "Labeled Green", UnitOfMeasure = "pcs" },
            new() { Code = "02-2", Name = "Bag", SubType = "Unlabeled Green", UnitOfMeasure = "pcs" },
            new() { Code = "02-3", Name = "Bag", SubType = "Unlabeled White", UnitOfMeasure = "pcs" },
            new() { Code = "03-1", Name = "Cardboard", SubType = "100x100", UnitOfMeasure = "pcs" },
            new() { Code = "03-2", Name = "Cardboard", SubType = "120x80", UnitOfMeasure = "pcs" },
            new() { Code = "03-3", Name = "Cardboard", SubType = "120x130", UnitOfMeasure = "pcs" },
            new() { Code = "03-4", Name = "Cardboard", SubType = "120x100", UnitOfMeasure = "pcs" },
            new() { Code = "04-1", Name = "Pallet", SubType = "Large 120x100", UnitOfMeasure = "pcs" },
            new() { Code = "04-2", Name = "Pallet", SubType = "Small", UnitOfMeasure = "pcs" },
            new() { Code = "05-1", Name = "Big-Bag", SubType = "C-type", UnitOfMeasure = "pcs" },
            new() { Code = "05-2", Name = "Big-Bag", SubType = "Standard", UnitOfMeasure = "pcs" },
            new() { Code = "06-1", Name = "PE Stretch Film", SubType = "Film", UnitOfMeasure = "kg" },
            new() { Code = "06-2", Name = "Strapping Tape", SubType = "Tape", UnitOfMeasure = "m" },
            new() { Code = "07-1", Name = "Rope", SubType = "8mm", UnitOfMeasure = "m" },
            new() { Code = "08-1", Name = "Cushion", SubType = "Inflatable", UnitOfMeasure = "pcs" },
            new() { Code = "13-1", Name = "Plywood", SubType = "9x2440x1220", UnitOfMeasure = "pcs" },
        };

        db.PackagingMaterials.AddRange(materials);
        await db.SaveChangesAsync();
    }

    private static MaterialLotDto MapLotDto(MaterialLot l) => new(
        l.Id, l.LotCode, l.PurchaseDate, l.InitialQuantity, l.CurrentBalance,
        l.MaterialId, l.Material.Name, l.Material.Code, l.Material.UnitOfMeasure);

    private static MaterialConsumptionDto MapConsumptionDto(MaterialConsumption c) => new(
        c.Id, c.Quantity, c.ConsumedDate, c.ShipmentId,
        c.Shipment.ContainerNumber, c.Shipment.Order.InvoiceNumber,
        c.MaterialLotId, c.MaterialLot.LotCode,
        c.MaterialLot.Material.Name, c.MaterialLot.Material.Code,
        c.MaterialLot.Material.UnitOfMeasure);
}
