export interface Producto {
    id?: number;
    nombre: string;
    descripcion: string;
    precio: number;
    stock: number;
}

export interface ProductoRepository {
    listar(): Promise<Producto[]>;
    obtenerPorId(id: number): Promise<Producto | null>;
    crear(producto: Producto): Promise<Producto>;
    actualizar(id: number, producto: Producto): Promise<void>;
    eliminar(id: number): Promise<void>;
}