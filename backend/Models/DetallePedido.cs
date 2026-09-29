namespace Lomax.Api.Models;

public class DetallePedido
{
    public int IdDetalle { get; set; }

    public int IdPedido { get; set; }
    public Pedido Pedido { get; set; } = null!;

    public int IdProducto { get; set; }
    public Producto Producto { get; set; } = null!;

    public int Cantidad { get; set; }
    public decimal PrecioUnitario { get; set; }
    public decimal Subtotal { get; set; }
}