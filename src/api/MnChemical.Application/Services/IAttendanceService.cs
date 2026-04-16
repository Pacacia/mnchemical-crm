namespace MnChemical.Application.Services;

using MnChemical.Application.DTOs;

public interface IAttendanceService
{
    Task<TodayAttendanceSummaryDto> GetTodaySummaryAsync();
    Task<List<AttendanceRecordDto>> GetByDateRangeAsync(DateOnly from, DateOnly to, Guid? employeeId = null);
    Task<AttendanceRecordDto?> ManualOverrideAsync(Guid recordId, ManualOverrideDto dto);
    Task<List<MonthlyEmployeeSummaryDto>> GetMonthlySummaryAsync(int year, int month);
    Task<CsvImportResultDto> ImportCsvAsync(Stream csvStream);
}
