namespace MnChemical.Infrastructure.Services;

using System.Globalization;
using Microsoft.EntityFrameworkCore;
using MnChemical.Application.DTOs;
using MnChemical.Application.Services;
using MnChemical.Domain.Entities;
using MnChemical.Infrastructure.Data;

public class AttendanceService(AppDbContext db) : IAttendanceService
{
    private static readonly TimeOnly DefaultDayStart = new(9, 0);

    public async Task<TodayAttendanceSummaryDto> GetTodaySummaryAsync()
    {
        var today = DateOnly.FromDateTime(DateTime.UtcNow);
        var totalActive = await db.Employees.CountAsync(e => e.IsActive);

        var records = await db.AttendanceRecords
            .Include(a => a.Employee)
            .Where(a => a.Date == today)
            .ToListAsync();

        var dtos = records.Select(MapToDto).ToList();

        return new TodayAttendanceSummaryDto(
            TotalEmployees: totalActive,
            PresentCount: dtos.Count(r => !r.IsAbsent),
            LateCount: dtos.Count(r => r.IsLateArrival),
            AbsentCount: totalActive - dtos.Count,
            MissingClockOutCount: dtos.Count(r => r.IsMissingClockOut),
            Records: dtos);
    }

    public async Task<List<AttendanceRecordDto>> GetByDateRangeAsync(DateOnly from, DateOnly to, Guid? employeeId = null)
    {
        var query = db.AttendanceRecords
            .Include(a => a.Employee)
            .Where(a => a.Date >= from && a.Date <= to);

        if (employeeId.HasValue)
            query = query.Where(a => a.EmployeeId == employeeId.Value);

        var records = await query.OrderByDescending(a => a.Date).ThenBy(a => a.Employee.FullName).ToListAsync();
        return records.Select(MapToDto).ToList();
    }

    public async Task<AttendanceRecordDto?> ManualOverrideAsync(Guid recordId, ManualOverrideDto dto)
    {
        var record = await db.AttendanceRecords.Include(a => a.Employee).FirstOrDefaultAsync(a => a.Id == recordId);
        if (record is null) return null;

        record.ClockIn = dto.ClockIn;
        record.ClockOut = dto.ClockOut;
        record.IsManualOverride = true;
        record.ManagerComment = dto.ManagerComment;
        record.IsMissingClockOut = false;

        RecalculateFields(record);
        await db.SaveChangesAsync();
        return MapToDto(record);
    }

    public async Task<List<MonthlyEmployeeSummaryDto>> GetMonthlySummaryAsync(int year, int month)
    {
        var from = new DateOnly(year, month, 1);
        var to = from.AddMonths(1).AddDays(-1);

        var records = await db.AttendanceRecords
            .Include(a => a.Employee)
            .Where(a => a.Date >= from && a.Date <= to)
            .ToListAsync();

        return records
            .GroupBy(r => r.EmployeeId)
            .Select(g =>
            {
                var emp = g.First().Employee;
                return new MonthlyEmployeeSummaryDto(
                    EmployeeId: emp.Id,
                    EmployeeName: emp.FullName,
                    Department: emp.Department,
                    DaysWorked: g.Count(r => !r.IsAbsent && r.ClockIn.HasValue),
                    LateCount: g.Count(r => r.IsLateArrival),
                    AbsentCount: g.Count(r => r.IsAbsent),
                    TotalWorkTime: SumTimeSpans(g.Select(r => r.WorkTime)),
                    TotalOvertime: SumTimeSpans(g.Select(r => r.Overtime)),
                    TotalNightHours: SumTimeSpans(g.Select(r => r.NightHours)),
                    MissingClockOutCount: g.Count(r => r.IsMissingClockOut));
            })
            .OrderBy(s => s.EmployeeName)
            .ToList();
    }

    public async Task<CsvImportResultDto> ImportCsvAsync(Stream csvStream)
    {
        using var reader = new StreamReader(csvStream);
        var header = await reader.ReadLineAsync();
        if (header is null) return new CsvImportResultDto(0, 0, 0, ["Empty file"]);

        var warnings = new List<string>();
        int imported = 0, duplicatesSkipped = 0, employeesCreated = 0;

        var existingEmployees = await db.Employees.ToDictionaryAsync(e => e.BadgeId, e => e);
        var existingRecords = new HashSet<(Guid, DateOnly)>(
            await db.AttendanceRecords.Select(a => new { a.EmployeeId, a.Date }).ToListAsync()
                .ContinueWith(t => t.Result.Select(a => (a.EmployeeId, a.Date))));

        string? line;
        int lineNum = 1;
        while ((line = await reader.ReadLineAsync()) is not null)
        {
            lineNum++;
            if (string.IsNullOrWhiteSpace(line)) continue;

            var parts = line.Split(',');
            if (parts.Length < 14) { warnings.Add($"Line {lineNum}: insufficient columns"); continue; }

            var dateStr = parts[0].Trim();
            var badgeId = parts[1].Trim();
            var fullName = parts[2].Trim();
            var department = parts[3].Trim();
            var clockInStr = parts[6].Trim();
            var clockOutStr = parts[7].Trim();
            var nightStr = parts[10].Trim();
            var workTimeStr = parts[13].Trim();

            if (!TryParseDate(dateStr, out var date))
            {
                warnings.Add($"Line {lineNum}: invalid date '{dateStr}'");
                continue;
            }

            if (!existingEmployees.TryGetValue(badgeId, out var employee))
            {
                employee = new Employee
                {
                    BadgeId = badgeId,
                    FullName = fullName,
                    Department = string.IsNullOrEmpty(department) ? null : department,
                };
                db.Employees.Add(employee);
                await db.SaveChangesAsync();
                existingEmployees[badgeId] = employee;
                employeesCreated++;
            }

            if (existingRecords.Contains((employee.Id, date)))
            {
                duplicatesSkipped++;
                continue;
            }

            var clockIn = TryParseTime(clockInStr);
            var clockOut = TryParseTime(clockOutStr);
            var isMissingClockOut = clockOut is null || (clockOut == new TimeOnly(0, 0) && clockIn != new TimeOnly(0, 0));
            if (clockOut == new TimeOnly(0, 0) && isMissingClockOut) clockOut = null;

            var nightHours = TryParseTimeSpan(nightStr);
            var workTime = TryParseTimeSpan(workTimeStr);

            var record = new AttendanceRecord
            {
                Date = date,
                ClockIn = clockIn,
                ClockOut = isMissingClockOut ? null : clockOut,
                WorkTime = workTime,
                NightHours = nightHours,
                IsMissingClockOut = isMissingClockOut,
                IsAbsent = clockIn is null,
                EmployeeId = employee.Id,
            };

            RecalculateFields(record);
            db.AttendanceRecords.Add(record);
            existingRecords.Add((employee.Id, date));
            imported++;
        }

        await db.SaveChangesAsync();
        return new CsvImportResultDto(imported, employeesCreated, duplicatesSkipped, warnings);
    }

    private static void RecalculateFields(AttendanceRecord record)
    {
        if (record.ClockIn.HasValue)
        {
            var scheduleStart = DefaultDayStart;
            record.IsLateArrival = record.ClockIn.Value > scheduleStart.AddMinutes(5);
        }

        if (record.ClockIn.HasValue && record.ClockOut.HasValue)
        {
            var worked = record.ClockOut.Value.ToTimeSpan() - record.ClockIn.Value.ToTimeSpan();
            if (worked < TimeSpan.Zero) worked += TimeSpan.FromHours(24);
            record.WorkTime = worked;

            var standard = TimeSpan.FromHours(8);
            record.Overtime = worked > standard ? worked - standard : TimeSpan.Zero;
            record.IsMissingClockOut = false;
        }
    }

    private static bool TryParseDate(string s, out DateOnly date)
    {
        return DateOnly.TryParseExact(s, ["dd-MMM-yy", "dd-MMM-yyyy", "yyyy-MM-dd", "dd/MM/yyyy"],
            CultureInfo.InvariantCulture, DateTimeStyles.None, out date);
    }

    private static TimeOnly? TryParseTime(string s)
    {
        if (string.IsNullOrWhiteSpace(s)) return null;
        return TimeOnly.TryParse(s, out var t) ? t : null;
    }

    private static TimeSpan? TryParseTimeSpan(string s)
    {
        if (string.IsNullOrWhiteSpace(s) || s == "00:00") return null;
        if (TimeSpan.TryParseExact(s, [@"h\:mm", @"hh\:mm", @"hhh\:mm"], CultureInfo.InvariantCulture, out var ts)) return ts;
        // Handle cumulative hours like "683:14"
        var parts = s.Split(':');
        if (parts.Length == 2 && int.TryParse(parts[0], out var h) && int.TryParse(parts[1], out var m))
            return new TimeSpan(h, m, 0);
        return null;
    }

    private static TimeSpan SumTimeSpans(IEnumerable<TimeSpan?> spans)
        => spans.Where(s => s.HasValue).Aggregate(TimeSpan.Zero, (acc, s) => acc + s!.Value);

    private static AttendanceRecordDto MapToDto(AttendanceRecord a) => new(
        a.Id, a.Date, a.ClockIn, a.ClockOut, a.WorkTime, a.Overtime, a.NightHours,
        a.IsLateArrival, a.IsAbsent, a.IsMissingClockOut, a.IsManualOverride, a.ManagerComment,
        a.EmployeeId, a.Employee.FullName, a.Employee.Department);

}
