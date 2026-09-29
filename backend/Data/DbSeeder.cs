using Lomax.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace Lomax.Api.Data;

public static class DbSeeder
{
    public static async Task SeedAsync(AppDbContext db)
    {
        if (await db.Productos.AnyAsync())
            return;

        var productos = new List<Producto>
        {
            new() { Nombre="Laptop", Descripcion="Laptop empresarial", Precio=5200, Stock=30 },
            new() { Nombre="Monitor", Descripcion="Monitor 24 pulgadas", Precio=1450, Stock=40 },
            new() { Nombre="Teclado", Descripcion="Teclado USB", Precio=180, Stock=100 },
            new() { Nombre="Mouse", Descripcion="Mouse óptico", Precio=120, Stock=120 },
            new() { Nombre="Impresora", Descripcion="Impresora multifunción", Precio=2100, Stock=20 },
            new() { Nombre="Auriculares", Descripcion="Auriculares USB", Precio=280, Stock=60 },
            new() { Nombre="Router", Descripcion="Router empresarial", Precio=650, Stock=30 },
            new() { Nombre="SSD 1TB", Descripcion="Unidad SSD", Precio=720, Stock=50 },
            new() { Nombre="Memoria RAM", Descripcion="RAM 16 GB", Precio=480, Stock=80 },
            new() { Nombre="Webcam", Descripcion="Webcam Full HD", Precio=350, Stock=45 }
        };

        var clientes = new List<Cliente>
        {
            new() { Nombre="Comercial Norte", Direccion="La Paz", Telefono="70000001", Email="norte@lomax.test" },
            new() { Nombre="Distribuidora Central", Direccion="El Alto", Telefono="70000002", Email="central@lomax.test" },
            new() { Nombre="Comercial Andina", Direccion="La Paz", Telefono="70000003", Email="andina@lomax.test" },
            new() { Nombre="Distribuidora Sur", Direccion="Achocalla", Telefono="70000004", Email="sur@lomax.test" },
            new() { Nombre="Mercado La Paz", Direccion="La Paz", Telefono="70000005", Email="mercado@lomax.test" }
        };

        db.Productos.AddRange(productos);
        db.Clientes.AddRange(clientes);

        await db.SaveChangesAsync();

        for (var i = 1; i <= 20; i++)
        {
            var p1 = productos[(i - 1) % productos.Count];
            var p2 = productos[(i + 2) % productos.Count];

            var d1 = new DetallePedido
            {
                IdProducto = p1.IdProducto,
                Cantidad = 1,
                PrecioUnitario = p1.Precio,
                Subtotal = p1.Precio
            };

            var d2 = new DetallePedido
            {
                IdProducto = p2.IdProducto,
                Cantidad = 2,
                PrecioUnitario = p2.Precio,
                Subtotal = p2.Precio * 2
            };

            db.Pedidos.Add(new Pedido
            {
                Fecha = DateTime.UtcNow.AddDays(-i),
                Estado = "Registrado",
                IdCliente = clientes[(i - 1) % clientes.Count].IdCliente,
                Total = d1.Subtotal + d2.Subtotal,
                Detalles = new List<DetallePedido> { d1, d2 }
            });
        }

        await db.SaveChangesAsync();
    }
}