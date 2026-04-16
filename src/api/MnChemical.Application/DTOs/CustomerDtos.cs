namespace MnChemical.Application.DTOs;

public record CustomerDto(
    Guid Id,
    string Name,
    string? Country,
    string? City,
    string? Address,
    string? VatNumber,
    string? RegistrationNumber,
    string? ContactPerson,
    string? Phone,
    string? Email,
    DateTime CreatedAt,
    int OrderCount);

public record CreateCustomerDto(
    string Name,
    string? Country,
    string? City,
    string? Address,
    string? VatNumber,
    string? RegistrationNumber,
    string? ContactPerson,
    string? Phone,
    string? Email);

public record UpdateCustomerDto(
    string Name,
    string? Country,
    string? City,
    string? Address,
    string? VatNumber,
    string? RegistrationNumber,
    string? ContactPerson,
    string? Phone,
    string? Email);
