import { useCallback, useEffect, useState } from 'react';
import { ApiError, API_URL, createProduct, deleteProduct, listProducts, updateProduct } from './api/products';
import type { CreateProductInput, Product, UpdateProductInput } from './api/types';
import { Notice, type NoticeState } from './components/Notice';
import { ProductForm } from './components/ProductForm';
import { ProductTable } from './components/ProductTable';
import './App.css';

type ListState = { kind: 'loading' } | { kind: 'ready' } | { kind: 'error'; messages: string[] };

function toErrorNotice(error: unknown): NoticeState {
  if (error instanceof ApiError) return { kind: 'error', status: error.status, messages: error.messages };
  return { kind: 'error', status: 0, messages: ['Error inesperado en el navegador.'] };
}

/** Solo los campos que cambiaron, para enviar un PATCH realmente parcial. */
function diff(product: Product, input: CreateProductInput): UpdateProductInput {
  const changes: UpdateProductInput = {};
  if (input.sku !== product.sku) changes.sku = input.sku;
  if (input.name !== product.name) changes.name = input.name;
  if (input.price !== product.price) changes.price = input.price;
  if (input.stock !== product.stock) changes.stock = input.stock;
  if (input.category !== product.category) changes.category = input.category;
  if ((input.description ?? '') !== (product.description ?? '')) changes.description = input.description ?? '';
  return changes;
}

export default function App() {
  const [products, setProducts] = useState<Product[]>([]);
  const [listState, setListState] = useState<ListState>({ kind: 'loading' });
  const [notice, setNotice] = useState<NoticeState>(null);
  const [editing, setEditing] = useState<Product | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const load = useCallback(async () => {
    setListState({ kind: 'loading' });
    try {
      setProducts(await listProducts());
      setListState({ kind: 'ready' });
    } catch (error) {
      setListState({ kind: 'error', messages: error instanceof ApiError ? error.messages : ['Error inesperado'] });
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function handleCreate(input: CreateProductInput): Promise<boolean> {
    setIsSubmitting(true);
    setNotice(null);
    try {
      const created = await createProduct(input);
      // Se agrega lo que confirmó la API (con su id y fechas), no lo que se escribió.
      setProducts((prev) => [...prev, created]);
      setNotice({ kind: 'success', text: `201 Created: «${created.name}» se creó con id ${created.id}.` });
      return true;
    } catch (error) {
      setNotice(toErrorNotice(error));
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleUpdate(product: Product, input: CreateProductInput): Promise<boolean> {
    setIsSubmitting(true);
    setNotice(null);
    try {
      const updated = await updateProduct(product.id, diff(product, input));
      setProducts((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
      setEditing(null);
      setNotice({ kind: 'success', text: `200 OK: «${updated.name}» se actualizó.` });
      return true;
    } catch (error) {
      setNotice(toErrorNotice(error));
      if (error instanceof ApiError && error.status === 404) {
        // Ya no existe en el servidor: sincronizar la lista.
        setEditing(null);
        void load();
      }
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete(product: Product) {
    if (!window.confirm(`¿Eliminar «${product.name}»?`)) return;
    setDeletingId(product.id);
    setNotice(null);
    try {
      await deleteProduct(product.id);
      // Solo se quita de la interfaz después del 204 del servidor.
      setProducts((prev) => prev.filter((p) => p.id !== product.id));
      if (editing?.id === product.id) setEditing(null);
      setNotice({ kind: 'success', text: `204 No Content: «${product.name}» se eliminó.` });
    } catch (error) {
      setNotice(toErrorNotice(error));
      if (error instanceof ApiError && error.status === 404) void load();
    } finally {
      setDeletingId(null);
    }
  }

  function handleEdit(product: Product) {
    setNotice(null);
    setEditing(product);
  }

  return (
    <div className="app">
      <header>
        <h1>Inventario Ferretería</h1>
        <p>
          React + NestJS · API en <code>{API_URL}</code> ·{' '}
          <a href={`${API_URL}/docs`} target="_blank" rel="noreferrer">
            Documentación OpenAPI
          </a>
        </p>
      </header>

      <div aria-live="polite">
        <Notice notice={notice} onClose={() => setNotice(null)} />
      </div>

      <div className="layout">
        <section className="card">
          {/* key reinicia el formulario al cambiar entre crear y editar */}
          <ProductForm
            key={editing?.id ?? 'new'}
            editing={editing}
            isSubmitting={isSubmitting}
            onCreate={handleCreate}
            onUpdate={handleUpdate}
            onCancelEdit={() => setEditing(null)}
          />
        </section>

        <section className="card">
          <div className="list-header">
            <h2>Productos ({products.length})</h2>
            <button type="button" className="secondary" onClick={() => void load()} disabled={listState.kind === 'loading'}>
              Recargar
            </button>
          </div>

          {listState.kind === 'loading' && (
            <p className="loading" role="status">
              <span className="spinner" aria-hidden="true" /> Cargando productos…
            </p>
          )}
          {listState.kind === 'error' && (
            <div className="notice notice-error" role="alert">
              <div>
                <p className="notice-title">No se pudo cargar la lista</p>
                <ul>
                  {listState.messages.map((m) => (
                    <li key={m}>{m}</li>
                  ))}
                </ul>
              </div>
              <button type="button" onClick={() => void load()}>
                Reintentar
              </button>
            </div>
          )}
          {listState.kind === 'ready' && (
            <ProductTable
              products={products}
              editingId={editing?.id ?? null}
              deletingId={deletingId}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          )}
        </section>
      </div>
    </div>
  );
}
