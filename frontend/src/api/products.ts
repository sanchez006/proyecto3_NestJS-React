// Cliente HTTP de la API de productos. Los componentes no usan fetch directamente.
import type { ApiErrorBody, CreateProductInput, Product, UpdateProductInput } from './types';

export const API_URL: string = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';

/** Error con el código HTTP y los mensajes que envió el servidor. */
export class ApiError extends Error {
  readonly status: number;
  readonly messages: string[];

  constructor(status: number, messages: string[]) {
    super(messages.join(' · '));
    this.name = 'ApiError';
    this.status = status;
    this.messages = messages;
  }
}

function isApiErrorBody(data: unknown): data is ApiErrorBody {
  return (
    typeof data === 'object' &&
    data !== null &&
    'statusCode' in data &&
    'message' in data &&
    Array.isArray(data.message)
  );
}

async function send(path: string, init: RequestInit = {}): Promise<Response> {
  let response: Response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      ...init,
      headers: { 'Content-Type': 'application/json', ...init.headers },
    });
  } catch {
    throw new ApiError(0, [`No se pudo conectar con la API en ${API_URL}. ¿Está encendido el backend?`]);
  }

  if (!response.ok) {
    const data: unknown = await response.json().catch(() => null);
    const messages = isApiErrorBody(data) ? data.message : [`Error ${response.status}`];
    throw new ApiError(response.status, messages);
  }
  return response;
}

async function sendJson<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await send(path, init);
  return (await response.json()) as T;
}

export function listProducts(): Promise<Product[]> {
  return sendJson<Product[]>('/products');
}

export function createProduct(input: CreateProductInput): Promise<Product> {
  return sendJson<Product>('/products', { method: 'POST', body: JSON.stringify(input) });
}

export function updateProduct(id: number, changes: UpdateProductInput): Promise<Product> {
  return sendJson<Product>(`/products/${id}`, { method: 'PATCH', body: JSON.stringify(changes) });
}

/** DELETE responde 204 sin cuerpo. */
export async function deleteProduct(id: number): Promise<void> {
  await send(`/products/${id}`, { method: 'DELETE' });
}
