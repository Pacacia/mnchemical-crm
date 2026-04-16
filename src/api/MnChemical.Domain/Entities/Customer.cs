namespace MnChemical.Domain.Entities;

using MnChemical.Domain.Common;

public class Customer : BaseEntity
{
    public required string Name { get; set; }
    public string? Country { get; set; }
    public string? City { get; set; }
    public string? Address { get; set; }
    public string? VatNumber { get; set; }
    public string? RegistrationNumber { get; set; }
    public string? ContactPerson { get; set; }
    public string? Phone { get; set; }
    public string? Email { get; set; }

    public ICollection<Order> Orders { get; set; } = [];
}
