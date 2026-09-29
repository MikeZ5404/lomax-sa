using Lomax.Api.DTOs;
using Lomax.Api.Services;
using Microsoft.AspNetCore.Mvc;

namespace Lomax.Api.Controllers;

[ApiController]
[Route("api/pedidos")]
public class PedidosController(PedidoService service) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> Get()
    {
        return Ok(await service.GetAllAsync());
    }

    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int id)
    {
        var pedido = await service.GetByIdAsync(id);

        return pedido is null ? NotFound() : Ok(pedido);
    }

    [HttpPost]
    public async Task<IActionResult> Create(CrearPedidoRequest request)
    {
        try
        {
            var pedido = await service.CreateAsync(request);

            return CreatedAtAction(
                nameof(GetById),
                new { id = pedido.IdPedido },
                pedido);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { mensaje = ex.Message });
        }
    }
}