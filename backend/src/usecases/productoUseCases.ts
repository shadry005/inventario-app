import { Producto, ProductoRepository } from '../domain/producto';

export class ProductoUseCases {
    constructor(private repo: ProductoRepository) {}

    async listar(): Promise<Producto[]> {
        return this.repo.listar();
    }

    async obtenerPorId(id: number): Promise<Producto | null> {
        return this.repo.obtenerPorId(id);
    }

    async crear(producto: Producto): Promise<Producto> {
        return this.repo.crear(producto);
    }

    async actualizar(id: number, producto: Producto): Promise<void> {
        await this.repo.actualizar(id, producto);
    }

    async eliminar(id: number): Promise<void> {
        await this.repo.eliminar(id);
    }
}