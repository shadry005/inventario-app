const mysql = require('mysql2/promise');

(async () => {
  try {
    const conn = await mysql.createConnection({
      host: process.env.DB_HOST || '127.0.0.1',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'inventario'
    });

    const [rows] = await conn.query('SELECT id, username, full_name, email, role, created_at FROM users ORDER BY id DESC');
    console.log(JSON.stringify(rows, null, 2));
    await conn.end();
    process.exit(0);
  } catch (err) {
    console.error('Error leyendo users:', err.message || err);
    process.exit(1);
  }
})();
