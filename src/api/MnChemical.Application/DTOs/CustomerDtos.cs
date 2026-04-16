namespace MnChemical.Application.DTOs;

using System.ComponentModel.DataAnnotations;

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
    [Required, StringLength(200, MinimumLength = 1)] string Name,
    string? Country,
    string? City,
    string? Address,
    string? VatNumber,
    string? RegistrationNumber,
    string? ContactPerson,
    string? Phone,
    [EmailAddress] string? Email);

public record UpdateCustomerDto(
    [Required, StringLength(200, MinimumLength = 1)] string Name,
    string? Country,
    string? City,
    string? Address,
    string? VatNumber,
    string? RegistrationNumber,
    string? ContactPerson,
    string? Phone,
    [EmailAddress] string? Email);
