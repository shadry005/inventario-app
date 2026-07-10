const mysql = require('mysql2/promise');

(async ()=>{
  try {
    const conn = await mysql.createConnection({
      host: process.env.DB_HOST || '127.0.0.1',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'inventario'
    });
    const [rows] = await conn.query('SELECT * FROM productos ORDER BY id DESC');
    console.log(JSON.stringify(rows, null, 2));
    await conn.end();
  } catch (err) {
    console.error('Error:', err.message || err);
    process.exit(1);
  }
})();
