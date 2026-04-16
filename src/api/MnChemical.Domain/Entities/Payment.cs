namespace MnChemical.Domain.Entities;

using MnChemical.Domain.Common;

public class Payment : BaseEntity
{
    public decimal AmountUsd { get; set; }
    public DateTime PaymentDate { get; set; }
    public string? Reference { get; set; }
    public string? Notes { get; set; }

    public Guid OrderId { get; set; }
    public Order Order { get; set; } = null!;
}
