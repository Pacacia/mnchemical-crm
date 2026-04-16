namespace MnChemical.Infrastructure.Services;

using Microsoft.EntityFrameworkCore;
using MnChemical.Application.Services;
using MnChemical.Infrastructure.Data;
using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;

public class InvoiceService(AppDbContext db) : IInvoiceService
{
    public async Task<byte[]> GenerateInvoicePdfAsync(Guid orderId)
    {
        var order = await db.Orders
            .Include(o => o.Customer)
            .Include(o => o.Lines)
            .FirstOrDefaultAsync(o => o.Id == orderId)
            ?? throw new InvalidOperationException("Order not found");

        var totalAmount = order.Lines.Sum(l => l.TotalPriceUsd);

        var document = Document.Create(container =>
        {
            container.Page(page =>
            {
                page.Size(PageSizes.A4);
                page.Margin(40);
                page.DefaultTextStyle(x => x.FontSize(10));

                page.Header().Column(col =>
                {
                    col.Item().Row(row =>
                    {
                        row.RelativeItem().Text("COMMERCIAL INVOICE").Bold().FontSize(16);
                        row.ConstantItem(200).AlignRight().Column(right =>
                        {
                            right.Item().Text($"Invoice #{order.InvoiceNumber}").Bold();
                            right.Item().Text($"Date: {order.OrderDate:dd.MM.yyyy}");
                        });
                    });
                    col.Item().PaddingTop(5).LineHorizontal(1).LineColor(Colors.Grey.Medium);
                });

                page.Content().PaddingTop(15).Column(col =>
                {
                    // Seller / Buyer
                    col.Item().Row(row =>
                    {
                        row.RelativeItem().Border(1).BorderColor(Colors.Grey.Lighten2).Padding(10).Column(seller =>
                        {
                            seller.Item().Text("SELLER").Bold().FontSize(9);
                            seller.Item().Text("MnChemical Georgia LLC");
                            seller.Item().Text("2 Mshvidoba Str., 3700 Rustavi, Georgia");
                            seller.Item().Text("Bank: Bank of Georgia");
                            seller.Item().Text("SWIFT: BAGAGE22");
                        });
                        row.ConstantItem(15);
                        row.RelativeItem().Border(1).BorderColor(Colors.Grey.Lighten2).Padding(10).Column(buyer =>
                        {
                            buyer.Item().Text("BUYER").Bold().FontSize(9);
                            buyer.Item().Text(order.Customer.Name);
                            if (order.Customer.Address != null) buyer.Item().Text(order.Customer.Address);
                            if (order.Customer.City != null || order.Customer.Country != null)
                                buyer.Item().Text($"{order.Customer.City}, {order.Customer.Country}");
                            if (order.Customer.VatNumber != null) buyer.Item().Text($"VAT: {order.Customer.VatNumber}");
                        });
                    });

                    // Terms
                    col.Item().PaddingTop(10).Row(row =>
                    {
                        if (order.Incoterms != null)
                            row.RelativeItem().Text($"Delivery Terms: {order.Incoterms}").FontSize(9);
                        if (order.PaymentTerms != null)
                            row.RelativeItem().Text($"Payment Terms: {order.PaymentTerms}").FontSize(9);
                    });

                    // Product table
                    col.Item().PaddingTop(15).Table(table =>
                    {
                        table.ColumnsDefinition(cols =>
                        {
                            cols.RelativeColumn(3);
                            cols.RelativeColumn(1);
                            cols.RelativeColumn(1);
                            cols.RelativeColumn(1);
                        });

                        table.Header(header =>
                        {
                            header.Cell().Background(Colors.Grey.Lighten3).Padding(5).Text("PRODUCT DESCRIPTION").Bold().FontSize(9);
                            header.Cell().Background(Colors.Grey.Lighten3).Padding(5).AlignRight().Text("QTY (Mt)").Bold().FontSize(9);
                            header.Cell().Background(Colors.Grey.Lighten3).Padding(5).AlignRight().Text("PRICE/Mt (USD)").Bold().FontSize(9);
                            header.Cell().Background(Colors.Grey.Lighten3).Padding(5).AlignRight().Text("TOTAL (USD)").Bold().FontSize(9);
                        });

                        foreach (var line in order.Lines)
                        {
                            var desc = line.ProductDescription;
                            if (line.PackagingType != null) desc += $", {line.PackagingType}";

                            table.Cell().BorderBottom(1).BorderColor(Colors.Grey.Lighten2).Padding(5).Text(desc);
                            table.Cell().BorderBottom(1).BorderColor(Colors.Grey.Lighten2).Padding(5).AlignRight().Text($"{line.QuantityTons:N3}");
                            table.Cell().BorderBottom(1).BorderColor(Colors.Grey.Lighten2).Padding(5).AlignRight().Text($"{line.UnitPriceUsd:N2}");
                            table.Cell().BorderBottom(1).BorderColor(Colors.Grey.Lighten2).Padding(5).AlignRight().Text($"{line.TotalPriceUsd:N2}");
                        }

                        // Total row
                        table.Cell().ColumnSpan(3).Padding(5).AlignRight().Text("TOTAL:").Bold();
                        table.Cell().Padding(5).AlignRight().Text($"USD {totalAmount:N2}").Bold();
                    });

                    // Declarations
                    col.Item().PaddingTop(20).Text("This cargo is NOT classified as IMO Dangerous Goods.").FontSize(8).Italic();
                    col.Item().PaddingTop(3).Text("Origin of goods: Georgia").FontSize(8).Italic();

                    // Signature
                    col.Item().PaddingTop(30).Row(row =>
                    {
                        row.RelativeItem();
                        row.ConstantItem(200).Column(sig =>
                        {
                            sig.Item().LineHorizontal(1);
                            sig.Item().PaddingTop(3).Text("Financial Manager: Z. Sanaia").FontSize(9);
                            sig.Item().Text("MnChemical Georgia LLC").FontSize(8).FontColor(Colors.Grey.Medium);
                        });
                    });
                });
            });
        });

        return document.GeneratePdf();
    }

    public async Task<byte[]> GeneratePackingListPdfAsync(Guid orderId)
    {
        var order = await db.Orders
            .Include(o => o.Customer)
            .Include(o => o.Shipments)
            .FirstOrDefaultAsync(o => o.Id == orderId)
            ?? throw new InvalidOperationException("Order not found");

        var document = Document.Create(container =>
        {
            container.Page(page =>
            {
                page.Size(PageSizes.A4);
                page.Margin(40);
                page.DefaultTextStyle(x => x.FontSize(10));

                page.Header().Column(col =>
                {
                    col.Item().Row(row =>
                    {
                        row.RelativeItem().Text("PACKING LIST").Bold().FontSize(16);
                        row.ConstantItem(200).AlignRight().Column(right =>
                        {
                            right.Item().Text($"Packing List #{order.InvoiceNumber}").Bold();
                            right.Item().Text($"Date: {order.OrderDate:dd.MM.yyyy}");
                        });
                    });
                    col.Item().PaddingTop(5).LineHorizontal(1).LineColor(Colors.Grey.Medium);
                });

                page.Content().PaddingTop(15).Column(col =>
                {
                    col.Item().Text($"Shipper: MnChemical Georgia LLC, 2 Mshvidoba Str., 3700 Rustavi, Georgia").FontSize(9);
                    col.Item().PaddingTop(3).Text($"Consignee: {order.Customer.Name}, {order.Customer.City}, {order.Customer.Country}").FontSize(9);

                    col.Item().PaddingTop(15).Table(table =>
                    {
                        table.ColumnsDefinition(cols =>
                        {
                            cols.ConstantColumn(30);
                            cols.RelativeColumn(2);
                            cols.RelativeColumn(1);
                            cols.RelativeColumn(1);
                            cols.RelativeColumn(1);
                            cols.RelativeColumn(1);
                            cols.RelativeColumn(1);
                            cols.RelativeColumn(1);
                        });

                        table.Header(header =>
                        {
                            var hdrStyle = TextStyle.Default.FontSize(8).SemiBold();
                            header.Cell().Background(Colors.Grey.Lighten3).Padding(4).Text("#").Style(hdrStyle);
                            header.Cell().Background(Colors.Grey.Lighten3).Padding(4).Text("Container #").Style(hdrStyle);
                            header.Cell().Background(Colors.Grey.Lighten3).Padding(4).AlignRight().Text("Net (kg)").Style(hdrStyle);
                            header.Cell().Background(Colors.Grey.Lighten3).Padding(4).AlignRight().Text("Gross (kg)").Style(hdrStyle);
                            header.Cell().Background(Colors.Grey.Lighten3).Padding(4).Text("Batch #").Style(hdrStyle);
                            header.Cell().Background(Colors.Grey.Lighten3).Padding(4).AlignRight().Text("Big bags").Style(hdrStyle);
                            header.Cell().Background(Colors.Grey.Lighten3).Padding(4).AlignRight().Text("25kg bags").Style(hdrStyle);
                            header.Cell().Background(Colors.Grey.Lighten3).Padding(4).AlignRight().Text("Pallets").Style(hdrStyle);
                        });

                        int i = 1;
                        foreach (var s in order.Shipments)
                        {
                            table.Cell().BorderBottom(1).BorderColor(Colors.Grey.Lighten2).Padding(4).Text($"{i++}");
                            table.Cell().BorderBottom(1).BorderColor(Colors.Grey.Lighten2).Padding(4).Text(s.ContainerNumber);
                            table.Cell().BorderBottom(1).BorderColor(Colors.Grey.Lighten2).Padding(4).AlignRight().Text($"{s.NetWeightKg:N0}");
                            table.Cell().BorderBottom(1).BorderColor(Colors.Grey.Lighten2).Padding(4).AlignRight().Text($"{s.GrossWeightKg:N0}");
                            table.Cell().BorderBottom(1).BorderColor(Colors.Grey.Lighten2).Padding(4).Text(s.BatchNumber);
                            table.Cell().BorderBottom(1).BorderColor(Colors.Grey.Lighten2).Padding(4).AlignRight().Text($"{s.BigBagCount}");
                            table.Cell().BorderBottom(1).BorderColor(Colors.Grey.Lighten2).Padding(4).AlignRight().Text($"{s.SmallBagCount}");
                            table.Cell().BorderBottom(1).BorderColor(Colors.Grey.Lighten2).Padding(4).AlignRight().Text($"{s.PalletCount}");
                        }

                        // Totals
                        table.Cell().ColumnSpan(2).Padding(4).Text("TOTAL").Bold().FontSize(9);
                        table.Cell().Padding(4).AlignRight().Text($"{order.Shipments.Sum(s => s.NetWeightKg):N0}").Bold();
                        table.Cell().Padding(4).AlignRight().Text($"{order.Shipments.Sum(s => s.GrossWeightKg):N0}").Bold();
                        table.Cell().Padding(4);
                        table.Cell().Padding(4).AlignRight().Text($"{order.Shipments.Sum(s => s.BigBagCount)}").Bold();
                        table.Cell().Padding(4).AlignRight().Text($"{order.Shipments.Sum(s => s.SmallBagCount)}").Bold();
                        table.Cell().Padding(4).AlignRight().Text($"{order.Shipments.Sum(s => s.PalletCount)}").Bold();
                    });

                    if (order.Shipments.Count == 0)
                        col.Item().PaddingTop(10).Text("No shipments recorded for this order.").Italic().FontColor(Colors.Grey.Medium);

                    col.Item().PaddingTop(20).Text("Origin of goods: Georgia").FontSize(8).Italic();

                    col.Item().PaddingTop(30).Row(row =>
                    {
                        row.RelativeItem();
                        row.ConstantItem(220).Column(sig =>
                        {
                            sig.Item().LineHorizontal(1);
                            sig.Item().PaddingTop(3).Text("Director of Operations: N. Kalmakhelidze").FontSize(9);
                            sig.Item().Text("MnChemical Georgia LLC").FontSize(8).FontColor(Colors.Grey.Medium);
                        });
                    });
                });
            });
        });

        return document.GeneratePdf();
    }
}
