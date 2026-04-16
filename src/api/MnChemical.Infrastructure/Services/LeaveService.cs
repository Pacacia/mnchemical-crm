namespace MnChemical.Infrastructure.Services;

using Microsoft.EntityFrameworkCore;
using MnChemical.Application.DTOs;
using MnChemical.Application.Services;
using MnChemical.Domain.Entities;
using MnChemical.Infrastructure.Data;

public class LeaveService(AppDbContext db) : ILeaveService
{
    public async Task<List<LeaveRequestDto>> GetAllAsync(LeaveFilterDto? filter = null)
    {
        var query = db.LeaveRequests.Include(l => l.Employee).AsQueryable();

        if (filter?.EmployeeId.HasValue == true)
            query = query.Where(l => l.EmployeeId == filter.EmployeeId.Value);
        if (filter?.Status.HasValue == true)
            query = query.Where(l => l.Status == filter.Status.Value);

        var results = await query.OrderByDescending(l => l.CreatedAt).ToListAsync();
        return results.Select(MapToDto).ToList();
    }

    public async Task<LeaveRequestDto?> GetByIdAsync(Guid id)
    {
        var leave = await db.LeaveRequests.Include(l => l.Employee).FirstOrDefaultAsync(l => l.Id == id);
        return leave is null ? null : MapToDto(leave);
    }

    public async Task<LeaveRequestDto> CreateAsync(CreateLeaveRequestDto dto)
    {
        var leave = new LeaveRequest
        {
            EmployeeId = dto.EmployeeId,
            Type = dto.Type,
            StartDate = dto.StartDate,
            EndDate = dto.EndDate,
            Reason = dto.Reason,
        };

        db.LeaveRequests.Add(leave);
        await db.SaveChangesAsync();

        return await GetByIdAsync(leave.Id) ?? throw new InvalidOperationException();
    }

    public async Task<LeaveRequestDto?> ReviewAsync(Guid id, ReviewLeaveRequestDto dto)
    {
        var leave = await db.LeaveRequests.Include(l => l.Employee).FirstOrDefaultAsync(l => l.Id == id);
        if (leave is null) return null;

        leave.Status = dto.Status;
        leave.ApprovedBy = dto.ApprovedBy;
        leave.ReviewComment = dto.ReviewComment;
        leave.ReviewedAt = DateTime.UtcNow;

        await db.SaveChangesAsync();
        return MapToDto(leave);
    }

    public async Task<bool> DeleteAsync(Guid id)
    {
        var leave = await db.LeaveRequests.FindAsync(id);
        if (leave is null) return false;

        db.LeaveRequests.Remove(leave);
        await db.SaveChangesAsync();
        return true;
    }

    private static LeaveRequestDto MapToDto(LeaveRequest l) => new(
        l.Id, l.Type, l.StartDate, l.EndDate, l.Reason,
        l.Status, l.ApprovedBy, l.ReviewedAt, l.ReviewComment,
        l.EmployeeId, l.Employee.FullName, l.Employee.Department,
        DayCount: l.EndDate.DayNumber - l.StartDate.DayNumber + 1,
        l.CreatedAt);
}
