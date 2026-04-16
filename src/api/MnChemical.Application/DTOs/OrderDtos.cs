namespace MnChemical.Application.DTOs;

using System.ComponentModel.DataAnnotations;
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
    [Required, StringLength(50)] string InvoiceNumber,
    DateTime OrderDate,
    DateTime? DeliveryDate,
    [Required, StringLength(200)] string Destination,
    string? Incoterms,
    string? PaymentTerms,
    Guid CustomerId,
    [Required, MinLength(1)] List<CreateOrderLineDto> Lines);

public record CreateOrderLineDto(
    [Required] string ProductDescription,
    ProductType ProductType,
    [Range(0.001, 100000)] decimal QuantityTons,
    [Range(0.01, 1000000)] decimal UnitPriceUsd,
    string? PackagingType);

public record UpdateOrderDto(
    [Required, StringLength(50)] string InvoiceNumber,
    DateTime OrderDate,
    DateTime? DeliveryDate,
    [Required, StringLength(200)] string Destination,
    string? Incoterms,
    string? PaymentTerms,
    Guid CustomerId,
    [Required, MinLength(1)] List<CreateOrderLineDto> Lines);

public record UpdateOrderStatusDto(OrderStatus Status);
