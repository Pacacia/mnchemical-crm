namespace MnChemical.WebApi.Controllers;

using Microsoft.AspNetCore.Mvc;
using MnChemical.Application.DTOs;
using MnChemical.Application.Services;

using Microsoft.AspNetCore.Authorization;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class ShipmentsController(IShipmentService shipmentService) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<List<ShipmentDto>>> GetAll()
        => Ok(await shipmentService.GetAllAsync());

    [HttpGet("by-order/{orderId:guid}")]
    public async Task<ActionResult<List<ShipmentDto>>> GetByOrder(Guid orderId)
        => Ok(await shipmentService.GetByOrderAsync(orderId));

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<ShipmentDto>> GetById(Guid id)
    {
        var shipment = await shipmentService.GetByIdAsync(id);
        return shipment is null ? NotFound() : Ok(shipment);
    }

    [HttpPost]
    public async Task<ActionResult<ShipmentDto>> Create(CreateShipmentDto dto)
    {
        var shipment = await shipmentService.CreateAsync(dto);
        return CreatedAtAction(nameof(GetById), new { id = shipment.Id }, shipment);
    }

    [HttpPut("{id:guid}")]
    public async Task<ActionResult<ShipmentDto>> Update(Guid id, CreateShipmentDto dto)
    {
        var shipment = await shipmentService.UpdateAsync(id, dto);
        return shipment is null ? NotFound() : Ok(shipment);
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id)
        => await shipmentService.DeleteAsync(id) ? NoContent() : NotFound();
}
