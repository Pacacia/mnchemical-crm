namespace MnChemical.WebApi.Controllers;

using Microsoft.AspNetCore.Mvc;
using MnChemical.Application.Services;

[ApiController]
[Route("api/[controller]")]
public class InvoiceController(IInvoiceService invoiceService) : ControllerBase
{
    [HttpGet("{orderId:guid}/invoice")]
    public async Task<IActionResult> GetInvoicePdf(Guid orderId)
    {
        var pdf = await invoiceService.GenerateInvoicePdfAsync(orderId);
        return File(pdf, "application/pdf", $"invoice-{orderId}.pdf");
    }

    [HttpGet("{orderId:guid}/packing-list")]
    public async Task<IActionResult> GetPackingListPdf(Guid orderId)
    {
        var pdf = await invoiceService.GeneratePackingListPdfAsync(orderId);
        return File(pdf, "application/pdf", $"packing-list-{orderId}.pdf");
    }
}
