import { useEffect, useMemo, useState } from "react";
import "./App.css";

function App() {
  const [vista, setVista] = useState("inicio");

  const [productos, setProductos] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [pedidos, setPedidos] = useState([]);
  const [detalle, setDetalle] = useState(null);

  const [clienteId, setClienteId] = useState("");
  const [productoId, setProductoId] = useState("");
  const [cantidad, setCantidad] = useState(1);
  const [items, setItems] = useState([]);

  const [cargando, setCargando] = useState(true);
  const [mensaje, setMensaje] = useState("");

  const formatoDinero = (valor) =>
    new Intl.NumberFormat("es-BO", {
      style: "currency",
      currency: "BOB",
      minimumFractionDigits: 2,
    }).format(valor);

  const cargarProductos = async () => {
    const response = await fetch("/api/productos");
    const data = await response.json();
    setProductos(data);
  };

  const cargarClientes = async () => {
    const response = await fetch("/api/clientes");
    const data = await response.json();
    setClientes(data);
  };

  const cargarPedidos = async () => {
    const response = await fetch("/api/pedidos");
    const data = await response.json();
    setPedidos(data);
  };

  const cargarDatos = async () => {
    try {
      setCargando(true);

      await Promise.all([
        cargarProductos(),
        cargarClientes(),
        cargarPedidos(),
      ]);
    } catch (error) {
      console.error(error);
      setMensaje("No se pudieron cargar los datos.");
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const totalInventario = useMemo(
    () => productos.reduce((total, producto) => total + producto.stock, 0),
    [productos]
  );

  const totalPedido = useMemo(() => {
    return items.reduce((total, item) => {
      return total + item.precio * item.cantidad;
    }, 0);
  }, [items]);

  const navegar = (nuevaVista) => {
    setVista(nuevaVista);
    setMensaje("");
  };

  const agregarProducto = () => {
    const producto = productos.find(
      (p) => p.idProducto === Number(productoId)
    );

    const cantidadNumero = Number(cantidad);

    if (!producto) {
      setMensaje("Seleccione un producto.");
      return;
    }

    if (cantidadNumero <= 0) {
      setMensaje("La cantidad debe ser mayor a cero.");
      return;
    }

    if (cantidadNumero > producto.stock) {
      setMensaje(
        `No existe stock suficiente. Disponible: ${producto.stock}.`
      );
      return;
    }

    const existente = items.find(
      (item) => item.idProducto === producto.idProducto
    );

    if (existente) {
      const nuevaCantidad = existente.cantidad + cantidadNumero;

      if (nuevaCantidad > producto.stock) {
        setMensaje(
          `La cantidad total supera el stock disponible (${producto.stock}).`
        );
        return;
      }

      setItems(
        items.map((item) =>
          item.idProducto === producto.idProducto
            ? { ...item, cantidad: nuevaCantidad }
            : item
        )
      );
    } else {
      setItems([
        ...items,
        {
          idProducto: producto.idProducto,
          nombre: producto.nombre,
          precio: producto.precio,
          cantidad: cantidadNumero,
        },
      ]);
    }

    setProductoId("");
    setCantidad(1);
    setMensaje("");
  };

  const eliminarProducto = (idProducto) => {
    setItems(items.filter((item) => item.idProducto !== idProducto));
  };

  const registrarPedido = async () => {
    if (!clienteId) {
      setMensaje("Debe seleccionar un cliente.");
      return;
    }

    if (items.length === 0) {
      setMensaje("Debe agregar al menos un producto.");
      return;
    }

    try {
      const response = await fetch("/api/pedidos", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          idCliente: Number(clienteId),
          detalles: items.map((item) => ({
            idProducto: item.idProducto,
            cantidad: item.cantidad,
          })),
        }),
      });

      if (!response.ok) {
        const error = await response.json();

        setMensaje(
          error.mensaje ?? "No fue posible registrar el pedido."
        );

        return;
      }

      const pedidoCreado = await response.json();

      setMensaje(
        `Pedido #${pedidoCreado.idPedido} registrado correctamente.`
      );

      setClienteId("");
      setProductoId("");
      setCantidad(1);
      setItems([]);

      await Promise.all([cargarProductos(), cargarPedidos()]);

      setTimeout(() => {
        setVista("pedidos");
        setMensaje("");
      }, 1200);
    } catch (error) {
      console.error(error);
      setMensaje("Ocurrió un error al registrar el pedido.");
    }
  };

  const verDetalle = async (id) => {
    try {
      const response = await fetch(`/api/pedidos/${id}`);

      if (!response.ok) {
        setMensaje("No se pudo consultar el pedido.");
        return;
      }

      const data = await response.json();

      setDetalle(data);
      setVista("detalle");
    } catch (error) {
      console.error(error);
      setMensaje("No se pudo consultar el pedido.");
    }
  };

  const tituloVista = {
    inicio: "Panel principal",
    productos: "Productos",
    clientes: "Clientes",
    pedidos: "Pedidos",
    nuevo: "Registrar pedido",
    detalle: "Detalle del pedido",
  };

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-icon">L</div>

          <div>
            <h1>Lomax</h1>
            <span>Gestión comercial</span>
          </div>
        </div>

        <nav className="menu">
          <button
            className={vista === "inicio" ? "active" : ""}
            onClick={() => navegar("inicio")}
          >
            <span>⌂</span>
            Inicio
          </button>

          <button
            className={vista === "productos" ? "active" : ""}
            onClick={() => navegar("productos")}
          >
            <span>□</span>
            Productos
          </button>

          <button
            className={vista === "clientes" ? "active" : ""}
            onClick={() => navegar("clientes")}
          >
            <span>♙</span>
            Clientes
          </button>

          <button
            className={vista === "pedidos" ? "active" : ""}
            onClick={() => navegar("pedidos")}
          >
            <span>☷</span>
            Pedidos
          </button>

          <button
            className={vista === "nuevo" ? "active" : ""}
            onClick={() => navegar("nuevo")}
          >
            <span>＋</span>
            Nuevo pedido
          </button>
        </nav>

        <div className="sidebar-footer">
          <span>Sistema empresarial</span>
          <strong>Lomax SA</strong>
        </div>
      </aside>

      <main className="main">
        <header className="topbar">
          <div>
            <span className="breadcrumb">
              Lomax SA / {tituloVista[vista]}
            </span>

            <h2>{tituloVista[vista]}</h2>
          </div>

          <div className="system-status">
            <span className="status-dot"></span>
            Sistema operativo
          </div>
        </header>

        {mensaje && (
          <div className="message">
            {mensaje}
          </div>
        )}

        {cargando ? (
          <div className="loading">
            Cargando información...
          </div>
        ) : (
          <>
            {vista === "inicio" && (
              <section>
                <div className="welcome">
                  <div>
                    <span className="eyebrow">
                      SISTEMA DE DISTRIBUCIÓN
                    </span>

                    <h3>Bienvenido a Lomax SA</h3>

                    <p>
                      Administra productos, clientes y pedidos desde un
                      único lugar.
                    </p>
                  </div>

                  <button
                    className="primary"
                    onClick={() => navegar("nuevo")}
                  >
                    + Registrar pedido
                  </button>
                </div>

                <div className="stats">
                  <div className="stat-card">
                    <span className="stat-label">
                      Productos
                    </span>

                    <strong>{productos.length}</strong>

                    <small>
                      Productos registrados
                    </small>
                  </div>

                  <div className="stat-card">
                    <span className="stat-label">
                      Clientes
                    </span>

                    <strong>{clientes.length}</strong>

                    <small>
                      Clientes disponibles
                    </small>
                  </div>

                  <div className="stat-card">
                    <span className="stat-label">
                      Pedidos
                    </span>

                    <strong>{pedidos.length}</strong>

                    <small>
                      Pedidos registrados
                    </small>
                  </div>

                  <div className="stat-card">
                    <span className="stat-label">
                      Inventario
                    </span>

                    <strong>{totalInventario}</strong>

                    <small>
                      Unidades disponibles
                    </small>
                  </div>
                </div>

                <div className="panel">
                  <div className="panel-header">
                    <div>
                      <h3>Últimos pedidos</h3>
                      <p>
                        Actividad reciente registrada en el sistema.
                      </p>
                    </div>

                    <button
                      className="secondary"
                      onClick={() => navegar("pedidos")}
                    >
                      Ver todos
                    </button>
                  </div>

                  <OrdersTable
                    pedidos={pedidos.slice(0, 5)}
                    verDetalle={verDetalle}
                    formatoDinero={formatoDinero}
                  />
                </div>
              </section>
            )}

            {vista === "productos" && (
              <section className="panel">
                <div className="panel-header">
                  <div>
                    <h3>Catálogo de productos</h3>
                    <p>
                      Información disponible y stock actual.
                    </p>
                  </div>

                  <div className="count-badge">
                    {productos.length} productos
                  </div>
                </div>

                <div className="table-wrapper">
                  <table>
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Producto</th>
                        <th>Descripción</th>
                        <th>Precio</th>
                        <th>Stock</th>
                      </tr>
                    </thead>

                    <tbody>
                      {productos.map((producto) => (
                        <tr key={producto.idProducto}>
                          <td className="muted">
                            #{producto.idProducto}
                          </td>

                          <td>
                            <strong>
                              {producto.nombre}
                            </strong>
                          </td>

                          <td>
                            {producto.descripcion}
                          </td>

                          <td>
                            {formatoDinero(producto.precio)}
                          </td>

                          <td>
                            <span
                              className={
                                producto.stock > 20
                                  ? "stock good"
                                  : producto.stock > 5
                                  ? "stock warning"
                                  : "stock low"
                              }
                            >
                              {producto.stock} unidades
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            )}

            {vista === "clientes" && (
              <section className="panel">
                <div className="panel-header">
                  <div>
                    <h3>Clientes</h3>
                    <p>
                      Comercios registrados en Lomax SA.
                    </p>
                  </div>

                  <div className="count-badge">
                    {clientes.length} clientes
                  </div>
                </div>

                <div className="table-wrapper">
                  <table>
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Cliente</th>
                        <th>Dirección</th>
                        <th>Teléfono</th>
                        <th>Correo</th>
                      </tr>
                    </thead>

                    <tbody>
                      {clientes.map((cliente) => (
                        <tr key={cliente.idCliente}>
                          <td className="muted">
                            #{cliente.idCliente}
                          </td>

                          <td>
                            <strong>
                              {cliente.nombre}
                            </strong>
                          </td>

                          <td>{cliente.direccion}</td>
                          <td>{cliente.telefono}</td>
                          <td>{cliente.email}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            )}

            {vista === "pedidos" && (
              <section className="panel">
                <div className="panel-header">
                  <div>
                    <h3>Pedidos registrados</h3>
                    <p>
                      Consulta todos los pedidos realizados.
                    </p>
                  </div>

                  <button
                    className="primary"
                    onClick={() => navegar("nuevo")}
                  >
                    + Nuevo pedido
                  </button>
                </div>

                <OrdersTable
                  pedidos={pedidos}
                  verDetalle={verDetalle}
                  formatoDinero={formatoDinero}
                />
              </section>
            )}

            {vista === "nuevo" && (
              <section className="order-layout">
                <div className="panel">
                  <div className="panel-header">
                    <div>
                      <h3>Nuevo pedido</h3>
                      <p>
                        Selecciona un cliente y agrega productos.
                      </p>
                    </div>
                  </div>

                  <div className="form-grid">
                    <div className="field full">
                      <label>Cliente</label>

                      <select
                        value={clienteId}
                        onChange={(e) =>
                          setClienteId(e.target.value)
                        }
                      >
                        <option value="">
                          Seleccione un cliente
                        </option>

                        {clientes.map((cliente) => (
                          <option
                            key={cliente.idCliente}
                            value={cliente.idCliente}
                          >
                            {cliente.nombre}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="field">
                      <label>Producto</label>

                      <select
                        value={productoId}
                        onChange={(e) =>
                          setProductoId(e.target.value)
                        }
                      >
                        <option value="">
                          Seleccione un producto
                        </option>

                        {productos.map((producto) => (
                          <option
                            key={producto.idProducto}
                            value={producto.idProducto}
                          >
                            {producto.nombre} — Stock{" "}
                            {producto.stock}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="field quantity">
                      <label>Cantidad</label>

                      <input
                        type="number"
                        min="1"
                        value={cantidad}
                        onChange={(e) =>
                          setCantidad(e.target.value)
                        }
                      />
                    </div>
                  </div>

                  <button
                    className="secondary add-product"
                    onClick={agregarProducto}
                  >
                    + Agregar producto
                  </button>

                  <div className="order-items">
                    <h4>Productos del pedido</h4>

                    {items.length === 0 ? (
                      <div className="empty">
                        Todavía no agregaste productos.
                      </div>
                    ) : (
                      <div className="table-wrapper">
                        <table>
                          <thead>
                            <tr>
                              <th>Producto</th>
                              <th>Cantidad</th>
                              <th>Precio</th>
                              <th>Subtotal</th>
                              <th></th>
                            </tr>
                          </thead>

                          <tbody>
                            {items.map((item) => (
                              <tr key={item.idProducto}>
                                <td>
                                  <strong>
                                    {item.nombre}
                                  </strong>
                                </td>

                                <td>{item.cantidad}</td>

                                <td>
                                  {formatoDinero(
                                    item.precio
                                  )}
                                </td>

                                <td>
                                  {formatoDinero(
                                    item.precio *
                                      item.cantidad
                                  )}
                                </td>

                                <td>
                                  <button
                                    className="danger-link"
                                    onClick={() =>
                                      eliminarProducto(
                                        item.idProducto
                                      )
                                    }
                                  >
                                    Quitar
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>

                <aside className="summary-card">
                  <span className="eyebrow">
                    RESUMEN
                  </span>

                  <h3>Resumen del pedido</h3>

                  <div className="summary-line">
                    <span>Productos</span>
                    <strong>{items.length}</strong>
                  </div>

                  <div className="summary-line">
                    <span>Unidades</span>

                    <strong>
                      {items.reduce(
                        (total, item) =>
                          total + item.cantidad,
                        0
                      )}
                    </strong>
                  </div>

                  <div className="summary-total">
                    <span>Total</span>

                    <strong>
                      {formatoDinero(totalPedido)}
                    </strong>
                  </div>

                  <button
                    className="primary full-button"
                    disabled={
                      !clienteId || items.length === 0
                    }
                    onClick={registrarPedido}
                  >
                    Registrar pedido
                  </button>
                </aside>
              </section>
            )}

            {vista === "detalle" && detalle && (
              <section>
                <button
                  className="back-button"
                  onClick={() => navegar("pedidos")}
                >
                  ← Volver a pedidos
                </button>

                <div className="detail-header">
                  <div>
                    <span className="eyebrow">
                      PEDIDO
                    </span>

                    <h3>
                      Pedido #{detalle.idPedido}
                    </h3>

                    <p>
                      Registrado el{" "}
                      {new Date(
                        detalle.fecha
                      ).toLocaleDateString("es-BO")}
                    </p>
                  </div>

                  <span className="status-badge">
                    {detalle.estado}
                  </span>
                </div>

                <div className="detail-cards">
                  <div>
                    <span>Cliente</span>
                    <strong>{detalle.cliente}</strong>
                  </div>

                  <div>
                    <span>Total</span>
                    <strong>
                      {formatoDinero(detalle.total)}
                    </strong>
                  </div>

                  <div>
                    <span>Productos</span>
                    <strong>
                      {detalle.detalles.length}
                    </strong>
                  </div>
                </div>

                <div className="panel">
                  <div className="panel-header">
                    <div>
                      <h3>Detalle del pedido</h3>
                      <p>
                        Productos incluidos en la operación.
                      </p>
                    </div>
                  </div>

                  <div className="table-wrapper">
                    <table>
                      <thead>
                        <tr>
                          <th>Producto</th>
                          <th>Cantidad</th>
                          <th>Precio unitario</th>
                          <th>Subtotal</th>
                        </tr>
                      </thead>

                      <tbody>
                        {detalle.detalles.map(
                          (producto, index) => (
                            <tr key={index}>
                              <td>
                                <strong>
                                  {producto.producto}
                                </strong>
                              </td>

                              <td>
                                {producto.cantidad}
                              </td>

                              <td>
                                {formatoDinero(
                                  producto.precioUnitario
                                )}
                              </td>

                              <td>
                                {formatoDinero(
                                  producto.subtotal
                                )}
                              </td>
                            </tr>
                          )
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </section>
            )}
          </>
        )}
      </main>
    </div>
  );
}

function OrdersTable({
  pedidos,
  verDetalle,
  formatoDinero,
}) {
  return (
    <div className="table-wrapper">
      <table>
        <thead>
          <tr>
            <th>Pedido</th>
            <th>Cliente</th>
            <th>Fecha</th>
            <th>Estado</th>
            <th>Total</th>
            <th></th>
          </tr>
        </thead>

        <tbody>
          {pedidos.map((pedido) => (
            <tr key={pedido.idPedido}>
              <td>
                <strong>#{pedido.idPedido}</strong>
              </td>

              <td>{pedido.cliente}</td>

              <td>
                {new Date(
                  pedido.fecha
                ).toLocaleDateString("es-BO")}
              </td>

              <td>
                <span className="status-badge">
                  {pedido.estado}
                </span>
              </td>

              <td>
                <strong>
                  {formatoDinero(pedido.total)}
                </strong>
              </td>

              <td>
                <button
                  className="view-button"
                  onClick={() =>
                    verDetalle(pedido.idPedido)
                  }
                >
                  Ver detalle →
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default App;