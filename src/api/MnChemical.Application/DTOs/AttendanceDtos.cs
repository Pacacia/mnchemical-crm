namespace MnChemical.Application.DTOs;

public record AttendanceRecordDto(
    Guid Id,
    DateOnly Date,
    TimeOnly? ClockIn,
    TimeOnly? ClockOut,
    TimeSpan? WorkTime,
    TimeSpan? Overtime,
    TimeSpan? NightHours,
    bool IsLateArrival,
    bool IsAbsent,
    bool IsMissingClockOut,
    bool IsManualOverride,
    string? ManagerComment,
    Guid EmployeeId,
    string EmployeeName,
    string? Department);

public record ManualOverrideDto(
    TimeOnly ClockIn,
    TimeOnly ClockOut,
    string ManagerComment);

public record TodayAttendanceSummaryDto(
    int TotalEmployees,
    int PresentCount,
    int LateCount,
    int AbsentCount,
    int MissingClockOutCount,
    List<AttendanceRecordDto> Records);

public record MonthlyEmployeeSummaryDto(
    Guid EmployeeId,
    string EmployeeName,
    string? Department,
    int DaysWorked,
    int LateCount,
    int AbsentCount,
    TimeSpan TotalWorkTime,
    TimeSpan TotalOvertime,
    TimeSpan TotalNightHours,
    int MissingClockOutCount);

public record CsvImportResultDto(
    int RecordsImported,
    int EmployeesCreated,
    int DuplicatesSkipped,
    List<string> Warnings);
