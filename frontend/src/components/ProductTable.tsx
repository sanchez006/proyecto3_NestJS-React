import type { Product } from '../api/types';

interface ProductTableProps {
  products: Product[];
  editingId: number | null;
  deletingId: number | null;
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
}

const currency = new Intl.NumberFormat('es-GT', { style: 'currency', currency: 'GTQ' });

/** Colección de productos tal como la confirmó la API. */
export function ProductTable({ products, editingId, deletingId, onEdit, onDelete }: ProductTableProps) {
  if (products.length === 0) {
    return <p className="empty">No hay productos. Crea el primero con el formulario.</p>;
  }

  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th scope="col">ID</th>
            <th scope="col">SKU</th>
            <th scope="col">Nombre</th>
            <th scope="col">Categoría</th>
            <th scope="col" className="num">Precio</th>
            <th scope="col" className="num">Stock</th>
            <th scope="col">
              <span className="sr-only">Acciones</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => (
            <tr key={product.id} className={product.id === editingId ? 'editing' : undefined}>
              <td>{product.id}</td>
              <td><code>{product.sku}</code></td>
              <td>
                {product.name}
                {product.description && <small>{product.description}</small>}
              </td>
              <td>{product.category}</td>
              <td className="num">{currency.format(product.price)}</td>
              <td className={`num ${product.stock === 0 ? 'out' : ''}`}>{product.stock}</td>
              <td className="row-actions">
                <button type="button" className="secondary" onClick={() => onEdit(product)}>
                  Editar
                </button>
                <button
                  type="button"
                  className="danger"
                  onClick={() => onDelete(product)}
                  disabled={deletingId === product.id}
                  aria-label={`Eliminar ${product.name}`}
                >
                  {deletingId === product.id ? 'Eliminando…' : 'Eliminar'}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
