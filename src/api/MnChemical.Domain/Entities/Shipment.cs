namespace MnChemical.Domain.Entities;

using MnChemical.Domain.Common;

public class Shipment : BaseEntity
{
    public required string BatchNumber { get; set; }
    public required string ContainerNumber { get; set; }
    public decimal NetWeightKg { get; set; }
    public decimal GrossWeightKg { get; set; }
    public int BigBagCount { get; set; }
    public int SmallBagCount { get; set; }
    public int PalletCount { get; set; }
    public DateTime? ShipmentDate { get; set; }
    public DateTime? DepartureDate { get; set; }

    public Guid OrderId { get; set; }
    public Order Order { get; set; } = null!;

    public ICollection<TransportRecord> TransportRecords { get; set; } = [];
    public ICollection<MaterialConsumption> MaterialConsumptions { get; set; } = [];
}
