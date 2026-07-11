import { Producto, ProductoRepository } from '../domain/producto';
import { createConnection } from '../../database';

export class MySQLProductoRepository implements ProductoRepository {
    async listar(): Promise<Producto[]> {
        const conn = await createConnection();
        const [rows] = await conn.execute('SELECT * FROM productos ORDER BY id DESC');
        await conn.end();
        return rows as Producto[];
    }

    async obtenerPorId(id: number): Promise<Producto | null> {
        const conn = await createConnection();
        const [rows] = await conn.execute('SELECT * FROM productos WHERE id = ?', [id]);
        await conn.end();
        return (rows as Producto[])[0] || null;
    }

    async crear(producto: Producto): Promise<Producto> {
        const conn = await createConnection();
        const [result] = await conn.execute(
            'INSERT INTO productos (nombre, descripcion, precio, stock) VALUES (?, ?, ?, ?)',
            [producto.nombre, producto.descripcion, producto.precio, producto.stock]
        );
        await conn.end();
        return { ...producto, id: (result as any).insertId };
    }

    async actualizar(id: number, producto: Producto): Promise<void> {
        const conn = await createConnection();
        await conn.execute(
            'UPDATE productos SET nombre = ?, descripcion = ?, precio = ?, stock = ? WHERE id = ?',
            [producto.nombre, producto.descripcion, producto.precio, producto.stock, id]
        );
        await conn.end();
    }

    async eliminar(id: number): Promise<void> {
        const conn = await createConnection();
        await conn.execute('DELETE FROM productos WHERE id = ?', [id]);
        await conn.end();
    }
}