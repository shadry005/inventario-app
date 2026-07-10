import express from 'express';
import cors from 'cors';
import { ProductoUseCases } from './src/usecases/productoUseCases';
import { MySQLProductoRepository } from './productoRepo';
import { createConnection, initializeDatabase, databaseConfig } from './database';

const app = express();
const PORT = process.env.PORT ? Number(process.env.PORT) : 3000;

app.use(cors());
app.use(express.json());

const repo = new MySQLProductoRepository();
const useCases = new ProductoUseCases(repo);

async function startServer() {
    await initializeDatabase();

    app.get('/api/productos', async (_req, res) => {
        try {
            const productos = await useCases.listar();
            res.json(productos);
        } catch (error) {
            console.error('Error al listar:', error);
            res.status(500).json({ error: 'Error al listar productos' });
        }
    });

    app.get('/api/sucursales', async (_req, res) => {
        try {
            const conn = await createConnection();
            const [rows] = await conn.query('SELECT id, nombre, direccion FROM sucursales ORDER BY id');
            await conn.end();
            res.json(rows);
        } catch (error) {
            console.error('Error al listar sucursales:', error);
            res.status(500).json({ error: 'Error al listar sucursales' });
        }
    });

    app.get('/api/inventario', async (req, res) => {
        try {
            const branch = String(req.query.branch || 'all');
            const conn = await createConnection();
            let sql = `SELECT inv.id_producto, prod.nombre, prod.precio, inv.stock, inv.id_sucursal AS sucursal_id
                FROM inventario_sucursal inv
                JOIN productos prod ON inv.id_producto = prod.id`;
            const params: Array<number | string> = [];

            if (branch !== 'all') {
                sql += ' WHERE inv.id_sucursal = ?';
                params.push(branch);
            }

            const [rows] = await conn.query(sql, params);
            await conn.end();
            res.json(rows);
        } catch (error) {
            console.error('Error al obtener inventario:', error);
            res.status(500).json({ error: 'Error al obtener inventario' });
        }
    });

    app.post('/api/inventario_sucursal', async (req, res) => {
        try {
            const { id_producto, id_sucursal, stock } = req.body;

            if (!id_producto || !id_sucursal || stock === undefined || Number(stock) < 0) {
                return res.status(400).json({ error: 'id_producto, id_sucursal y stock son requeridos' });
            }

            const conn = await createConnection();
            await conn.query(
                `INSERT INTO inventario_sucursal (id_producto, id_sucursal, stock)
                 VALUES (?, ?, ?)
                 ON DUPLICATE KEY UPDATE stock = VALUES(stock)`,
                [id_producto, id_sucursal, stock]
            );

            await conn.query(
                `INSERT INTO inventario_general (id_producto, stock_total)
                 SELECT id_producto, SUM(stock)
                 FROM inventario_sucursal
                 WHERE id_producto = ?
                 GROUP BY id_producto
                 ON DUPLICATE KEY UPDATE stock_total = VALUES(stock_total)`,
                [id_producto]
            );

            await conn.end();
            res.status(201).json({ id_producto, id_sucursal, stock });
        } catch (error) {
            console.error('Error al actualizar inventario_sucursal:', error);
            res.status(500).json({ error: 'Error al actualizar inventario por sucursal' });
        }
    });

    app.get('/api/productos/:id', async (req, res) => {
        try {
            const producto = await useCases.obtenerPorId(Number(req.params.id));
            if (producto) {
                res.json(producto);
            } else {
                res.status(404).json({ error: 'Producto no encontrado' });
            }
        } catch (error) {
            console.error('Error al obtener:', error);
            res.status(500).json({ error: 'Error al obtener producto' });
        }
    });

    app.post('/api/productos', async (req, res) => {
        try {
            const { nombre, descripcion, precio, stock } = req.body;

            if (!nombre || precio === undefined || stock === undefined) {
                return res.status(400).json({
                    error: 'Nombre, precio y stock son requeridos'
                });
            }

            const nuevoProducto = await useCases.crear({
                nombre,
                descripcion: descripcion || '',
                precio: Number(precio),
                stock: Number(stock)
            });

            res.status(201).json(nuevoProducto);
        } catch (error) {
            console.error('Error al crear:', error);
            res.status(500).json({ error: 'Error al crear producto' });
        }
    });

    app.put('/api/productos/:id', async (req, res) => {
        try {
            const id = Number(req.params.id);
            const { nombre, descripcion, precio, stock } = req.body;
            const existe = await useCases.obtenerPorId(id);

            if (!existe) {
                return res.status(404).json({ error: 'Producto no encontrado' });
            }

            await useCases.actualizar(id, {
                nombre: nombre || existe.nombre,
                descripcion: descripcion || existe.descripcion,
                precio: precio !== undefined ? Number(precio) : existe.precio,
                stock: stock !== undefined ? Number(stock) : existe.stock
            });

            res.json({ message: '✅ Producto actualizado exitosamente' });
        } catch (error) {
            console.error('Error al actualizar:', error);
            res.status(500).json({ error: 'Error al actualizar producto' });
        }
    });

    app.delete('/api/productos/:id', async (req, res) => {
        try {
            const id = Number(req.params.id);
            const existe = await useCases.obtenerPorId(id);

            if (!existe) {
                return res.status(404).json({ error: 'Producto no encontrado' });
            }

            await useCases.eliminar(id);
            res.json({ message: '🗑️ Producto eliminado exitosamente' });
        } catch (error) {
            console.error('Error al eliminar:', error);
            res.status(500).json({ error: 'Error al eliminar producto' });
        }
    });

    app.get('/', (_req, res) => {
        res.json({
            mensaje: '🚀 API de Inventario funcionando',
            endpoints: {
                listar: 'GET /api/productos',
                obtener: 'GET /api/productos/:id',
                crear: 'POST /api/productos',
                actualizar: 'PUT /api/productos/:id',
                eliminar: 'DELETE /api/productos/:id'
            }
        });
    });

    app.listen(PORT, () => {
        console.log('═══════════════════════════════════════');
        console.log('🚀 Servidor de Inventario iniciado');
        console.log(`📡 URL: http://localhost:${PORT}`);
        console.log(`📋 API: http://localhost:${PORT}/api/productos`);
        console.log(`🗄️  MySQL: ${databaseConfig.user}@${databaseConfig.host}:${databaseConfig.port}/${databaseConfig.database}`);
        console.log('═══════════════════════════════════════');
    });
}

startServer().catch((error) => {
    console.error('No se pudo iniciar el servidor:', error, {
        mysql: databaseConfig
    });
    process.exit(1);
});