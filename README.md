# Inventario App

## Integrantes

- Sherline Ávila
- Marco Pérez
- Cisse Santos
- Luis Núñez

## Descripción

Inventario App es un sistema web de gestión de inventario diseñado para administrar productos de tres sucursales de manera organizada y segura. El proyecto contempla la autenticación de usuarios, la diferenciación de roles y la gestión de clientes e inventario mediante una arquitectura web sencilla basada en Node.js, Express, TypeScript, HTML, CSS, JavaScript y MySQL.

El sistema permite controlar la información de productos, visualizar el inventario por sucursal y mantener una estructura clara para futuras ampliaciones del proyecto.

## Objetivos

- Controlar el inventario de forma organizada.
- Administrar clientes de manera eficiente.
- Controlar el acceso al sistema mediante login.
- Visualizar el inventario por sucursal.
- Mostrar totales del inventario de forma automática.

## Tecnologías

- Node.js
- Express
- TypeScript
- HTML
- CSS
- JavaScript
- MySQL
- HeidiSQL

## Arquitectura

### Frontend

- Login
- Catálogo de clientes
- Inventario
- Dashboard

### Backend

- Rutas
- Controladores
- Modelos
- Base de datos

### Base de datos

- Usuarios
- Clientes
- Inventario

## Plan de Desarrollo

El proyecto se desarrolló mediante 16 commits organizados en cuatro bloques, con el propósito de construir la aplicación de forma progresiva y ordenada.

### Bloque 1: Base de Datos y Conexión

- Commit 1: Crear la base de datos y tabla Usuarios.
- Commit 2: Crear tablas Clientes e Inventario, incluyendo el campo Sucursal.
- Commit 3: Configurar la conexión del proyecto con MySQL.
- Commit 4: Crear el CRUD base para Inventario.

### Bloque 2: Login y Seguridad

- Commit 5: Diseñar la interfaz Login.
- Commit 6: Validar usuario y contraseña.
- Commit 7: Implementar sesiones o JWT.
- Commit 8: Redireccionar según el rol del usuario.
  - Cliente → Catálogo
  - Trabajador → Inventario

### Bloque 3: Clientes

- Commit 9: Crear la interfaz del catálogo de clientes.
- Commit 10: Conectar la vista con MySQL.
- Commit 11: Agregar formulario para registrar y editar clientes.
- Commit 12: Aplicar validaciones tanto del cliente como del servidor.

### Bloque 4: Inventario

- Commit 13: Crear la interfaz del inventario con filtros por sucursal.
- Commit 14: Filtrar productos por sucursal.
- Commit 15: Calcular el total del inventario.
- Commit 16: Aplicar estilos finales, limpiar el código y actualizar el README.

## Distribución del Trabajo

### Integrante 1

Base de datos y conexión.

### Integrante 2

Login y seguridad.

### Integrante 3

Clientes.

### Integrante 4

Inventario.

## Flujo del Sistema

Login

↓

Validación

↓

Determinar Rol

↓

Cliente → Catálogo

Trabajador → Inventario

↓

Consulta a MySQL

↓

Mostrar información

## Base de Datos

### Tabla Usuarios

| Campo | Descripción |
|---|---|
| id | Identificador único del usuario |
| usuario | Nombre de usuario para iniciar sesión |
| contraseña | Contraseña del usuario |
| rol | Rol asignado: Cliente o Trabajador |

### Tabla Clientes

| Campo | Descripción |
|---|---|
| id | Identificador único del cliente |
| nombre | Nombre completo del cliente |
| teléfono | Número de contacto |
| correo | Correo electrónico del cliente |

### Tabla Inventario

| Campo | Descripción |
|---|---|
| id | Identificador único del producto |
| producto | Nombre del producto |
| cantidad | Cantidad disponible en inventario |
| precio | Precio del producto |
| sucursal | Sucursal donde se encuentra el producto |

## Notas Finales

Este proyecto representa una propuesta funcional de sistema de inventario orientada al aprendizaje y al desarrollo de habilidades en diseño de aplicaciones web, manejo de bases de datos y organización de trabajo en equipo. La documentación presentada busca reflejar de forma clara la estructura del sistema, sus objetivos, la arquitectura propuesta y la planificación de desarrollo establecida para el proyecto.
