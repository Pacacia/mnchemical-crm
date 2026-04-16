namespace MnChemical.Application.DTOs;

using MnChemical.Domain.Entities;

public record LeaveRequestDto(
    Guid Id,
    LeaveType Type,
    DateOnly StartDate,
    DateOnly EndDate,
    string? Reason,
    LeaveStatus Status,
    string? ApprovedBy,
    DateTime? ReviewedAt,
    string? ReviewComment,
    Guid EmployeeId,
    string EmployeeName,
    string? Department,
    int DayCount,
    DateTime CreatedAt);

public record CreateLeaveRequestDto(
    Guid EmployeeId,
    LeaveType Type,
    DateOnly StartDate,
    DateOnly EndDate,
    string? Reason);

public record ReviewLeaveRequestDto(
    LeaveStatus Status,
    string ApprovedBy,
    string? ReviewComment);
