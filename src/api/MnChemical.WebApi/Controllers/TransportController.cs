namespace MnChemical.WebApi.Controllers;

using Microsoft.AspNetCore.Mvc;
using MnChemical.Application.DTOs;
using MnChemical.Application.Services;

using Microsoft.AspNetCore.Authorization;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class TransportController(ITransportService transportService) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<List<TransportRecordDto>>> GetAll()
        => Ok(await transportService.GetAllAsync());

    [HttpGet("by-shipment/{shipmentId:guid}")]
    public async Task<ActionResult<List<TransportRecordDto>>> GetByShipment(Guid shipmentId)
        => Ok(await transportService.GetByShipmentAsync(shipmentId));

    [HttpGet("unmatched-shipments")]
    public async Task<ActionResult<List<ShipmentDto>>> GetUnmatchedShipments()
        => Ok(await transportService.GetUnmatchedShipmentsAsync());

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<TransportRecordDto>> GetById(Guid id)
    {
        var record = await transportService.GetByIdAsync(id);
        return record is null ? NotFound() : Ok(record);
    }

    [HttpPost]
    public async Task<ActionResult<TransportRecordDto>> Create(CreateTransportRecordDto dto)
    {
        var record = await transportService.CreateAsync(dto);
        return CreatedAtAction(nameof(GetById), new { id = record.Id }, record);
    }

    [HttpPut("{id:guid}")]
    public async Task<ActionResult<TransportRecordDto>> Update(Guid id, CreateTransportRecordDto dto)
    {
        var record = await transportService.UpdateAsync(id, dto);
        return record is null ? NotFound() : Ok(record);
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id)
        => await transportService.DeleteAsync(id) ? NoContent() : NotFound();
}
