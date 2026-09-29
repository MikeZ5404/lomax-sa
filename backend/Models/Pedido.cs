namespace Lomax.Api.Models;

public class Pedido
{
    public int IdPedido { get; set; }
    public DateTime Fecha { get; set; }
    public string Estado { get; set; } = "Registrado";
    public decimal Total { get; set; }

    public int IdCliente { get; set; }
    public Cliente Cliente { get; set; } = null!;

    public ICollection<DetallePedido> Detalles { get; set; } = [];
}