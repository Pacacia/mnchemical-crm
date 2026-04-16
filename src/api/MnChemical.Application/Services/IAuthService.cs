namespace MnChemical.Application.Services;

using MnChemical.Application.DTOs;

public interface IAuthService
{
    Task<AuthResponseDto?> LoginAsync(LoginDto dto);
    Task<AuthResponseDto> RegisterAsync(RegisterDto dto);
    Task<List<UserDto>> GetAllUsersAsync();
    Task<UserDto?> UpdateUserAsync(Guid id, UpdateUserDto dto);
    Task SeedAdminAsync();
}
