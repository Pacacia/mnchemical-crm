namespace MnChemical.Application.DTOs;

public record CreatePaymentDto(
    Guid OrderId,
    decimal AmountUsd,
    DateTime PaymentDate,
    string? Reference,
    string? Notes);

public record PaymentDto(
    Guid Id,
    decimal AmountUsd,
    DateTime PaymentDate,
    string? Reference,
    string? Notes,
    Guid OrderId,
    string OrderInvoiceNumber,
    string CustomerName,
    DateTime CreatedAt);

public record ReceivableSummaryDto(
    Guid OrderId,
    string InvoiceNumber,
    string CustomerName,
    string Destination,
    decimal TotalAmountUsd,
    decimal TotalPaidUsd,
    decimal OutstandingUsd,
    string Status);

public record CashFlowEntryDto(
    DateTime Date,
    string Description,
    string Type,
    decimal AmountUsd);
