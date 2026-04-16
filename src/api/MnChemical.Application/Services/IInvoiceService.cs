namespace MnChemical.Application.Services;

public interface IInvoiceService
{
    Task<byte[]> GenerateInvoicePdfAsync(Guid orderId);
    Task<byte[]> GeneratePackingListPdfAsync(Guid orderId);
}
