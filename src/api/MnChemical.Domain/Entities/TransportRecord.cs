namespace MnChemical.Domain.Entities;

using MnChemical.Domain.Common;

public class TransportRecord : BaseEntity
{
    public required string CarrierInvoiceNumber { get; set; }
    public DateTime InvoiceDate { get; set; }
    public required string CarrierName { get; set; }
    public required string RouteLeg { get; set; }
    public decimal CostUsd { get; set; }
    public decimal CostGel { get; set; }
    public decimal ExchangeRate { get; set; }
    public decimal VatRate { get; set; }
    public decimal VatAmountUsd { get; set; }
    public decimal TotalWithVatUsd { get; set; }

    public Guid ShipmentId { get; set; }
    public Shipment Shipment { get; set; } = null!;
}
