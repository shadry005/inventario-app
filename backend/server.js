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

  await bootstrap.query('CREATE DATABASE IF NOT EXISTS inventario');
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
