namespace MnChemical.Domain.Entities;

using MnChemical.Domain.Common;

public class Employee : BaseEntity
{
    public required string BadgeId { get; set; }
    public required string FullName { get; set; }
    public string? Department { get; set; }
    public string? Shift { get; set; }
    public bool IsActive { get; set; } = true;

    public ICollection<AttendanceRecord> AttendanceRecords { get; set; } = [];
}

public class AttendanceRecord : BaseEntity
{
    public DateOnly Date { get; set; }
    public TimeOnly? ClockIn { get; set; }
    public TimeOnly? ClockOut { get; set; }
    public TimeSpan? WorkTime { get; set; }
    public TimeSpan? Overtime { get; set; }
    public TimeSpan? NightHours { get; set; }
    public bool IsLateArrival { get; set; }

    public Guid EmployeeId { get; set; }
    public Employee Employee { get; set; } = null!;
}
