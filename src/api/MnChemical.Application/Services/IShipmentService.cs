namespace MnChemical.Application.Services;

using MnChemical.Application.DTOs;

public interface IShipmentService
{
    Task<List<ShipmentDto>> GetAllAsync();
    Task<List<ShipmentDto>> GetByOrderAsync(Guid orderId);
    Task<ShipmentDto?> GetByIdAsync(Guid id);
    Task<ShipmentDto> CreateAsync(CreateShipmentDto dto);
    Task<ShipmentDto?> UpdateAsync(Guid id, CreateShipmentDto dto);
    Task<bool> DeleteAsync(Guid id);
}
