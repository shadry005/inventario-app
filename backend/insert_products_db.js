const mysql = require('mysql2/promise');

(async () => {
  const products = [
    { nombre: 'Cappuccino', descripcion: 'Espresso con leche espumosa y cacao espolvoreado', precio: 3.20 },
    { nombre: 'Flat White', descripcion: 'Doble espresso con microespuma de leche', precio: 3.50 },
    { nombre: 'Cold Brew', descripcion: 'Café infusionado en frío, suave y refrescante', precio: 3.00 },
    { nombre: 'Affogato', descripcion: 'Bola de helado bañada con un espresso caliente', precio: 4.50 },
    { nombre: 'Croissant de Mantequilla', descripcion: 'Hojaldre mantecoso, perfecto para acompañar el café', precio: 2.20 }
  ];

  try {
    const conn = await mysql.createConnection({
      host: process.env.DB_HOST || '127.0.0.1',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'inventario'
    });

    for (const p of products) {
      try {
        const [res] = await conn.execute('INSERT INTO productos (nombre, descripcion, precio) VALUES (?, ?, ?)', [p.nombre, p.descripcion, p.precio]);
        console.log('Inserted:', p.nombre, 'id=', res.insertId);
      } catch (err) {
        console.error('Error inserting', p.nombre, err.message || err);
      }
    }

    const [rows] = await conn.query('SELECT * FROM productos ORDER BY id DESC');
    console.log('--- Current products ---');
    console.log(JSON.stringify(rows, null, 2));
    await conn.end();
  } catch (err) {
    console.error('Connection error:', err.message || err);
    process.exit(1);
  }
})();
