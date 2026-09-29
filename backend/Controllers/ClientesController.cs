using Lomax.Api.Services;
using Microsoft.AspNetCore.Mvc;

namespace Lomax.Api.Controllers;

[ApiController]
[Route("api/clientes")]
public class ClientesController(ClienteService service) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> Get()
    {
        return Ok(await service.GetAllAsync());
    }
}