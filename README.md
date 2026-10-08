# Inventario Ferretería: NestJS + React

Monorepositorio con una **API HTTP validada en NestJS** (datos en memoria) y una **interfaz React + TypeScript** que consume su contrato. El recurso es `products`: productos de una ferretería con un SKU único.

```
.
├── backend/                     # NestJS (puerto 3000)
│   ├── src/
│   │   ├── products/
│   │   │   ├── dto/             # CreateProductDto, UpdateProductDto (class-validator)
│   │   │   ├── entities/        # Product (forma de la respuesta)
│   │   │   ├── products.controller.ts
│   │   │   ├── products.service.ts   # lógica + almacenamiento en memoria
│   │   │   └── products.module.ts
│   │   ├── common/              # filtro de excepciones y DTO de error
│   │   ├── setup.ts             # ValidationPipe, CORS, filtro y Swagger
│   │   └── main.ts
│   └── test/app.e2e-spec.ts     # pruebas de todos los códigos HTTP
└── frontend/                    # React + Vite (puerto 5173)
    └── src/
        ├── api/                 # tipos del contrato y cliente fetch
        ├── components/          # ProductForm, ProductTable, Notice
        └── App.tsx
```

## Requisitos

- Node.js 20 o superior y npm

## Ejecución

En dos terminales:

```bash
# 1) Backend
cd backend
npm install
npm run start:dev        # http://localhost:3000  ·  OpenAPI: http://localhost:3000/docs

# 2) Frontend
cd frontend
npm install
npm run dev              # http://localhost:5173
```

Pruebas e2e del backend: `cd backend && npm run test:e2e`.

Variables opcionales:

| Variable          | Dónde    | Valor por defecto       | Uso                               |
| ----------------- | -------- | ----------------------- | --------------------------------- |
| `PORT`            | backend  | `3000`                  | Puerto de la API                  |
| `FRONTEND_ORIGIN` | backend  | `http://localhost:5173` | Único origen permitido por CORS   |
| `VITE_API_URL`    | frontend | `http://localhost:3000` | URL base de la API                |

## Rutas disponibles

| Método   | Ruta             | Descripción                      | Éxito                  | Errores posibles |
| -------- | ---------------- | -------------------------------- | ---------------------- | ---------------- |
| `GET`    | `/products`      | Lista todos los productos        | `200`                  | —                |
| `GET`    | `/products/:id`  | Obtiene un producto              | `200`                  | `400`, `404`     |
| `POST`   | `/products`      | Crea un producto                 | `201` + recurso creado | `400`, `409`     |
| `PATCH`  | `/products/:id`  | Actualiza solo los campos enviados | `200` + recurso actualizado | `400`, `404`, `409` |
| `DELETE` | `/products/:id`  | Elimina un producto              | `204` sin cuerpo       | `400`, `404`     |
| `GET`    | `/docs`          | Documentación OpenAPI (Swagger UI) | `200`                | —                |

No se implementó `PUT` (es opcional).

Cuerpo de ejemplo para `POST /products`:

```json
{ "sku": "TALADRO-01", "name": "Taladro 1/2\"", "price": 499.99, "stock": 5, "category": "herramientas" }
```

Reglas de validación:
- `sku`: 3 a 20 caracteres en mayúsculas, números o guiones, y único.
- `name`: obligatorio, máximo 80 caracteres.
- `price`: número mayor que 0, con máximo 2 decimales.
- `stock`: entero mayor o igual a 0.
- `category`: `herramientas`, `electricidad`, `plomeria` o `pintura`.
- `description`: opcional, máximo 300 caracteres.

Se rechazan las propiedades desconocidas.

## Códigos de estado utilizados

| Código | Cuándo y por qué |
| ------ | ---------------- |
| **200 OK** | `GET` de colección o detalle, y `PATCH` exitoso. Devuelve el recurso. |
| **201 Created** | `POST` exitoso. Se creó un recurso nuevo y se devuelve con su `id` asignado. |
| **204 No Content** | `DELETE` exitoso. Ya no hay recurso que devolver, por eso no lleva cuerpo. |
| **400 Bad Request** | Lo envía el `ValidationPipe` en estos casos: falta un campo requerido, un tipo es incorrecto (por ejemplo `"10"` en lugar de `10`), no se cumple una restricción o llega una propiedad desconocida (`forbidNonWhitelisted`). También responde 400 con un `id` no numérico (`ParseIntPipe`) y con un `PATCH` vacío. |
| **404 Not Found** | El `id` no existe (`NotFoundException`). |
| **409 Conflict** | El `sku` ya lo usa otro producto, al crear o al cambiarlo (`ConflictException`). La petición es válida, pero choca con el estado actual. |

No se fabrica ningún 500. Todos los errores usan excepciones estándar de Nest y ningún controlador usa `@Res()`.

### Formato de error consistente

Un filtro global (`HttpExceptionFilter`) da a todos los errores la misma forma, y `message` siempre es un arreglo:

```json
{
  "statusCode": 400,
  "error": "Bad Request",
  "message": ["property foo should not exist", "price debe ser mayor que 0"],
  "path": "/products",
  "timestamp": "2026-10-07T15:00:00.000Z"
}
```

## Decisiones de diseño

- **Configuración global** en `setup.ts`: `ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true })`, el filtro de errores, Swagger y CORS para el origen exacto `http://localhost:5173`. Las pruebas e2e usan la misma función.
- **Controlador y servicio separados:** el controlador solo define rutas, códigos y documentación. El servicio contiene la lógica y lanza las excepciones.
- **PATCH parcial real:** el frontend envía solo los campos que cambiaron y el servicio ignora los valores `undefined`.
- **La interfaz usa lo que confirma la API:**
  - Después de un `201` o un `200`, React guarda el objeto que devolvió el servidor, con su `id` y sus fechas.
  - Después de un `204`, React quita el producto de la lista.
  - Si la API falla, la lista no cambia y se muestran los mensajes del servidor.

## Guion sugerido para el video (3 min)

1. Abrir `http://localhost:3000/docs` y mostrar las rutas y los esquemas.
2. En Swagger, ejecutar un `POST` inválido (`price: -5`, `extra: true`). Muestra 400 con los mensajes.
3. En React, con DevTools → Network abierto:
   - Crear un producto: `POST` 201.
   - Editarlo: `PATCH` 200; en el payload solo van los campos cambiados.
   - Eliminarlo: `DELETE` 204.
4. Crear otro producto con el SKU `MART-016`: 409, con su mensaje en la interfaz.
