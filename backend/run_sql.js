const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');

(async function run() {
  try {
    // Preferir seed.sql (usa DB 'inventario'), si no existe usar seed_to_proyecto_final.sql
    let file = path.join(__dirname, 'seed.sql');
    if (!fs.existsSync(file)) {
      file = path.join(__dirname, 'seed_to_proyecto_final.sql');
    }

    if (!fs.existsSync(file)) {
      console.error('No se encontró seed.sql ni seed_to_proyecto_final.sql en', __dirname);
      process.exit(1);
    }

    console.log('Leyendo SQL desde:', file);
    const sql = fs.readFileSync(file, 'utf8');

    const conn = await mysql.createConnection({
      host: process.env.DB_HOST || '127.0.0.1',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      multipleStatements: true
    });

    console.log('Conectando a la base de datos...');

    // Ejecutar sentencias una por una para poder ignorar errores no críticos (índices duplicados, etc.)
    const statements = sql
      .split(/;\s*(?=\n|$)/m)
      .map(s => s.trim())
      .filter(s => s.length > 0);

    for (const stmt of statements) {
      try {
        // Saltar selects que no devuelven nada útil en ejecución por lotes
        await conn.query(stmt);
      } catch (err) {
        const msg = (err && err.message) ? err.message : String(err);
        // Ignorar errores conocidos de 'already exists' / 'Duplicate key'
        if (/duplicate key name|already exists|Duplicate entry|Duplicate key/i.test(msg)) {
          console.warn('Advertencia al ejecutar sentencia (omitida):', msg);
          continue;
        }
        console.error('Error ejecutando sentencia:', msg);
        await conn.end();
        process.exit(1);
      }
    }

    console.log('SQL ejecutado correctamente (con advertencias si las hubo).');
    await conn.end();
    process.exit(0);
  } catch (err) {
    console.error('Error ejecutando SQL:', err.message || err);
    process.exit(1);
  }
})();
