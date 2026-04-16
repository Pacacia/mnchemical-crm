namespace MnChemical.WebApi.Controllers;

using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MnChemical.Application.DTOs;
using MnChemical.Application.Services;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class AccountingController(IAccountingService accountingService) : ControllerBase
{
    [HttpGet("payments")]
    public async Task<ActionResult<List<PaymentDto>>> GetPayments()
        => Ok(await accountingService.GetAllPaymentsAsync());

    [HttpGet("payments/by-order/{orderId:guid}")]
    public async Task<ActionResult<List<PaymentDto>>> GetPaymentsByOrder(Guid orderId)
        => Ok(await accountingService.GetPaymentsByOrderAsync(orderId));

    [HttpPost("payments")]
    public async Task<ActionResult<PaymentDto>> RecordPayment(CreatePaymentDto dto)
        => Ok(await accountingService.RecordPaymentAsync(dto));

    [HttpDelete("payments/{id:guid}")]
    public async Task<IActionResult> DeletePayment(Guid id)
        => await accountingService.DeletePaymentAsync(id) ? NoContent() : NotFound();

    [HttpGet("receivables")]
    public async Task<ActionResult<List<ReceivableSummaryDto>>> GetReceivables()
        => Ok(await accountingService.GetReceivablesAsync());

    [HttpGet("cashflow")]
    public async Task<ActionResult<List<CashFlowEntryDto>>> GetCashFlow(
        [FromQuery] DateOnly from, [FromQuery] DateOnly to)
        => Ok(await accountingService.GetCashFlowAsync(from, to));
}
