namespace MnChemical.Application.Services;

using MnChemical.Application.DTOs;

public interface ITransportService
{
    Task<List<TransportRecordDto>> GetAllAsync();
    Task<List<TransportRecordDto>> GetByShipmentAsync(Guid shipmentId);
    Task<TransportRecordDto?> GetByIdAsync(Guid id);
    Task<TransportRecordDto> CreateAsync(CreateTransportRecordDto dto);
    Task<TransportRecordDto?> UpdateAsync(Guid id, CreateTransportRecordDto dto);
    Task<bool> DeleteAsync(Guid id);
    Task<List<ShipmentDto>> GetUnmatchedShipmentsAsync();
}
