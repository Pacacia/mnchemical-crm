namespace MnChemical.Domain.Entities;

using MnChemical.Domain.Common;

public class Order : BaseEntity
{
    public required string InvoiceNumber { get; set; }
    public DateTime OrderDate { get; set; }
    public DateTime? DeliveryDate { get; set; }
    public required string Destination { get; set; }
    public string? Incoterms { get; set; }
    public string? PaymentTerms { get; set; }
    public OrderStatus Status { get; set; } = OrderStatus.New;

    public Guid CustomerId { get; set; }
    public Customer Customer { get; set; } = null!;

    public ICollection<OrderLine> Lines { get; set; } = [];
    public ICollection<Shipment> Shipments { get; set; } = [];
    public ICollection<Payment> Payments { get; set; } = [];
}

public enum OrderStatus
{
    New,
    Confirmed,
    InProduction,
    Shipped,
    Delivered,
    Paid,
    Cancelled
}
