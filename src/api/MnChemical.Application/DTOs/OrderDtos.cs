namespace MnChemical.Application.DTOs;

using MnChemical.Domain.Entities;

public record OrderDto(
    Guid Id,
    string InvoiceNumber,
    DateTime OrderDate,
    DateTime? DeliveryDate,
    string Destination,
    string? Incoterms,
    string? PaymentTerms,
    OrderStatus Status,
    Guid CustomerId,
    string CustomerName,
    List<OrderLineDto> Lines,
    decimal TotalAmountUsd,
    decimal TotalPaidUsd,
    DateTime CreatedAt);

public record OrderLineDto(
    Guid Id,
    string ProductDescription,
    ProductType ProductType,
    decimal QuantityTons,
    decimal UnitPriceUsd,
    decimal TotalPriceUsd,
    string? PackagingType);

public record CreateOrderDto(
    string InvoiceNumber,
    DateTime OrderDate,
    DateTime? DeliveryDate,
    string Destination,
    string? Incoterms,
    string? PaymentTerms,
    Guid CustomerId,
    List<CreateOrderLineDto> Lines);

public record CreateOrderLineDto(
    string ProductDescription,
    ProductType ProductType,
    decimal QuantityTons,
    decimal UnitPriceUsd,
    string? PackagingType);

public record UpdateOrderDto(
    string InvoiceNumber,
    DateTime OrderDate,
    DateTime? DeliveryDate,
    string Destination,
    string? Incoterms,
    string? PaymentTerms,
    Guid CustomerId,
    List<CreateOrderLineDto> Lines);

public record UpdateOrderStatusDto(OrderStatus Status);
