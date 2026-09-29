# Lomax SA

Sistema web para la gestión de productos, clientes y pedidos desarrollado para la asignatura Tecnologías Emergentes I.

## Tecnologías

- React
- ASP.NET Core Web API
- Entity Framework Core
- PostgreSQL
- Npgsql
- Nginx
- Docker
- Docker Compose

## Arquitectura

La solución está compuesta por:

- `lomax-proxy`: Reverse Proxy Nginx
- `lomax-frontend`: Frontend React + Nginx
- `lomax-backend`: API ASP.NET Core
- `lomax-db`: PostgreSQL

## Requisitos

- Docker Desktop
- Docker Compose

## Configuración

Crear el archivo `.env` a partir del ejemplo:

```bash
cp .env.example .env
```

En Windows PowerShell:

```powershell
Copy-Item .env.example .env
```

Configurar las variables:

```env
POSTGRES_DB=lomax_db
POSTGRES_USER=lomax_user
POSTGRES_PASSWORD=CAMBIAR_PASSWORD
```

## Ejecutar aplicación

Desde la raíz:

```bash
docker compose up -d --build
```

Verificar los contenedores:

```bash
docker compose ps
```

Abrir:

```text
http://localhost:8080
```

## Funcionalidades

- Consultar productos
- Consultar clientes
- Registrar pedidos
- Consultar pedidos
- Visualizar detalle de pedidos

## Redes Docker

- `web_network`
- `database_network`

## Persistencia

PostgreSQL utiliza el volumen:

```text
postgres_data
```

## Detener aplicación

```bash
docker compose stop
```

No utilizar:

```bash
docker compose down -v
```

si se desean conservar los datos.

## Estado del proyecto

Producto 3 - Solución Docker funcional.

Próximas etapas:

- Kubernetes
- AWS
