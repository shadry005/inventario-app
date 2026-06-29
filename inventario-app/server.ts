import express from 'express';
import cors from 'cors';
import { ProductoUseCases } from './usecases/productoUseCases';
import { MySQLProductoRepository } from './infra/productoRepo';

const app = express();
const PORT = 3000;

// Middlewares
app.use(cors());
app.use(express.json());

// Inicializar dependencias
const repo = new MySQLProductoRepository();
const useCases = new ProductoUseCases(repo);

// ============ RUTAS DE LA API ============

// GET - Listar todos los productos
app.get('/api/productos', async (req, res) => {
    try {
        const productos = await useCases.listar();
        res.json(productos);
    } catch (error) {
        console.error('Error al listar:', error);
        res.status(500).json({ error: 'Error al listar productos' });
    }
});

// GET - Obtener un producto por ID
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

// POST - Crear nuevo producto
app.post('/api/productos', async (req, res) => {
    try {
        const { nombre, descripcion, precio, stock } = req.body;
        
        // Validación básica
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

// PUT - Actualizar producto existente
app.put('/api/productos/:id', async (req, res) => {
    try {
        const id = Number(req.params.id);
        const { nombre, descripcion, precio, stock } = req.body;
        
        // Verificar que existe
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

// DELETE - Eliminar producto
app.delete('/api/productos/:id', async (req, res) => {
    try {
        const id = Number(req.params.id);
        
        // Verificar que existe
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

// Ruta de prueba
app.get('/', (req, res) => {
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

// Iniciar servidor
app.listen(PORT, () => {
    console.log('═══════════════════════════════════════');
    console.log('🚀 Servidor de Inventario iniciado');
    console.log(`📡 URL: http://localhost:${PORT}`);
    console.log(`📋 API: http://localhost:${PORT}/api/productos`);
    console.log('═══════════════════════════════════════');
});