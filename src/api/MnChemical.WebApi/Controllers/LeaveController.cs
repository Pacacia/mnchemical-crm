namespace MnChemical.WebApi.Controllers;

using Microsoft.AspNetCore.Mvc;
using MnChemical.Application.DTOs;
using MnChemical.Application.Services;
using MnChemical.Domain.Entities;

[ApiController]
[Route("api/[controller]")]
public class LeaveController(ILeaveService leaveService) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<List<LeaveRequestDto>>> GetAll(
        [FromQuery] Guid? employeeId = null, [FromQuery] LeaveStatus? status = null)
        => Ok(await leaveService.GetAllAsync(new LeaveFilterDto(employeeId, status)));

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<LeaveRequestDto>> GetById(Guid id)
    {
        var leave = await leaveService.GetByIdAsync(id);
        return leave is null ? NotFound() : Ok(leave);
    }

    [HttpPost]
    public async Task<ActionResult<LeaveRequestDto>> Create(CreateLeaveRequestDto dto)
    {
        var leave = await leaveService.CreateAsync(dto);
        return CreatedAtAction(nameof(GetById), new { id = leave.Id }, leave);
    }

    [HttpPatch("{id:guid}/review")]
    public async Task<ActionResult<LeaveRequestDto>> Review(Guid id, ReviewLeaveRequestDto dto)
    {
        var leave = await leaveService.ReviewAsync(id, dto);
        return leave is null ? NotFound() : Ok(leave);
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id)
        => await leaveService.DeleteAsync(id) ? NoContent() : NotFound();
}
