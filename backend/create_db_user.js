const mysql = require('mysql2/promise');

(async () => {
  const user = 'inventario_test';
  const pass = 'Test1234!';
  try {
    const conn = await mysql.createConnection({
      host: process.env.DB_HOST || '127.0.0.1',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || ''
    });

    await conn.query(`CREATE USER IF NOT EXISTS '${user}'@'localhost' IDENTIFIED BY '${pass}'`);
    await conn.query(`GRANT SELECT, INSERT, UPDATE, DELETE, CREATE, DROP, INDEX, ALTER ON inventario.* TO '${user}'@'localhost'`);
    await conn.query('FLUSH PRIVILEGES');
    console.log(`Usuario ${user} creado/confirmado con contraseña ${pass}`);
    await conn.end();
    process.exit(0);
  } catch (err) {
    console.error('Error creando usuario:', err.message || err);
    process.exit(1);
  }
})();
