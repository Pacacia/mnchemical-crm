namespace MnChemical.Application.Services;

using MnChemical.Application.DTOs;

public interface IEmployeeService
{
    Task<List<EmployeeDto>> GetAllAsync(bool includeInactive = false);
    Task<EmployeeDto?> GetByIdAsync(Guid id);
    Task<EmployeeDto> CreateAsync(CreateEmployeeDto dto);
    Task<EmployeeDto?> UpdateAsync(Guid id, UpdateEmployeeDto dto);
    Task<bool> DeleteAsync(Guid id);
}
