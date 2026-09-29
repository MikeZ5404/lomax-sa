using Lomax.Api.Services;
using Microsoft.AspNetCore.Mvc;

namespace Lomax.Api.Controllers;

[ApiController]
[Route("api/productos")]
public class ProductosController(ProductoService service) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> Get()
    {
        return Ok(await service.GetAllAsync());
    }
}