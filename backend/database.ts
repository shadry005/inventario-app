import fs from 'fs';
import path from 'path';
import mysql from 'mysql2/promise';

function loadEnvFile() {
    const envPath = path.join(process.cwd(), '.env');
    if (!fs.existsSync(envPath)) return;

    const content = fs.readFileSync(envPath, 'utf8');
    for (const line of content.split(/\r?\n/)) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#')) continue;

        const [key, ...rest] = trimmed.split('=');
        if (!key) continue;

        const value = rest.join('=').trim();
        if (process.env[key] === undefined) {
            process.env[key] = value;
        }
    }
}

loadEnvFile();

const DB_HOST = process.env.DB_HOST?.trim() || '127.0.0.1';
const DB_PORT = Number(process.env.DB_PORT || 3306);
const DB_USER = process.env.DB_USER?.trim() || 'root';
const DB_PASSWORD = process.env.DB_PASSWORD ?? '';
const DB_NAME = process.env.DB_NAME?.trim() || 'inventario';
const DB_CONNECT_TIMEOUT_MS = Number(process.env.DB_CONNECT_TIMEOUT_MS || 10000);

export interface DatabaseConfig {
    host: string;
    port: number;
    user: string;
    password: string;
    database: string;
}

export const databaseConfig: DatabaseConfig = {
    host: DB_HOST,
    port: DB_PORT,
    user: DB_USER,
    password: DB_PASSWORD,
    database: DB_NAME
};

export async function createConnection() {
    return mysql.createConnection({
        host: DB_HOST,
        port: DB_PORT,
        user: DB_USER,
        password: DB_PASSWORD,
        database: DB_NAME,
        connectTimeout: DB_CONNECT_TIMEOUT_MS,
        multipleStatements: false,
        charset: 'utf8mb4'
    });
}

export async function initializeDatabase() {
    try {
        const bootstrap = await mysql.createConnection({
            host: DB_HOST,
            port: DB_PORT,
            user: DB_USER,
            password: DB_PASSWORD,
            connectTimeout: DB_CONNECT_TIMEOUT_MS
        });

        await bootstrap.query(`CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\``);
        await bootstrap.end();

        const conn = await createConnection();

        await conn.query(`
            CREATE TABLE IF NOT EXISTS productos (
                id INT AUTO_INCREMENT PRIMARY KEY,
                nombre VARCHAR(150) NOT NULL,
                descripcion TEXT,
                precio DECIMAL(10, 2) NOT NULL DEFAULT 0,
                stock INT NOT NULL DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
        `);

        await conn.query(`
            CREATE TABLE IF NOT EXISTS sucursales (
                id INT AUTO_INCREMENT PRIMARY KEY,
                nombre VARCHAR(100) NOT NULL,
                direccion VARCHAR(255) DEFAULT NULL
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
        `);

        await conn.query(`
            CREATE TABLE IF NOT EXISTS users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                username VARCHAR(100) NOT NULL UNIQUE,
                password_hash VARCHAR(255) NOT NULL,
                full_name VARCHAR(150) NOT NULL,
                email VARCHAR(150) NOT NULL UNIQUE,
                role VARCHAR(50) NOT NULL DEFAULT 'cliente',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
        `);

        await conn.query(`
            CREATE TABLE IF NOT EXISTS pedidos (
                id INT AUTO_INCREMENT PRIMARY KEY,
                ticket VARCHAR(50) NOT NULL UNIQUE,
                metodo_pago VARCHAR(50) NOT NULL,
                sucursal VARCHAR(100) NOT NULL,
                tiempo_estimado INT NOT NULL DEFAULT 0,
                total DECIMAL(10, 2) NOT NULL DEFAULT 0,
                cliente VARCHAR(150) NOT NULL DEFAULT 'anonimo',
                estado VARCHAR(50) NOT NULL DEFAULT 'pendiente',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
        `);

        await conn.query(`
            CREATE TABLE IF NOT EXISTS detalle_pedidos (
                id INT AUTO_INCREMENT PRIMARY KEY,
                pedido_id INT NOT NULL,
                producto_id INT DEFAULT NULL,
                nombre VARCHAR(150) NOT NULL,
                cantidad INT NOT NULL DEFAULT 1,
                precio_unitario DECIMAL(10, 2) NOT NULL DEFAULT 0,
                subtotal DECIMAL(10, 2) NOT NULL DEFAULT 0,
                FOREIGN KEY (pedido_id) REFERENCES pedidos(id) ON DELETE CASCADE
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
        `);

        await conn.query(`
            CREATE TABLE IF NOT EXISTS inventario_general (
                id INT AUTO_INCREMENT PRIMARY KEY,
                id_producto INT NOT NULL,
                stock_total INT NOT NULL DEFAULT 0,
                UNIQUE KEY uk_invgen_producto (id_producto),
                CONSTRAINT fk_invgen_producto FOREIGN KEY (id_producto) REFERENCES productos(id) ON DELETE CASCADE
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
        `);

        await conn.query(`
            CREATE TABLE IF NOT EXISTS inventario_sucursal (
                id INT AUTO_INCREMENT PRIMARY KEY,
                id_producto INT NOT NULL,
                id_sucursal INT NOT NULL,
                stock INT NOT NULL DEFAULT 0,
                UNIQUE KEY uk_product_sucursal (id_producto, id_sucursal),
                CONSTRAINT fk_invsuc_producto FOREIGN KEY (id_producto) REFERENCES productos(id) ON DELETE CASCADE,
                CONSTRAINT fk_invsuc_sucursal FOREIGN KEY (id_sucursal) REFERENCES sucursales(id) ON DELETE CASCADE
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
        `);

        await conn.query(`
            INSERT INTO sucursales (id, nombre, direccion) VALUES
                (1, 'Sucursal Centro', 'Centro Histórico'),
                (2, 'Sucursal Norte', 'Plaza Norte'),
                (3, 'Sucursal Financiero', 'Distrito Financiero')
            ON DUPLICATE KEY UPDATE nombre = VALUES(nombre), direccion = VALUES(direccion)
        `);

        await conn.query(`
            INSERT INTO productos (id, nombre, descripcion, precio, stock) VALUES
                (1, 'Café Premium', 'Café molido de alta calidad', 13.00, 30),
                (2, 'Té Verde', 'Té natural con antioxidantes', 8.90, 14),
                (3, 'Miel Orgánica', 'Miel pura de abeja', 15.75, 7),
                (4, 'Cappuccino', 'Espresso con leche espumosa y cacao espolvoreado', 3.20, 40),
                (5, 'Flat White', 'Doble espresso con microespuma de leche', 3.50, 35),
                (6, 'Cold Brew', 'Café infusionado en frío', 3.00, 25),
                (7, 'Affogato', 'Bola de helado bañada con un espresso caliente', 4.50, 10),
                (8, 'Croissant de Mantequilla', 'Hoja mantecoso perfecto para acompañar el café', 2.20, 50),
                (9, 'Caramel Macchiato Nitro', 'Espresso frío infundido con nitrógeno, vainilla sedosa y caramelo', 5.25, 30)
            ON DUPLICATE KEY UPDATE nombre = VALUES(nombre), descripcion = VALUES(descripcion), precio = VALUES(precio), stock = VALUES(stock)
        `);

        await conn.query(`
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
            ON DUPLICATE KEY UPDATE stock = VALUES(stock)
        `);

        await conn.query(`
            INSERT INTO inventario_general (id_producto, stock_total)
            SELECT id_producto, SUM(stock)
            FROM inventario_sucursal
            GROUP BY id_producto
            ON DUPLICATE KEY UPDATE stock_total = VALUES(stock_total)
        `);

        await conn.end();
    } catch (error: any) {
        console.error('No se pudo conectar a MySQL:', error?.message || error, {
            host: DB_HOST,
            port: DB_PORT,
            user: DB_USER,
            database: DB_NAME
        });
        throw error;
    }
}