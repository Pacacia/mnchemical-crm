namespace MnChemical.Application.Services;

using MnChemical.Application.DTOs;

public interface IAccountingService
{
    Task<List<PaymentDto>> GetAllPaymentsAsync();
    Task<List<PaymentDto>> GetPaymentsByOrderAsync(Guid orderId);
    Task<PaymentDto> RecordPaymentAsync(CreatePaymentDto dto);
    Task<bool> DeletePaymentAsync(Guid id);
    Task<List<ReceivableSummaryDto>> GetReceivablesAsync();
    Task<List<CashFlowEntryDto>> GetCashFlowAsync(DateOnly from, DateOnly to);
}
