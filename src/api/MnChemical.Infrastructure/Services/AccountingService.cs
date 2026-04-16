namespace MnChemical.Infrastructure.Services;

using Microsoft.EntityFrameworkCore;
using MnChemical.Application.DTOs;
using MnChemical.Application.Services;
using MnChemical.Domain.Entities;
using MnChemical.Infrastructure.Data;

public class AccountingService(AppDbContext db) : IAccountingService
{
    public async Task<List<PaymentDto>> GetAllPaymentsAsync()
    {
        return await db.Payments
            .Include(p => p.Order).ThenInclude(o => o.Customer)
            .OrderByDescending(p => p.PaymentDate)
            .Select(p => MapPaymentDto(p))
            .ToListAsync();
    }

    public async Task<List<PaymentDto>> GetPaymentsByOrderAsync(Guid orderId)
    {
        return await db.Payments
            .Include(p => p.Order).ThenInclude(o => o.Customer)
            .Where(p => p.OrderId == orderId)
            .OrderByDescending(p => p.PaymentDate)
            .Select(p => MapPaymentDto(p))
            .ToListAsync();
    }

    public async Task<PaymentDto> RecordPaymentAsync(CreatePaymentDto dto)
    {
        var payment = new Payment
        {
            OrderId = dto.OrderId,
            AmountUsd = dto.AmountUsd,
            PaymentDate = dto.PaymentDate,
            Reference = dto.Reference,
            Notes = dto.Notes,
        };
        db.Payments.Add(payment);
        await db.SaveChangesAsync();

        var result = await db.Payments.Include(p => p.Order).ThenInclude(o => o.Customer)
            .FirstAsync(p => p.Id == payment.Id);
        return MapPaymentDto(result);
    }

    public async Task<bool> DeletePaymentAsync(Guid id)
    {
        var p = await db.Payments.FindAsync(id);
        if (p is null) return false;
        db.Payments.Remove(p);
        await db.SaveChangesAsync();
        return true;
    }

    public async Task<List<ReceivableSummaryDto>> GetReceivablesAsync()
    {
        var orders = await db.Orders
            .Include(o => o.Customer)
            .Include(o => o.Lines)
            .Include(o => o.Payments)
            .Where(o => o.Status != OrderStatus.Cancelled)
            .ToListAsync();

        return orders.Select(o =>
        {
            var total = o.Lines.Sum(l => l.TotalPriceUsd);
            var paid = o.Payments.Sum(p => p.AmountUsd);
            var outstanding = total - paid;
            var status = outstanding <= 0 ? "Paid" : paid > 0 ? "Partial" : "Unpaid";
            return new ReceivableSummaryDto(
                o.Id, o.InvoiceNumber, o.Customer.Name, o.Destination,
                total, paid, outstanding, status);
        })
        .OrderByDescending(r => r.OutstandingUsd)
        .ToList();
    }

    public async Task<List<CashFlowEntryDto>> GetCashFlowAsync(DateOnly from, DateOnly to)
    {
        var fromDt = from.ToDateTime(TimeOnly.MinValue);
        var toDt = to.ToDateTime(TimeOnly.MaxValue);

        var payments = await db.Payments
            .Include(p => p.Order).ThenInclude(o => o.Customer)
            .Where(p => p.PaymentDate >= fromDt && p.PaymentDate <= toDt)
            .OrderBy(p => p.PaymentDate)
            .ToListAsync();

        var transportCosts = await db.TransportRecords
            .Include(t => t.Shipment).ThenInclude(s => s.Order)
            .Where(t => t.InvoiceDate >= fromDt && t.InvoiceDate <= toDt)
            .OrderBy(t => t.InvoiceDate)
            .ToListAsync();

        var entries = new List<CashFlowEntryDto>();
        entries.AddRange(payments.Select(p => new CashFlowEntryDto(
            p.PaymentDate, $"Payment #{p.Order.InvoiceNumber} ({p.Order.Customer.Name})", "Income", p.AmountUsd)));
        entries.AddRange(transportCosts.Select(t => new CashFlowEntryDto(
            t.InvoiceDate, $"Transport {t.CarrierName} ({t.RouteLeg})", "Expense", -t.TotalWithVatUsd)));

        return entries.OrderBy(e => e.Date).ToList();
    }

    private static PaymentDto MapPaymentDto(Payment p) => new(
        p.Id, p.AmountUsd, p.PaymentDate, p.Reference, p.Notes,
        p.OrderId, p.Order.InvoiceNumber, p.Order.Customer.Name, p.CreatedAt);
}
