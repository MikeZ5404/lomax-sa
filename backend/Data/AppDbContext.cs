using Lomax.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace Lomax.Api.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options)
        : base(options)
    {
    }

    public DbSet<Producto> Productos => Set<Producto>();
    public DbSet<Cliente> Clientes => Set<Cliente>();
    public DbSet<Pedido> Pedidos => Set<Pedido>();
    public DbSet<DetallePedido> DetallesPedido => Set<DetallePedido>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // ==============================
        // CLAVES PRIMARIAS
        // ==============================

        modelBuilder.Entity<Producto>()
            .HasKey(p => p.IdProducto);

        modelBuilder.Entity<Cliente>()
            .HasKey(c => c.IdCliente);

        modelBuilder.Entity<Pedido>()
            .HasKey(p => p.IdPedido);

        modelBuilder.Entity<DetallePedido>()
            .HasKey(d => d.IdDetalle);


        // ==============================
        // PRECISIÓN DE CAMPOS DECIMALES
        // ==============================

        modelBuilder.Entity<Producto>()
            .Property(p => p.Precio)
            .HasPrecision(12, 2);

        modelBuilder.Entity<Pedido>()
            .Property(p => p.Total)
            .HasPrecision(12, 2);

        modelBuilder.Entity<DetallePedido>()
            .Property(d => d.PrecioUnitario)
            .HasPrecision(12, 2);

        modelBuilder.Entity<DetallePedido>()
            .Property(d => d.Subtotal)
            .HasPrecision(12, 2);


        // ==============================
        // RELACIÓN CLIENTE - PEDIDO
        // Cliente 1 ---- N Pedidos
        // ==============================

        modelBuilder.Entity<Pedido>()
            .HasOne(p => p.Cliente)
            .WithMany(c => c.Pedidos)
            .HasForeignKey(p => p.IdCliente);


        // ==============================
        // RELACIÓN PEDIDO - DETALLE
        // Pedido 1 ---- N Detalles
        // ==============================

        modelBuilder.Entity<DetallePedido>()
            .HasOne(d => d.Pedido)
            .WithMany(p => p.Detalles)
            .HasForeignKey(d => d.IdPedido);


        // ==============================
        // RELACIÓN PRODUCTO - DETALLE
        // Producto 1 ---- N Detalles
        // ==============================

        modelBuilder.Entity<DetallePedido>()
            .HasOne(d => d.Producto)
            .WithMany(p => p.Detalles)
            .HasForeignKey(d => d.IdProducto);
    }
}