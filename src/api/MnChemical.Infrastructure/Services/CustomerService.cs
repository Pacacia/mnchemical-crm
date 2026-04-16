namespace MnChemical.Infrastructure.Services;

using Microsoft.EntityFrameworkCore;
using MnChemical.Application.DTOs;
using MnChemical.Application.Services;
using MnChemical.Domain.Entities;
using MnChemical.Infrastructure.Data;

public class CustomerService(AppDbContext db) : ICustomerService
{
    public async Task<List<CustomerDto>> GetAllAsync()
    {
        return await db.Customers
            .OrderBy(c => c.Name)
            .Select(c => new CustomerDto(
                c.Id, c.Name, c.Country, c.City, c.Address,
                c.VatNumber, c.RegistrationNumber,
                c.ContactPerson, c.Phone, c.Email,
                c.CreatedAt, c.Orders.Count))
            .ToListAsync();
    }

    public async Task<CustomerDto?> GetByIdAsync(Guid id)
    {
        return await db.Customers
            .Where(c => c.Id == id)
            .Select(c => new CustomerDto(
                c.Id, c.Name, c.Country, c.City, c.Address,
                c.VatNumber, c.RegistrationNumber,
                c.ContactPerson, c.Phone, c.Email,
                c.CreatedAt, c.Orders.Count))
            .FirstOrDefaultAsync();
    }

    public async Task<CustomerDto> CreateAsync(CreateCustomerDto dto)
    {
        var customer = new Customer
        {
            Name = dto.Name,
            Country = dto.Country,
            City = dto.City,
            Address = dto.Address,
            VatNumber = dto.VatNumber,
            RegistrationNumber = dto.RegistrationNumber,
            ContactPerson = dto.ContactPerson,
            Phone = dto.Phone,
            Email = dto.Email
        };

        db.Customers.Add(customer);
        await db.SaveChangesAsync();

        return new CustomerDto(
            customer.Id, customer.Name, customer.Country, customer.City, customer.Address,
            customer.VatNumber, customer.RegistrationNumber,
            customer.ContactPerson, customer.Phone, customer.Email,
            customer.CreatedAt, 0);
    }

    public async Task<CustomerDto?> UpdateAsync(Guid id, UpdateCustomerDto dto)
    {
        var customer = await db.Customers.FindAsync(id);
        if (customer is null) return null;

        customer.Name = dto.Name;
        customer.Country = dto.Country;
        customer.City = dto.City;
        customer.Address = dto.Address;
        customer.VatNumber = dto.VatNumber;
        customer.RegistrationNumber = dto.RegistrationNumber;
        customer.ContactPerson = dto.ContactPerson;
        customer.Phone = dto.Phone;
        customer.Email = dto.Email;

        await db.SaveChangesAsync();
        return (await GetByIdAsync(id))!;
    }

    public async Task<bool> DeleteAsync(Guid id)
    {
        var customer = await db.Customers.FindAsync(id);
        if (customer is null) return false;

        db.Customers.Remove(customer);
        await db.SaveChangesAsync();
        return true;
    }
}
