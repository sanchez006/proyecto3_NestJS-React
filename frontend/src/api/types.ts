// Contrato de la API (debe coincidir con los DTO del backend).

export const CATEGORIES = ['herramientas', 'electricidad', 'plomeria', 'pintura'] as const;
export type Category = (typeof CATEGORIES)[number];

export interface Product {
  id: number;
  sku: string;
  name: string;
  price: number;
  stock: number;
  category: Category;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

/** Cuerpo de POST /products. */
export interface CreateProductInput {
  sku: string;
  name: string;
  price: number;
  stock: number;
  category: Category;
  description?: string;
}

/** Cuerpo de PATCH /products/:id: solo los campos que cambian. */
export type UpdateProductInput = Partial<CreateProductInput>;

/** Forma de todos los errores que devuelve la API. */
export interface ApiErrorBody {
  statusCode: number;
  error: string;
  message: string[];
  path: string;
  timestamp: string;
}
