const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, 'data');
const dataFile = path.join(dataDir, 'productos.json');

fs.mkdirSync(dataDir, { recursive: true });

const seedProducts = [
  {
    id: 1,
    nombre: 'Café Premium',
    descripcion: 'Café molido de alta calidad',
    precio: 12.5,
    stock: 25
  },
  {
    id: 2,
    nombre: 'Té Verde',
    descripcion: 'Té natural con antioxidantes',
    precio: 8.9,
    stock: 14
  },
  {
    id: 3,
    nombre: 'Miel Orgánica',
    descripcion: 'Miel pura de abeja',
    precio: 15.75,
    stock: 7
  }
];

fs.writeFileSync(dataFile, JSON.stringify(seedProducts, null, 2), 'utf8');
console.log('Productos de prueba insertados correctamente.');
