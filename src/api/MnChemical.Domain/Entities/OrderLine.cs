namespace MnChemical.Domain.Entities;

using MnChemical.Domain.Common;

public class OrderLine : BaseEntity
{
    public required string ProductDescription { get; set; }
    public ProductType ProductType { get; set; }
    public decimal QuantityTons { get; set; }
    public decimal UnitPriceUsd { get; set; }
    public decimal TotalPriceUsd { get; set; }
    public string? PackagingType { get; set; }

    public Guid OrderId { get; set; }
    public Order Order { get; set; } = null!;
}

public enum ProductType
{
    MnO,
    MnO2
}
