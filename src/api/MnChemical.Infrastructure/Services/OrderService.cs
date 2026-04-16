namespace MnChemical.Infrastructure.Services;

using Microsoft.EntityFrameworkCore;
using MnChemical.Application.DTOs;
using MnChemical.Application.Services;
using MnChemical.Domain.Entities;
using MnChemical.Infrastructure.Data;

public class OrderService(AppDbContext db) : IOrderService
{
    public async Task<List<OrderDto>> GetAllAsync()
    {
        return await db.Orders
            .Include(o => o.Customer)
            .Include(o => o.Lines)
            .Include(o => o.Payments)
            .OrderByDescending(o => o.OrderDate)
            .Select(o => MapToDto(o))
            .ToListAsync();
    }

    public async Task<OrderDto?> GetByIdAsync(Guid id)
    {
        var order = await db.Orders
            .Include(o => o.Customer)
            .Include(o => o.Lines)
            .Include(o => o.Payments)
            .FirstOrDefaultAsync(o => o.Id == id);

        return order is null ? null : MapToDto(order);
    }

    public async Task<OrderDto> CreateAsync(CreateOrderDto dto)
    {
        var order = new Order
        {
            InvoiceNumber = dto.InvoiceNumber,
            OrderDate = dto.OrderDate,
            DeliveryDate = dto.DeliveryDate,
            Destination = dto.Destination,
            Incoterms = dto.Incoterms,
            PaymentTerms = dto.PaymentTerms,
            CustomerId = dto.CustomerId,
            Lines = dto.Lines.Select(l => new OrderLine
            {
                ProductDescription = l.ProductDescription,
                ProductType = l.ProductType,
                QuantityTons = l.QuantityTons,
                UnitPriceUsd = l.UnitPriceUsd,
                TotalPriceUsd = l.QuantityTons * l.UnitPriceUsd,
                PackagingType = l.PackagingType
            }).ToList()
        };

        db.Orders.Add(order);
        await db.SaveChangesAsync();

        return await GetByIdAsync(order.Id) ?? throw new InvalidOperationException("Failed to retrieve created order");
    }

    public async Task<OrderDto?> UpdateAsync(Guid id, UpdateOrderDto dto)
    {
        var order = await db.Orders
            .Include(o => o.Lines)
            .FirstOrDefaultAsync(o => o.Id == id);

        if (order is null) return null;

        order.InvoiceNumber = dto.InvoiceNumber;
        order.OrderDate = dto.OrderDate;
        order.DeliveryDate = dto.DeliveryDate;
        order.Destination = dto.Destination;
        order.Incoterms = dto.Incoterms;
        order.PaymentTerms = dto.PaymentTerms;
        order.CustomerId = dto.CustomerId;

        db.OrderLines.RemoveRange(order.Lines);
        order.Lines = dto.Lines.Select(l => new OrderLine
        {
            ProductDescription = l.ProductDescription,
            ProductType = l.ProductType,
            QuantityTons = l.QuantityTons,
            UnitPriceUsd = l.UnitPriceUsd,
            TotalPriceUsd = l.QuantityTons * l.UnitPriceUsd,
            PackagingType = l.PackagingType
        }).ToList();

        await db.SaveChangesAsync();
        return await GetByIdAsync(id);
    }

    public async Task<OrderDto?> UpdateStatusAsync(Guid id, OrderStatus status)
    {
        var order = await db.Orders.FindAsync(id);
        if (order is null) return null;

        order.Status = status;
        await db.SaveChangesAsync();
        return await GetByIdAsync(id);
    }

    public async Task<bool> DeleteAsync(Guid id)
    {
        var order = await db.Orders.Include(o => o.Lines).FirstOrDefaultAsync(o => o.Id == id);
        if (order is null) return false;

        db.Orders.Remove(order);
        await db.SaveChangesAsync();
        return true;
    }

    private static OrderDto MapToDto(Order o) => new(
        o.Id,
        o.InvoiceNumber,
        o.OrderDate,
        o.DeliveryDate,
        o.Destination,
        o.Incoterms,
        o.PaymentTerms,
        o.Status,
        o.CustomerId,
        o.Customer.Name,
        o.Lines.Select(l => new OrderLineDto(
            l.Id, l.ProductDescription, l.ProductType,
            l.QuantityTons, l.UnitPriceUsd, l.TotalPriceUsd,
            l.PackagingType)).ToList(),
        o.Lines.Sum(l => l.TotalPriceUsd),
        o.Payments.Sum(p => p.AmountUsd),
        o.CreatedAt);
}
