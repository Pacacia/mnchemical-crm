namespace MnChemical.Application.Services;

using MnChemical.Application.DTOs;
using MnChemical.Domain.Entities;

public interface IOrderService
{
    Task<List<OrderDto>> GetAllAsync();
    Task<OrderDto?> GetByIdAsync(Guid id);
    Task<OrderDto> CreateAsync(CreateOrderDto dto);
    Task<OrderDto?> UpdateAsync(Guid id, UpdateOrderDto dto);
    Task<OrderDto?> UpdateStatusAsync(Guid id, OrderStatus status);
    Task<bool> DeleteAsync(Guid id);
}
