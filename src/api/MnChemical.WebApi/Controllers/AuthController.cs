namespace MnChemical.WebApi.Controllers;

using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MnChemical.Application.DTOs;
using MnChemical.Application.Services;

[ApiController]
[Route("api/[controller]")]
public class AuthController(IAuthService authService) : ControllerBase
{
    [HttpPost("login")]
    public async Task<ActionResult<AuthResponseDto>> Login(LoginDto dto)
    {
        var result = await authService.LoginAsync(dto);
        return result is null ? Unauthorized(new { error = "Invalid username or password" }) : Ok(result);
    }

    [HttpPost("register")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<AuthResponseDto>> Register(RegisterDto dto)
        => Ok(await authService.RegisterAsync(dto));

    [HttpGet("me")]
    [Authorize]
    public ActionResult GetCurrentUser()
    {
        return Ok(new
        {
            id = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value,
            username = User.FindFirst(System.Security.Claims.ClaimTypes.Name)?.Value,
            role = User.FindFirst(System.Security.Claims.ClaimTypes.Role)?.Value,
            fullName = User.FindFirst("fullName")?.Value,
        });
    }

    [HttpGet("users")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<List<UserDto>>> GetAllUsers()
        => Ok(await authService.GetAllUsersAsync());

    [HttpPut("users/{id:guid}")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<UserDto>> UpdateUser(Guid id, UpdateUserDto dto)
    {
        var user = await authService.UpdateUserAsync(id, dto);
        return user is null ? NotFound() : Ok(user);
    }
}
