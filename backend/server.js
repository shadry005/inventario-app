const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

async function createConnection() {
  return mysql.createConnection({
    host: process.env.DB_HOST || '127.0.0.1',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'inventario'
  });
}

async function initializeDatabase() {
  const bootstrap = await mysql.createConnection({
    host: process.env.DB_HOST || '127.0.0.1',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || ''
  });

  await bootstrap.query('CREATE DATABASE IF NOT EXISTS inventario CHARACTER SET utf8mb4 COLLATE utf8mb4_spanish_ci');
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
}

app.get('/api/productos', async (_req, res) => {
  try {
    const conn = await createConnection();
    const [rows] = await conn.execute('SELECT * FROM productos ORDER BY id DESC');
    await conn.end();
    res.json(rows);
  } catch (error) {
    console.error(error);
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
    console.error(error);
    res.status(500).json({ error: 'Error al listar sucursales' });
  }
});

app.get('/api/inventario', async (req, res) => {
  try {
    const branch = String(req.query.branch || 'all');
    const conn = await createConnection();
    let sql = `SELECT
      prod.id AS id_producto,
      prod.nombre,
      prod.precio,
      COALESCE(inv.stock, 0) AS stock,
      inv.id_sucursal AS sucursal_id
      FROM productos prod
      LEFT JOIN inventario_sucursal inv ON prod.id = inv.id_producto`;
    const params = [];

    if (branch !== 'all') {
      sql += ' WHERE inv.id_sucursal = ?';
      params.push(branch);
    }

    const [rows] = await conn.query(sql, params);
    await conn.end();
    res.json(rows);
  } catch (error) {
    console.error(error);
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
    console.error(error);
    res.status(500).json({ error: 'Error al actualizar inventario por sucursal' });
  }
});

app.post('/api/productos', async (req, res) => {
  try {
    const { nombre, descripcion, precio, stock } = req.body;
    const conn = await createConnection();
    const [result] = await conn.execute(
      'INSERT INTO productos (nombre, descripcion, precio, stock) VALUES (?, ?, ?, ?)',
      [nombre, descripcion || '', precio, stock]
    );
    await conn.end();
    res.status(201).json({ id: result.insertId, nombre, descripcion: descripcion || '', precio, stock });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al crear producto' });
  }
});

app.put('/api/productos/:id', async (req, res) => {
  try {
    const { nombre, descripcion, precio, stock } = req.body;
    const conn = await createConnection();
    await conn.execute(
      'UPDATE productos SET nombre = ?, descripcion = ?, precio = ?, stock = ? WHERE id = ?',
      [nombre, descripcion || '', precio, stock, req.params.id]
    );
    await conn.end();
    res.json({ ok: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al actualizar producto' });
  }
});

app.delete('/api/productos/:id', async (req, res) => {
  try {
    const conn = await createConnection();
    await conn.execute('DELETE FROM productos WHERE id = ?', [req.params.id]);
    await conn.end();
    res.json({ ok: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al eliminar producto' });
  }
});

app.get('/', (_req, res) => {
  res.json({ ok: true });
});

initializeDatabase().then(() => {
  app.listen(PORT, () => {
    console.log(`Backend escuchando en http://localhost:${PORT}`);
  });
}).catch((error) => {
  console.error('Error al iniciar backend:', error);
  process.exit(1);
});
