namespace MnChemical.Application.DTOs;

using System.ComponentModel.DataAnnotations;
using MnChemical.Domain.Entities;

public record LoginDto(
    [Required, StringLength(50)] string Username,
    [Required, MinLength(4)] string Password);

public record RegisterDto(
    [Required, StringLength(50, MinimumLength = 3)] string Username,
    [Required, MinLength(6)] string Password,
    [Required, StringLength(100)] string FullName,
    [EmailAddress] string? Email,
    UserRole Role);

public record AuthResponseDto(string Token, UserDto User);
public record UserDto(Guid Id, string Username, string FullName, string? Email, UserRole Role, bool IsActive);

public record UpdateUserDto(
    [Required, StringLength(100)] string FullName,
    [EmailAddress] string? Email,
    UserRole Role,
    bool IsActive);
