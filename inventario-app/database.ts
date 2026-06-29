import mysql from 'mysql2/promise';

export async function createConnection() {
    return mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: '',
        database: 'inventario'
    });
}