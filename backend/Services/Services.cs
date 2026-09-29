using Lomax.Api.Data;
using Lomax.Api.DTOs;
using Lomax.Api.Models;
using Lomax.Api.Repositories;

namespace Lomax.Api.Services;

public class ProductoService(ProductoRepository repository)
{
    public async Task<List<ProductoDto>> GetAllAsync()
    {
        var productos = await repository.GetAllAsync();

        return productos.Select(x =>
            new ProductoDto(
                x.IdProducto,
                x.Nombre,
                x.Descripcion,
                x.Precio,
                x.Stock)).ToList();
    }
}

public class ClienteService(ClienteRepository repository)
{
    public async Task<List<ClienteDto>> GetAllAsync()
    {
        var clientes = await repository.GetAllAsync();

        return clientes.Select(x =>
            new ClienteDto(
                x.IdCliente,
                x.Nombre,
                x.Direccion,
                x.Telefono,
                x.Email)).ToList();
    }
}

public class PedidoService(
    PedidoRepository pedidoRepository,
    ClienteRepository clienteRepository,
    ProductoRepository productoRepository,
    AppDbContext db)
{
    public async Task<List<PedidoResumenDto>> GetAllAsync()
    {
        var pedidos = await pedidoRepository.GetAllAsync();

        return pedidos.Select(x =>
            new PedidoResumenDto(
                x.IdPedido,
                x.Fecha,
                x.Estado,
                x.Total,
                x.IdCliente,
                x.Cliente.Nombre)).ToList();
    }

    public async Task<PedidoDetalleDto?> GetByIdAsync(int id)
    {
        var pedido = await pedidoRepository.GetByIdAsync(id);

        if (pedido is null)
            return null;

        return new PedidoDetalleDto(
            pedido.IdPedido,
            pedido.Fecha,
            pedido.Estado,
            pedido.Total,
            pedido.IdCliente,
            pedido.Cliente.Nombre,
            pedido.Detalles.Select(x =>
                new DetallePedidoDto(
                    x.IdProducto,
                    x.Producto.Nombre,
                    x.Cantidad,
                    x.PrecioUnitario,
                    x.Subtotal)).ToList());
    }

    public async Task<PedidoDetalleDto> CreateAsync(CrearPedidoRequest request)
    {
        var cliente = await clienteRepository.GetByIdAsync(request.IdCliente)
                      ?? throw new InvalidOperationException("Cliente no encontrado.");

        if (request.Detalles.Count == 0)
            throw new InvalidOperationException("El pedido debe contener productos.");

        await using var transaction = await db.Database.BeginTransactionAsync();

        var pedido = new Pedido
        {
            Fecha = DateTime.UtcNow,
            Estado = "Registrado",
            IdCliente = cliente.IdCliente
        };

        decimal total = 0;

        foreach (var item in request.Detalles)
        {
            var producto = await productoRepository.GetByIdAsync(item.IdProducto)
                           ?? throw new InvalidOperationException("Producto no encontrado.");

            if (item.Cantidad <= 0)
                throw new InvalidOperationException("Cantidad inválida.");

            if (producto.Stock < item.Cantidad)
                throw new InvalidOperationException(
                    $"Stock insuficiente para {producto.Nombre}.");

            producto.Stock -= item.Cantidad;

            var subtotal = producto.Precio * item.Cantidad;

            pedido.Detalles.Add(new DetallePedido
            {
                IdProducto = producto.IdProducto,
                Cantidad = item.Cantidad,
                PrecioUnitario = producto.Precio,
                Subtotal = subtotal
            });

            total += subtotal;
        }

        pedido.Total = total;

        pedidoRepository.Add(pedido);

        await db.SaveChangesAsync();
        await transaction.CommitAsync();

        return (await GetByIdAsync(pedido.IdPedido))!;
    }
}