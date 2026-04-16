namespace MnChemical.WebApi.Controllers;

using Microsoft.AspNetCore.Mvc;
using MnChemical.Application.DTOs;
using MnChemical.Application.Services;

using Microsoft.AspNetCore.Authorization;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class WarehouseController(IWarehouseService warehouseService) : ControllerBase
{
    // Materials
    [HttpGet("materials")]
    public async Task<ActionResult<List<PackagingMaterialDto>>> GetMaterials()
        => Ok(await warehouseService.GetAllMaterialsAsync());

    [HttpGet("materials/{id:guid}")]
    public async Task<ActionResult<PackagingMaterialDto>> GetMaterial(Guid id)
    {
        var m = await warehouseService.GetMaterialByIdAsync(id);
        return m is null ? NotFound() : Ok(m);
    }

    [HttpPost("materials")]
    public async Task<ActionResult<PackagingMaterialDto>> CreateMaterial(CreatePackagingMaterialDto dto)
        => Ok(await warehouseService.CreateMaterialAsync(dto));

    [HttpDelete("materials/{id:guid}")]
    public async Task<IActionResult> DeleteMaterial(Guid id)
        => await warehouseService.DeleteMaterialAsync(id) ? NoContent() : NotFound();

    // Lots
    [HttpGet("lots")]
    public async Task<ActionResult<List<MaterialLotDto>>> GetLotsWithBalance()
        => Ok(await warehouseService.GetAllLotsWithBalanceAsync());

    [HttpGet("lots/by-material/{materialId:guid}")]
    public async Task<ActionResult<List<MaterialLotDto>>> GetLotsByMaterial(Guid materialId)
        => Ok(await warehouseService.GetLotsByMaterialAsync(materialId));

    [HttpPost("lots")]
    public async Task<ActionResult<MaterialLotDto>> CreateLot(CreateMaterialLotDto dto)
        => Ok(await warehouseService.CreateLotAsync(dto));

    [HttpPatch("lots/{id:guid}/receive")]
    public async Task<ActionResult<MaterialLotDto>> ReceiveStock(Guid id, [FromBody] ReceiveStockDto dto)
    {
        var lot = await warehouseService.ReceiveStockAsync(id, dto.Quantity);
        return lot is null ? NotFound() : Ok(lot);
    }

    [HttpDelete("lots/{id:guid}")]
    public async Task<IActionResult> DeleteLot(Guid id)
        => await warehouseService.DeleteLotAsync(id) ? NoContent() : NotFound();

    // Consumption
    [HttpGet("consumption/by-shipment/{shipmentId:guid}")]
    public async Task<ActionResult<List<MaterialConsumptionDto>>> GetConsumptionsByShipment(Guid shipmentId)
        => Ok(await warehouseService.GetConsumptionsByShipmentAsync(shipmentId));

    [HttpPost("consumption")]
    public async Task<ActionResult<MaterialConsumptionDto>> RecordConsumption(CreateMaterialConsumptionDto dto)
    {
        try { return Ok(await warehouseService.RecordConsumptionAsync(dto)); }
        catch (InvalidOperationException ex) { return BadRequest(new { error = ex.Message }); }
    }

    [HttpDelete("consumption/{id:guid}")]
    public async Task<IActionResult> DeleteConsumption(Guid id)
        => await warehouseService.DeleteConsumptionAsync(id) ? NoContent() : NotFound();

    // Reports
    [HttpGet("inventory")]
    public async Task<ActionResult<List<WarehouseInventoryDto>>> GetInventory()
        => Ok(await warehouseService.GetInventoryAsync());

    [HttpGet("shipment-report")]
    public async Task<ActionResult<List<ShipmentMaterialsReportDto>>> GetShipmentReport(
        [FromQuery] DateOnly from, [FromQuery] DateOnly to)
        => Ok(await warehouseService.GetShipmentMaterialsReportAsync(from, to));
}

public record ReceiveStockDto(decimal Quantity);
