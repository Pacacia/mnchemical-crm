namespace MnChemical.Application.Services;

using MnChemical.Application.DTOs;

public interface IWarehouseService
{
    // Materials
    Task<List<PackagingMaterialDto>> GetAllMaterialsAsync();
    Task<PackagingMaterialDto?> GetMaterialByIdAsync(Guid id);
    Task<PackagingMaterialDto> CreateMaterialAsync(CreatePackagingMaterialDto dto);
    Task<bool> DeleteMaterialAsync(Guid id);

    // Lots
    Task<List<MaterialLotDto>> GetLotsByMaterialAsync(Guid materialId);
    Task<List<MaterialLotDto>> GetAllLotsWithBalanceAsync();
    Task<MaterialLotDto> CreateLotAsync(CreateMaterialLotDto dto);
    Task<MaterialLotDto?> ReceiveStockAsync(Guid lotId, decimal quantity);
    Task<bool> DeleteLotAsync(Guid id);

    // Consumption
    Task<List<MaterialConsumptionDto>> GetConsumptionsByShipmentAsync(Guid shipmentId);
    Task<MaterialConsumptionDto> RecordConsumptionAsync(CreateMaterialConsumptionDto dto);
    Task<bool> DeleteConsumptionAsync(Guid id);

    // Reports
    Task<List<ShipmentMaterialsReportDto>> GetShipmentMaterialsReportAsync(DateOnly from, DateOnly to);
    Task<List<WarehouseInventoryDto>> GetInventoryAsync();

    // Seed
    Task SeedReferenceMaterialsAsync();
}
