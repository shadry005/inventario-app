-- Inserta productos en la base que usa el backend: `proyecto_final`
USE inventario;

INSERT INTO productos (nombre, descripcion, precio, stock) VALUES
('Café Premium', 'Café molido de alta calidad', 12.50, 25),
('Té Verde', 'Té natural con antioxidantes', 8.90, 14),
('Miel Orgánica', 'Miel pura de abeja', 15.75, 7);

-- Verifica
SELECT COUNT(*) AS total FROM productos;
