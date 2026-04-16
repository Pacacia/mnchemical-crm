namespace MnChemical.Application.Services;

using MnChemical.Application.DTOs;

public interface ILeaveService
{
    Task<List<LeaveRequestDto>> GetAllAsync(LeaveFilterDto? filter = null);
    Task<LeaveRequestDto?> GetByIdAsync(Guid id);
    Task<LeaveRequestDto> CreateAsync(CreateLeaveRequestDto dto);
    Task<LeaveRequestDto?> ReviewAsync(Guid id, ReviewLeaveRequestDto dto);
    Task<bool> DeleteAsync(Guid id);
}

public record LeaveFilterDto(
    Guid? EmployeeId = null,
    Domain.Entities.LeaveStatus? Status = null);
