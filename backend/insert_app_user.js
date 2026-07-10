const mysql = require('mysql2/promise');

(async () => {
  const user = {
    username: 'admin_test',
    password_hash: 'Admin123!', // prueba — no usar en producción
    full_name: 'Admin Test',
    email: 'admin@test.local',
    role: 'admin'
  };

  try {
    const conn = await mysql.createConnection({
      host: process.env.DB_HOST || '127.0.0.1',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'inventario'
    });

    const [exists] = await conn.execute('SELECT id FROM users WHERE username = ? LIMIT 1', [user.username]);
    if (Array.isArray(exists) && exists.length > 0) {
      console.log('Usuario ya existe:', user.username);
    } else {
      const [res] = await conn.execute(
        'INSERT INTO users (username, password_hash, full_name, email, role) VALUES (?, ?, ?, ?, ?)',
        [user.username, user.password_hash, user.full_name, user.email, user.role]
      );
      console.log('Usuario insertado con id=', res.insertId);
    }

    await conn.end();
    process.exit(0);
  } catch (err) {
    console.error('Error insertando usuario:', err.message || err);
    process.exit(1);
  }
})();
