import { type ChangeEvent, type FormEvent, useState } from 'react';
import { CATEGORIES, type Category, type CreateProductInput, type Product } from '../api/types';

interface FormValues {
  sku: string;
  name: string;
  price: string;
  stock: string;
  category: Category;
  description: string;
}

const EMPTY: FormValues = { sku: '', name: '', price: '', stock: '', category: 'herramientas', description: '' };

function toValues(product: Product): FormValues {
  return {
    sku: product.sku,
    name: product.name,
    price: String(product.price),
    stock: String(product.stock),
    category: product.category,
    description: product.description ?? '',
  };
}

/** Convierte el formulario al cuerpo de la API. La validación real la hace el servidor. */
function toInput(values: FormValues): CreateProductInput {
  const input: CreateProductInput = {
    sku: values.sku.trim(),
    name: values.name.trim(),
    price: parseFloat(values.price), // vacío → NaN → null en JSON → 400 del servidor
    stock: parseFloat(values.stock),
    category: values.category,
  };
  if (values.description.trim() !== '') input.description = values.description.trim();
  return input;
}

interface ProductFormProps {
  /** Producto en edición; si es null el formulario crea uno nuevo. */
  editing: Product | null;
  isSubmitting: boolean;
  onCreate: (input: CreateProductInput) => Promise<boolean>;
  onUpdate: (product: Product, input: CreateProductInput) => Promise<boolean>;
  onCancelEdit: () => void;
}

export function ProductForm({ editing, isSubmitting, onCreate, onUpdate, onCancelEdit }: ProductFormProps) {
  const [values, setValues] = useState<FormValues>(editing ? toValues(editing) : EMPTY);

  function handleChange(event: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    const { name, value } = event.target;
    setValues((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const input = toInput(values);
    const ok = editing ? await onUpdate(editing, input) : await onCreate(input);
    if (ok && !editing) setValues(EMPTY);
  }

  return (
    <form className="product-form" onSubmit={handleSubmit} noValidate>
      <h2>{editing ? `Editar producto #${editing.id}` : 'Nuevo producto'}</h2>

      <div className="grid">
        <label>
          SKU
          <input name="sku" value={values.sku} onChange={handleChange} placeholder="TALADRO-01" />
        </label>
        <label>
          Nombre
          <input name="name" value={values.name} onChange={handleChange} placeholder='Taladro 1/2"' />
        </label>
        <label>
          Precio (Q)
          <input name="price" type="number" step="0.01" value={values.price} onChange={handleChange} />
        </label>
        <label>
          Existencias
          <input name="stock" type="number" step="1" value={values.stock} onChange={handleChange} />
        </label>
        <label>
          Categoría
          <select name="category" value={values.category} onChange={handleChange}>
            {CATEGORIES.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </label>
        <label className="full">
          Descripción (opcional)
          <textarea name="description" rows={2} value={values.description} onChange={handleChange} />
        </label>
      </div>

      <div className="actions">
        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Guardando…' : editing ? 'Guardar cambios (PATCH)' : 'Crear producto (POST)'}
        </button>
        {editing && (
          <button type="button" className="secondary" onClick={onCancelEdit} disabled={isSubmitting}>
            Cancelar
          </button>
        )}
      </div>
    </form>
  );
}
