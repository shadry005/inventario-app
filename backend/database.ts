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
            )
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