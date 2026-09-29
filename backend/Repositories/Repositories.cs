using Lomax.Api.Data;
using Lomax.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace Lomax.Api.Repositories;

public class ProductoRepository(AppDbContext db)
{
    public Task<List<Producto>> GetAllAsync() =>
        db.Productos.AsNoTracking().OrderBy(x => x.IdProducto).ToListAsync();

    public Task<Producto?> GetByIdAsync(int id) =>
        db.Productos.FirstOrDefaultAsync(x => x.IdProducto == id);
}

public class ClienteRepository(AppDbContext db)
{
    public Task<List<Cliente>> GetAllAsync() =>
        db.Clientes.AsNoTracking().OrderBy(x => x.IdCliente).ToListAsync();

    public Task<Cliente?> GetByIdAsync(int id) =>
        db.Clientes.FirstOrDefaultAsync(x => x.IdCliente == id);
}

public class PedidoRepository(AppDbContext db)
{
    public Task<List<Pedido>> GetAllAsync() =>
        db.Pedidos
            .AsNoTracking()
            .Include(x => x.Cliente)
            .OrderByDescending(x => x.IdPedido)
            .ToListAsync();

    public Task<Pedido?> GetByIdAsync(int id) =>
        db.Pedidos
            .AsNoTracking()
            .Include(x => x.Cliente)
            .Include(x => x.Detalles)
                .ThenInclude(x => x.Producto)
            .FirstOrDefaultAsync(x => x.IdPedido == id);

    public void Add(Pedido pedido)
    {
        db.Pedidos.Add(pedido);
    }
}