namespace MnChemical.Infrastructure.Services;

using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using MnChemical.Application.DTOs;
using MnChemical.Application.Services;
using MnChemical.Domain.Entities;
using MnChemical.Infrastructure.Data;

public class AuthService(AppDbContext db, IConfiguration config) : IAuthService
{
    public async Task<AuthResponseDto?> LoginAsync(LoginDto dto)
    {
        var user = await db.Set<User>().FirstOrDefaultAsync(u => u.Username == dto.Username && u.IsActive);
        if (user is null || !BCrypt.Net.BCrypt.Verify(dto.Password, user.PasswordHash))
            return null;

        return new AuthResponseDto(GenerateToken(user), MapToDto(user));
    }

    public async Task<AuthResponseDto> RegisterAsync(RegisterDto dto)
    {
        var user = new User
        {
            Username = dto.Username,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password),
            FullName = dto.FullName,
            Email = dto.Email,
            Role = dto.Role,
        };
        db.Set<User>().Add(user);
        await db.SaveChangesAsync();
        return new AuthResponseDto(GenerateToken(user), MapToDto(user));
    }

    public async Task<List<UserDto>> GetAllUsersAsync()
    {
        return await db.Set<User>().OrderBy(u => u.FullName).Select(u => MapToDto(u)).ToListAsync();
    }

    public async Task<UserDto?> UpdateUserAsync(Guid id, UpdateUserDto dto)
    {
        var user = await db.Set<User>().FindAsync(id);
        if (user is null) return null;
        user.FullName = dto.FullName;
        user.Email = dto.Email;
        user.Role = dto.Role;
        user.IsActive = dto.IsActive;
        await db.SaveChangesAsync();
        return MapToDto(user);
    }

    public async Task SeedAdminAsync()
    {
        if (await db.Set<User>().AnyAsync()) return;
        var admin = new User
        {
            Username = "admin",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("admin123"),
            FullName = "Administrator",
            Role = UserRole.Admin,
        };
        db.Set<User>().Add(admin);
        await db.SaveChangesAsync();
    }

    private string GenerateToken(User user)
    {
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(
            config["Jwt:Key"] ?? "MnChemicalCrmSuperSecretKey12345678"));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
        var token = new JwtSecurityToken(
            issuer: config["Jwt:Issuer"] ?? "MnChemicalCrm",
            audience: config["Jwt:Audience"] ?? "MnChemicalCrm",
            claims: [
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                new Claim(ClaimTypes.Name, user.Username),
                new Claim(ClaimTypes.Role, user.Role.ToString()),
                new Claim("fullName", user.FullName),
            ],
            expires: DateTime.UtcNow.AddDays(7),
            signingCredentials: creds);
        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    private static UserDto MapToDto(User u) => new(u.Id, u.Username, u.FullName, u.Email, u.Role, u.IsActive);
}
