namespace MnChemical.Domain.Entities;

using MnChemical.Domain.Common;

public class Employee : BaseEntity
{
    public required string BadgeId { get; set; }
    public required string FullName { get; set; }
    public string? Department { get; set; }
    public string? Position { get; set; }
    public string? Shift { get; set; }
    public WorkSchedule Schedule { get; set; } = WorkSchedule.Day9to18;
    public bool IsActive { get; set; } = true;

    public ICollection<AttendanceRecord> AttendanceRecords { get; set; } = [];
    public ICollection<LeaveRequest> LeaveRequests { get; set; } = [];
}

public enum WorkSchedule
{
    Day9to18,   // 09:00 - 18:00
    Day9to21,   // 09:00 - 21:00
    Night21to9  // 21:00 - 09:00
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
    public bool IsAbsent { get; set; }
    public bool IsMissingClockOut { get; set; }
    public bool IsManualOverride { get; set; }
    public string? ManagerComment { get; set; }

    public Guid EmployeeId { get; set; }
    public Employee Employee { get; set; } = null!;
}

public class LeaveRequest : BaseEntity
{
    public LeaveType Type { get; set; }
    public DateOnly StartDate { get; set; }
    public DateOnly EndDate { get; set; }
    public string? Reason { get; set; }
    public LeaveStatus Status { get; set; } = LeaveStatus.Pending;
    public string? ApprovedBy { get; set; }
    public DateTime? ReviewedAt { get; set; }
    public string? ReviewComment { get; set; }

    public Guid EmployeeId { get; set; }
    public Employee Employee { get; set; } = null!;
}

public enum LeaveType
{
    Vacation,
    Sick,
    Personal
}

public enum LeaveStatus
{
    Pending,
    Approved,
    Rejected
}
