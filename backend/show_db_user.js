const mysql = require('mysql2/promise');

(async () => {
  const user = 'inventario_test';
  try {
    const conn = await mysql.createConnection({
      host: process.env.DB_HOST || '127.0.0.1',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || ''
    });

    const [rows] = await conn.query("SELECT User, Host FROM mysql.user WHERE User = ?", [user]);
    if (rows && rows.length > 0) {
      console.log('Usuario encontrado:', rows);
    } else {
      console.log('Usuario no encontrado:', user);
    }

    await conn.end();
    process.exit(0);
  } catch (err) {
    console.error('Error comprobando usuario:', err.message || err);
    process.exit(1);
  }
})();
