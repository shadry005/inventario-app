-- Archivo de seed SQL para importar en HeidiSQL o línea de comandos
-- Crea la base, tabla, índices, usuarios y datos de ejemplo

-- 1) Crear base de datos y usarla
CREATE DATABASE IF NOT EXISTS inventario CHARACTER SET utf8mb4 COLLATE utf8mb4_spanish_ci;
USE inventario;

-- 2) Crear tabla productos
CREATE TABLE IF NOT EXISTS productos (
  id INT NOT NULL AUTO_INCREMENT,
  nombre VARCHAR(255) NOT NULL,
  descripcion TEXT,
  precio DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci;

-- 3) Índices útiles
CREATE INDEX idx_productos_nombre ON productos(nombre);
CREATE INDEX idx_productos_precio ON productos(precio);

-- 3.b) Tabla sucursales
CREATE TABLE IF NOT EXISTS sucursales (
  id INT NOT NULL AUTO_INCREMENT,
  nombre VARCHAR(100) NOT NULL,
  direccion VARCHAR(255) DEFAULT NULL,
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci;

-- 3.c) Inventario general (suma de sucursales)
CREATE TABLE IF NOT EXISTS inventario_general (
  id INT NOT NULL AUTO_INCREMENT,
  id_producto INT NOT NULL,
  stock_total INT NOT NULL DEFAULT 0,
  PRIMARY KEY (id),
  CONSTRAINT fk_invgen_producto FOREIGN KEY (id_producto) REFERENCES productos(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci;

-- 3.d) Inventario por sucursal
CREATE TABLE IF NOT EXISTS inventario_sucursal (
  id INT NOT NULL AUTO_INCREMENT,
  id_producto INT NOT NULL,
  id_sucursal INT NOT NULL,
  stock INT NOT NULL DEFAULT 0,
  PRIMARY KEY (id),
  CONSTRAINT fk_invsuc_producto FOREIGN KEY (id_producto) REFERENCES productos(id) ON DELETE CASCADE,
  CONSTRAINT fk_invsuc_sucursal FOREIGN KEY (id_sucursal) REFERENCES sucursales(id) ON DELETE CASCADE,
  UNIQUE KEY uk_product_sucursal (id_producto, id_sucursal)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci;

-- 3.e) Ordenes y detalle
CREATE TABLE IF NOT EXISTS ordenes (
  id INT NOT NULL AUTO_INCREMENT,
  id_sucursal INT NOT NULL,
  fecha DATETIME DEFAULT CURRENT_TIMESTAMP,
  estado ENUM('Pendiente','Preparando','Entregada','Cancelada') DEFAULT 'Pendiente',
  PRIMARY KEY (id),
  CONSTRAINT fk_orden_sucursal FOREIGN KEY (id_sucursal) REFERENCES sucursales(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci;

CREATE TABLE IF NOT EXISTS detalle_orden (
  id INT NOT NULL AUTO_INCREMENT,
  id_orden INT NOT NULL,
  id_producto INT NOT NULL,
  cantidad INT NOT NULL DEFAULT 1,
  precio DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  PRIMARY KEY (id),
  CONSTRAINT fk_detorden_orden FOREIGN KEY (id_orden) REFERENCES ordenes(id) ON DELETE CASCADE,
  CONSTRAINT fk_detorden_producto FOREIGN KEY (id_producto) REFERENCES productos(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci;

-- 4) (Opcional) Vaciar tabla antes de insertar
-- TRUNCATE TABLE productos;

-- 5) Insertar/Actualizar datos de ejemplo (backend/data/productos.json)
-- Insert productos de ejemplo
INSERT INTO productos (id, nombre, descripcion, precio) VALUES
(1, 'Café Premium', 'Café molido de alta calidad', 13.00),
(2, 'Té Verde', 'Té natural con antioxidantes', 8.90),
(3, 'Miel Orgánica', 'Miel pura de abeja', 15.75),
(4, 'Cappuccino', 'Espresso con leche espumosa y cacao espolvoreado', 3.20),
(5, 'Flat White', 'Doble espresso con microespuma de leche', 3.50),
(6, 'Cold Brew', 'Café infusionado en frío', 3.00),
(7, 'Affogato', 'Bola de helado bañada con un espresso caliente', 4.50),
(8, 'Croissant de Mantequilla', 'Hoja mantecoso perfecto para acompañar el café', 2.20),
(9, 'Caramel Macchiato Nitro', 'Espresso frío infundido con nitrógeno, vainilla sedosa y caramelo', 5.25)
ON DUPLICATE KEY UPDATE
  nombre = VALUES(nombre),
  descripcion = VALUES(descripcion),
  precio = VALUES(precio);

-- Insertar sucursales
INSERT INTO sucursales (id, nombre, direccion) VALUES
(1, 'Sucursal Centro', 'Centro Histórico'),
(2, 'Sucursal Norte', 'Plaza Norte'),
(3, 'Sucursal Financiero', 'Distrito Financiero')
ON DUPLICATE KEY UPDATE nombre = VALUES(nombre), direccion = VALUES(direccion);

-- Insertar inventario por sucursal (ejemplo)
INSERT INTO inventario_sucursal (id_producto, id_sucursal, stock) VALUES
(1, 1, 30),
(1, 2, 25),
(1, 3, 35),
(2, 1, 14),
(2, 2, 10),
(2, 3, 5),
(3, 1, 7),
(3, 2, 3),
(3, 3, 2),
(4, 1, 40),
(5, 1, 35),
(6, 2, 25),
(7, 2, 10),
(8, 3, 50),
(9, 1, 30)
ON DUPLICATE KEY UPDATE stock = VALUES(stock);

-- Calcular e insertar inventario_general
INSERT INTO inventario_general (id_producto, stock_total)
SELECT id_producto, SUM(stock) FROM inventario_sucursal GROUP BY id_producto
ON DUPLICATE KEY UPDATE stock_total = VALUES(stock_total);

-- 6) Consultas útiles
-- Listar todos
SELECT * FROM productos ORDER BY id DESC;

-- Obtener por id (ejemplo id=2)
SELECT * FROM productos WHERE id = 2;

-- Buscar por nombre
SELECT * FROM productos WHERE nombre LIKE '%Café%';

-- Actualizar precio (ejemplo)
UPDATE productos SET precio = 13.00 WHERE id = 1;
-- Si necesitas ajustar inventario por sucursal usa la tabla inventario_sucursal:
-- UPDATE inventario_sucursal SET stock = 32 WHERE id_producto = 1 AND id_sucursal = 2;

-- Eliminar ejemplo
-- DELETE FROM productos WHERE id = 3;

-- Controles/diagnóstico
SHOW TABLES;
DESCRIBE productos;
SELECT COUNT(*) AS total FROM productos;

-- 7) Crear usuario de base de datos y otorgar permisos (ajusta host/contraseña)
-- Ajusta 'tu_password' antes de ejecutar
CREATE USER IF NOT EXISTS 'inventario_user'@'localhost' IDENTIFIED BY 'tu_password';
GRANT SELECT, INSERT, UPDATE, DELETE, CREATE, DROP, INDEX, ALTER ON inventario.* TO 'inventario_user'@'localhost';
FLUSH PRIVILEGES;

-- Fin de archivo
