import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import type { CreateProductDto } from './dto/create-product.dto.js';
import type { UpdateProductDto } from './dto/update-product.dto.js';
import type { Product } from './entities/product.entity.js';

/** Lógica de negocio y almacenamiento en memoria (se reinicia al reiniciar el servidor). */
@Injectable()
export class ProductsService {
  private products: Product[] = [];
  private nextId = 1;

  constructor() {
    const seed: CreateProductDto[] = [
      { sku: 'MART-016', name: 'Martillo de uña 16 oz', price: 85.5, stock: 20, category: 'herramientas' },
      { sku: 'CABLE-12', name: 'Cable eléctrico calibre 12 (metro)', price: 6.75, stock: 500, category: 'electricidad' },
      { sku: 'TUBO-PVC-12', name: 'Tubo PVC 1/2" x 6 m', price: 32, stock: 0, category: 'plomeria', description: 'Para agua fría' },
    ];
    seed.forEach((dto) => this.create(dto));
  }

  findAll(): Product[] {
    return this.products;
  }

  findOne(id: number): Product {
    const product = this.products.find((p) => p.id === id);
    if (!product) {
      throw new NotFoundException(`No existe un producto con id ${id}`);
    }
    return product;
  }

  create(dto: CreateProductDto): Product {
    this.ensureSkuIsAvailable(dto.sku);
    const now = new Date().toISOString();
    const product: Product = { id: this.nextId++, ...dto, createdAt: now, updatedAt: now };
    this.products.push(product);
    return product;
  }

  update(id: number, dto: UpdateProductDto): Product {
    const product = this.findOne(id);
    const changes = withoutUndefined(dto);
    if (changes.sku !== undefined && changes.sku !== product.sku) {
      this.ensureSkuIsAvailable(changes.sku);
    }
    const updated: Product = { ...product, ...changes, updatedAt: new Date().toISOString() };
    this.products = this.products.map((p) => (p.id === id ? updated : p));
    return updated;
  }

  remove(id: number): void {
    this.findOne(id); // lanza 404 si no existe
    this.products = this.products.filter((p) => p.id !== id);
  }

  private ensureSkuIsAvailable(sku: string): void {
    if (this.products.some((p) => p.sku === sku)) {
      throw new ConflictException(`Ya existe un producto con el SKU ${sku}`);
    }
  }
}

/**
 * Quita las propiedades undefined. Con ValidationPipe({ transform: true }) el DTO es una
 * instancia de clase y sus campos no enviados existen con valor undefined; sin este paso
 * un PATCH parcial borraría los demás campos.
 */
function withoutUndefined<T extends object>(value: T): Partial<T> {
  return Object.fromEntries(Object.entries(value).filter(([, v]) => v !== undefined)) as Partial<T>;
}
