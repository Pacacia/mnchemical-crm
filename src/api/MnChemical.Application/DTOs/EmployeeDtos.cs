namespace MnChemical.Application.DTOs;

using MnChemical.Domain.Entities;

public record EmployeeDto(
    Guid Id,
    string BadgeId,
    string FullName,
    string? Department,
    string? Position,
    string? Shift,
    WorkSchedule Schedule,
    bool IsActive,
    DateTime CreatedAt);

public record CreateEmployeeDto(
    string BadgeId,
    string FullName,
    string? Department,
    string? Position,
    string? Shift,
    WorkSchedule Schedule);

public record UpdateEmployeeDto(
    string BadgeId,
    string FullName,
    string? Department,
    string? Position,
    string? Shift,
    WorkSchedule Schedule,
    bool IsActive);
