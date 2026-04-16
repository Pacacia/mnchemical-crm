namespace MnChemical.Infrastructure.Services;

using Microsoft.EntityFrameworkCore;
using MnChemical.Application.DTOs;
using MnChemical.Application.Services;
using MnChemical.Domain.Entities;
using MnChemical.Infrastructure.Data;

public class EmployeeService(AppDbContext db) : IEmployeeService
{
    public async Task<List<EmployeeDto>> GetAllAsync(bool includeInactive = false)
    {
        var query = db.Employees.AsQueryable();
        if (!includeInactive) query = query.Where(e => e.IsActive);

        return await query
            .OrderBy(e => e.FullName)
            .Select(e => MapToDto(e))
            .ToListAsync();
    }

    public async Task<EmployeeDto?> GetByIdAsync(Guid id)
    {
        return await db.Employees
            .Where(e => e.Id == id)
            .Select(e => MapToDto(e))
            .FirstOrDefaultAsync();
    }

    public async Task<EmployeeDto> CreateAsync(CreateEmployeeDto dto)
    {
        var employee = new Employee
        {
            BadgeId = dto.BadgeId,
            FullName = dto.FullName,
            Department = dto.Department,
            Position = dto.Position,
            Shift = dto.Shift,
            Schedule = dto.Schedule,
        };

        db.Employees.Add(employee);
        await db.SaveChangesAsync();
        return MapToDto(employee);
    }

    public async Task<EmployeeDto?> UpdateAsync(Guid id, UpdateEmployeeDto dto)
    {
        var employee = await db.Employees.FindAsync(id);
        if (employee is null) return null;

        employee.BadgeId = dto.BadgeId;
        employee.FullName = dto.FullName;
        employee.Department = dto.Department;
        employee.Position = dto.Position;
        employee.Shift = dto.Shift;
        employee.Schedule = dto.Schedule;
        employee.IsActive = dto.IsActive;

        await db.SaveChangesAsync();
        return MapToDto(employee);
    }

    public async Task<bool> DeleteAsync(Guid id)
    {
        var employee = await db.Employees.FindAsync(id);
        if (employee is null) return false;

        db.Employees.Remove(employee);
        await db.SaveChangesAsync();
        return true;
    }

    private static EmployeeDto MapToDto(Employee e) => new(
        e.Id, e.BadgeId, e.FullName, e.Department, e.Position,
        e.Shift, e.Schedule, e.IsActive, e.CreatedAt);
}
