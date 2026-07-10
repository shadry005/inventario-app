# Inventario App
 Integrantes: Sherline Avila, Marco Perez, Cisse Santos, Luis Nuñez.

## Descripción del proyecto

Inventario App es una aplicación de gestión de inventario que permite crear, listar, actualizar y eliminar productos. Cuenta con un backend en Node.js/Express y TypeScript conectado a una base de datos MySQL, y un frontend estático en HTML/CSS/JavaScript.

## Objetivo

El objetivo es proporcionar una solución básica para controlar productos en inventario, mostrar métricas clave y facilitar operaciones CRUD desde una interfaz web ligera.

## Tecnologías utilizadas

- Node.js
- Express
- TypeScript
- MySQL
- mysql2
- CORS
- HTML/CSS/JavaScript

## Estructura de carpetas y archivos

```
inventario-app/
  README.md
  frontend/
    index.html
  backend/
    package.json
    tsconfig.json
    src/
      server.ts
      database.ts
      domain/
        producto.ts
      infra/
        productoRepo.ts
      usecases/
        productoUseCases.ts
```

### Detalle de archivos principales

- `README.md`: documentación del proyecto.
- `backend/package.json`: dependencias y scripts de backend.
- `backend/tsconfig.json`: configuración de TypeScript para el backend.
- `backend/src/server.ts`: servidor Express que expone la API REST para inventario.
- `backend/src/database.ts`: configuración de conexión a MySQL.
- `backend/src/domain/producto.ts`: modelo de datos `Producto` e interfaz `ProductoRepository`.
- `backend/src/infra/productoRepo.ts`: implementación concreta de acceso a datos con MySQL.
- `backend/src/usecases/productoUseCases.ts`: lógica de casos de uso para operaciones de inventario.
- `frontend/index.html`: interfaz web con UI y llamadas a la API.

## Requisitos para ejecutar el proyecto

- Node.js instalado (recomendado 18 o superior).
- MySQL instalado y en ejecución.
- Base de datos MySQL configurada con el nombre `inventario`.
- Permisos para crear tablas y consultar datos en MySQL.

## Instalación paso a paso

1. Clonar o descargar el proyecto en tu máquina.
2. Abrir una terminal en la carpeta `inventario-app/backend`.
3. Ejecutar:

```bash
npm install
```

4. Configurar la conexión a MySQL en `backend/src/database.ts`:

```ts
import mysql from 'mysql2/promise';

export async function createConnection() {
    return mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: 'tu_password',
        database: 'inventario'
    });
}
```

5. Crear la base de datos y la tabla de productos en MySQL con el siguiente script:

```sql
CREATE DATABASE IF NOT EXISTS inventario;
USE inventario;

CREATE TABLE IF NOT EXISTS productos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(255) NOT NULL,
  descripcion TEXT,
  precio DECIMAL(10,2) NOT NULL,
  stock INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Cómo iniciar el backend y el frontend

### Iniciar el backend

Desde la carpeta `inventario-app/backend`:

```bash
npm run dev
```

> Si prefieres compilar TypeScript antes de ejecutar:

```bash
npm run build
npm start
```

El backend quedará disponible en:

```
http://localhost:3000
```

### Iniciar el frontend

Abrir `inventario-app/frontend/index.html` en un navegador.

> Nota: El frontend realiza solicitudes a `http://localhost:3000/api`, por lo que el backend debe estar en ejecución.

Si deseas servir el frontend desde un servidor local estático, puedes usar una extensión de Live Server o cualquier servidor HTTP estático.

## Explicación de cada archivo principal

### `backend/src/server.ts`

Define el servidor Express y las rutas de la API REST:

- `GET /api/productos`: lista todos los productos.
- `GET /api/productos/:id`: obtiene un producto por su ID.
- `POST /api/productos`: crea un nuevo producto.
- `PUT /api/productos/:id`: actualiza un producto existente.
- `DELETE /api/productos/:id`: elimina un producto.

Además, configura middlewares `cors` y `express.json()` para permitir llamadas desde el frontend y manejar JSON.

### `backend/src/database.ts`

Contiene la función `createConnection()` que crea una conexión MySQL utilizando `mysql2/promise`.

Aquí se define la configuración de host, usuario, contraseña y base de datos. Esta capa abstrae la conexión a la base de datos.

### `backend/src/domain/producto.ts`

Define el tipo de dato `Producto` y la interfaz `ProductoRepository`.

- `Producto`: estructura de datos con `id`, `nombre`, `descripcion`, `precio` y `stock`.
- `ProductoRepository`: contrato que describe las operaciones de acceso a datos (listar, obtener, crear, actualizar, eliminar).

### `backend/src/infra/productoRepo.ts`

Implementa `MySQLProductoRepository` usando MySQL.

Esta clase realiza las consultas SQL necesarias para persistir los productos en la tabla `productos`:

- `listar()`
- `obtenerPorId()`
- `crear()`
- `actualizar()`
- `eliminar()`

### `backend/src/usecases/productoUseCases.ts`

Define la clase `ProductoUseCases`, que encapsula la lógica de negocio.

Esta capa consume el repositorio y expone métodos para cada operación del inventario, lo que permite separar la lógica de negocio de la implementación de datos.

## Arquitectura utilizada

El proyecto sigue una arquitectura de capas ligera:

- Capa de presentación: `frontend/index.html`.
- Capa de API/servicio: `backend/src/server.ts`.
- Capa de dominio: `backend/src/domain/producto.ts` y `backend/src/usecases/productoUseCases.ts`.
- Capa de infraestructura: `backend/src/database.ts` y `backend/src/infra/productoRepo.ts`.

Esta separación facilita el mantenimiento, la prueba y la extensión posterior del proyecto.

## Ejemplos de uso de la API

### Listar productos

```bash
curl http://localhost:3000/api/productos
```

### Obtener producto por ID

```bash
curl http://localhost:3000/api/productos/1
```

### Crear un producto

```bash
curl -X POST http://localhost:3000/api/productos \
  -H 'Content-Type: application/json' \
  -d '{"nombre":"Café Premium","descripcion":"Café tostado artesanal","precio":12.50,"stock":30}'
```

### Actualizar un producto

```bash
curl -X PUT http://localhost:3000/api/productos/1 \
  -H 'Content-Type: application/json' \
  -d '{"nombre":"Café Premium","descripcion":"Café orgánico","precio":13.99,"stock":25}'
```

### Eliminar un producto

```bash
curl -X DELETE http://localhost:3000/api/productos/1
```

## Conclusiones

Inventario App es una solución básica de gestión de productos, útil como punto de partida para un sistema más robusto. Combina un backend en Node.js/Express con MySQL y un frontend estático con llamadas a la API.

Para mejorar el proyecto, se puede:

- agregar validación avanzada y manejo de errores en el backend,
- crear un script de migraciones para la base de datos,
- separar el frontend en archivos CSS/JS independientes,
- y organizar la estructura de carpetas para reflejar claramente las capas de dominio, casos de uso e infraestructura.
