namespace MnChemical.Infrastructure.DependencyInjection;

using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using MnChemical.Application.Interfaces;
using MnChemical.Application.Services;
using MnChemical.Infrastructure.Data;
using MnChemical.Infrastructure.Services;
using QuestPDF.Infrastructure;

public static class ServiceCollectionExtensions
{
    public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration configuration)
    {
        services.AddDbContext<AppDbContext>(options =>
            options.UseNpgsql(configuration.GetConnectionString("DefaultConnection")));

        services.AddScoped<IAppDbContext>(provider => provider.GetRequiredService<AppDbContext>());

        services.AddScoped<ICustomerService, CustomerService>();
        services.AddScoped<IOrderService, OrderService>();
        services.AddScoped<IEmployeeService, EmployeeService>();
        services.AddScoped<IAttendanceService, AttendanceService>();
        services.AddScoped<ILeaveService, LeaveService>();
        services.AddScoped<IInvoiceService, InvoiceService>();
        services.AddScoped<IShipmentService, ShipmentService>();
        services.AddScoped<ITransportService, TransportService>();

        QuestPDF.Settings.License = LicenseType.Community;

        return services;
    }
}
