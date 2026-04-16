namespace MnChemical.Domain.Entities;

using MnChemical.Domain.Common;

public class User : BaseEntity
{
    public required string Username { get; set; }
    public required string PasswordHash { get; set; }
    public required string FullName { get; set; }
    public string? Email { get; set; }
    public UserRole Role { get; set; } = UserRole.Staff;
    public bool IsActive { get; set; } = true;
}

public enum UserRole
{
    Admin,
    SalesManager,
    Staff,
    HrManager,
    DepartmentManager,
    Accounting,
    Production
}
