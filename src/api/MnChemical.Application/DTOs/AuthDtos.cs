namespace MnChemical.Application.DTOs;

using MnChemical.Domain.Entities;

public record LoginDto(string Username, string Password);
public record RegisterDto(string Username, string Password, string FullName, string? Email, UserRole Role);
public record AuthResponseDto(string Token, UserDto User);
public record UserDto(Guid Id, string Username, string FullName, string? Email, UserRole Role, bool IsActive);
public record UpdateUserDto(string FullName, string? Email, UserRole Role, bool IsActive);
