namespace MnChemical.WebApi.Controllers;

using Microsoft.AspNetCore.Mvc;
using MnChemical.Application.DTOs;
using MnChemical.Application.Services;

[ApiController]
[Route("api/[controller]")]
public class AttendanceController(IAttendanceService attendanceService) : ControllerBase
{
    [HttpGet("today")]
    public async Task<ActionResult<TodayAttendanceSummaryDto>> GetToday()
        => Ok(await attendanceService.GetTodaySummaryAsync());

    [HttpGet]
    public async Task<ActionResult<List<AttendanceRecordDto>>> GetByDateRange(
        [FromQuery] DateOnly from, [FromQuery] DateOnly to, [FromQuery] Guid? employeeId = null)
        => Ok(await attendanceService.GetByDateRangeAsync(from, to, employeeId));

    [HttpGet("monthly")]
    public async Task<ActionResult<List<MonthlyEmployeeSummaryDto>>> GetMonthlySummary(
        [FromQuery] int year, [FromQuery] int month)
        => Ok(await attendanceService.GetMonthlySummaryAsync(year, month));

    [HttpPatch("{id:guid}/override")]
    public async Task<ActionResult<AttendanceRecordDto>> ManualOverride(Guid id, ManualOverrideDto dto)
    {
        var record = await attendanceService.ManualOverrideAsync(id, dto);
        return record is null ? NotFound() : Ok(record);
    }

    [HttpPost("import")]
    public async Task<ActionResult<CsvImportResultDto>> ImportCsv(IFormFile file)
    {
        if (file.Length == 0) return BadRequest("Empty file");
        using var stream = file.OpenReadStream();
        return Ok(await attendanceService.ImportCsvAsync(stream));
    }
}
