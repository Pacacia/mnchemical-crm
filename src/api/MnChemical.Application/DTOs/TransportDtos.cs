namespace MnChemical.Application.DTOs;

public record TransportRecordDto(
    Guid Id,
    string CarrierInvoiceNumber,
    DateTime InvoiceDate,
    string CarrierName,
    string RouteLeg,
    decimal CostUsd,
    decimal CostGel,
    decimal ExchangeRate,
    decimal VatRate,
    decimal VatAmountUsd,
    decimal TotalWithVatUsd,
    Guid ShipmentId,
    string? ContainerNumber,
    string? OrderInvoiceNumber,
    DateTime CreatedAt);

public record CreateTransportRecordDto(
    string CarrierInvoiceNumber,
    DateTime InvoiceDate,
    string CarrierName,
    string RouteLeg,
    decimal CostUsd,
    decimal CostGel,
    decimal ExchangeRate,
    decimal VatRate,
    Guid ShipmentId);

public record ShipmentDto(
    Guid Id,
    string BatchNumber,
    string ContainerNumber,
    decimal NetWeightKg,
    decimal GrossWeightKg,
    int BigBagCount,
    int SmallBagCount,
    int PalletCount,
    DateTime? ShipmentDate,
    DateTime? DepartureDate,
    Guid OrderId,
    string OrderInvoiceNumber,
    string CustomerName,
    string Destination,
    bool HasTransportInvoice,
    decimal TotalTransportCostUsd);

public record CreateShipmentDto(
    string BatchNumber,
    string ContainerNumber,
    decimal NetWeightKg,
    decimal GrossWeightKg,
    int BigBagCount,
    int SmallBagCount,
    int PalletCount,
    DateTime? ShipmentDate,
    DateTime? DepartureDate,
    Guid OrderId);
