namespace MnChemical.WebApi.Controllers;

using Microsoft.AspNetCore.Mvc;
using MnChemical.Application.DTOs;
using MnChemical.Application.Services;

using Microsoft.AspNetCore.Authorization;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class EmployeesController(IEmployeeService employeeService) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<List<EmployeeDto>>> GetAll([FromQuery] bool includeInactive = false)
        => Ok(await employeeService.GetAllAsync(includeInactive));

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<EmployeeDto>> GetById(Guid id)
    {
        var employee = await employeeService.GetByIdAsync(id);
        return employee is null ? NotFound() : Ok(employee);
    }

    [HttpPost]
    public async Task<ActionResult<EmployeeDto>> Create(CreateEmployeeDto dto)
    {
        var employee = await employeeService.CreateAsync(dto);
        return CreatedAtAction(nameof(GetById), new { id = employee.Id }, employee);
    }

    [HttpPut("{id:guid}")]
    public async Task<ActionResult<EmployeeDto>> Update(Guid id, UpdateEmployeeDto dto)
    {
        var employee = await employeeService.UpdateAsync(id, dto);
        return employee is null ? NotFound() : Ok(employee);
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id)
        => await employeeService.DeleteAsync(id) ? NoContent() : NotFound();
}
