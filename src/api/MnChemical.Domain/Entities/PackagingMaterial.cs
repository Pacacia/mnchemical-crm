namespace MnChemical.Domain.Entities;

using MnChemical.Domain.Common;

public class PackagingMaterial : BaseEntity
{
    public required string Code { get; set; }
    public required string Name { get; set; }
    public required string SubType { get; set; }
    public string? Description { get; set; }
    public required string UnitOfMeasure { get; set; }

    public ICollection<MaterialLot> Lots { get; set; } = [];
}

public class MaterialLot : BaseEntity
{
    public required string LotCode { get; set; }
    public DateTime PurchaseDate { get; set; }
    public decimal InitialQuantity { get; set; }
    public decimal CurrentBalance { get; set; }

    public Guid MaterialId { get; set; }
    public PackagingMaterial Material { get; set; } = null!;

    public ICollection<MaterialConsumption> Consumptions { get; set; } = [];
}

public class MaterialConsumption : BaseEntity
{
    public decimal Quantity { get; set; }
    public DateTime ConsumedDate { get; set; }

    public Guid ShipmentId { get; set; }
    public Shipment Shipment { get; set; } = null!;

    public Guid MaterialLotId { get; set; }
    public MaterialLot MaterialLot { get; set; } = null!;
}
