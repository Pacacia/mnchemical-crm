namespace MnChemical.Application.DTOs;

public record PackagingMaterialDto(
    Guid Id,
    string Code,
    string Name,
    string SubType,
    string? Description,
    string UnitOfMeasure,
    int LotCount,
    decimal TotalBalance);

public record CreatePackagingMaterialDto(
    string Code,
    string Name,
    string SubType,
    string? Description,
    string UnitOfMeasure);

public record MaterialLotDto(
    Guid Id,
    string LotCode,
    DateTime PurchaseDate,
    decimal InitialQuantity,
    decimal CurrentBalance,
    Guid MaterialId,
    string MaterialName,
    string MaterialCode,
    string UnitOfMeasure);

public record CreateMaterialLotDto(
    string LotCode,
    DateTime PurchaseDate,
    decimal InitialQuantity,
    Guid MaterialId);

public record MaterialConsumptionDto(
    Guid Id,
    decimal Quantity,
    DateTime ConsumedDate,
    Guid ShipmentId,
    string ContainerNumber,
    string? OrderInvoiceNumber,
    Guid MaterialLotId,
    string LotCode,
    string MaterialName,
    string MaterialCode,
    string UnitOfMeasure);

public record CreateMaterialConsumptionDto(
    decimal Quantity,
    Guid ShipmentId,
    Guid MaterialLotId);

public record ShipmentMaterialsReportDto(
    Guid ShipmentId,
    string ContainerNumber,
    string BatchNumber,
    string? OrderInvoiceNumber,
    string Destination,
    DateTime? ShipmentDate,
    List<MaterialConsumptionDto> Materials);

public record WarehouseInventoryDto(
    Guid MaterialId,
    string MaterialCode,
    string MaterialName,
    string SubType,
    string UnitOfMeasure,
    List<LotInventoryDto> Lots,
    decimal TotalBalance);

public record LotInventoryDto(
    Guid LotId,
    string LotCode,
    DateTime PurchaseDate,
    decimal InitialQuantity,
    decimal CurrentBalance,
    decimal TotalConsumed);
