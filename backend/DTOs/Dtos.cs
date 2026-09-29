namespace Lomax.Api.DTOs;

public record ProductoDto(
    int IdProducto,
    string Nombre,
    string Descripcion,
    decimal Precio,
    int Stock);

public record ClienteDto(
    int IdCliente,
    string Nombre,
    string Direccion,
    string Telefono,
    string Email);

public record PedidoResumenDto(
    int IdPedido,
    DateTime Fecha,
    string Estado,
    decimal Total,
    int IdCliente,
    string Cliente);

public record DetallePedidoDto(
    int IdProducto,
    string Producto,
    int Cantidad,
    decimal PrecioUnitario,
    decimal Subtotal);

public record PedidoDetalleDto(
    int IdPedido,
    DateTime Fecha,
    string Estado,
    decimal Total,
    int IdCliente,
    string Cliente,
    List<DetallePedidoDto> Detalles);

public class CrearPedidoRequest
{
    public int IdCliente { get; set; }
    public List<CrearPedidoDetalleRequest> Detalles { get; set; } = [];
}

public class CrearPedidoDetalleRequest
{
    public int IdProducto { get; set; }
    public int Cantidad { get; set; }
}