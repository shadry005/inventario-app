const mysql = require('mysql2/promise');

(async () => {
  const products = [
    { nombre: 'Caramel Macchiato Nitro', descripcion: 'Espresso frío infundido con nitrógeno, vainilla sedosa y rejilla de caramelo.', precio: 5.25 },
    { nombre: 'Pistachio Velvet Latte', descripcion: 'Leche vaporizada con extracto de pistacho, espresso y polvo de cacao fino.', precio: 4.85 },
    { nombre: 'Matcha Frappé Supremo', descripcion: 'Té verde matcha premium licuado con crema de coco y trozos de waffle.', precio: 5.50 },
    { nombre: 'Espresso Intenso Doble', descripcion: 'Extracción pura de granos seleccionados de estricta altura con notas amargas.', precio: 2.90 },
    { nombre: 'Dona Boston Cream', descripcion: 'Rellena de suave crema pastelera y cubierta con chocolate belga.', precio: 3.10 },
    { nombre: 'Dona Crispy Speculoos', descripcion: 'Dona glaseada con trozos de galleta Lotus Biscoff y su propio spread.', precio: 3.40 },
    { nombre: 'Cheesecake de Frutos del Bosque', descripcion: 'Tarta cremosa horneada sobre base crujiente, coronada con coulis de moras.', precio: 4.95 },
    { nombre: 'Combo Kaffé Express', descripcion: '1 Espresso Intenso Doble + 1 Dona Boston Cream. El boost rápido.', precio: 5.20 },
    { nombre: 'Brunch Ejecutivo Altura', descripcion: '1 Pistachio Velvet Latte + 1 Croissant de Almendras + Mini ensalada frutal.', precio: 8.90 }
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
        // comprobar existencia por nombre
        const [exists] = await conn.execute('SELECT id FROM productos WHERE nombre = ? LIMIT 1', [p.nombre]);
        if (Array.isArray(exists) && exists.length > 0) {
          console.log('Skipping existing product:', p.nombre);
          continue;
        }

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
