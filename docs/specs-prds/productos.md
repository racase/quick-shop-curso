# Modulo: Productos

## Descripcion

Gestiona el catalogo de productos de la tienda. Los productos son visibles para todos los visitantes (autenticados o no). Un administrador puede crear, editar y desactivar productos. Los 20 productos iniciales se crean por seed a partir del fichero `docs/products-images.json`. Un producto con stock 0 es visible en el catalogo pero no se puede agregar al carrito.

## Modelo de datos

### Tabla: productos

| Columna      | Tipo           | Restricciones                           |
|--------------|----------------|-----------------------------------------|
| id           | INTEGER        | PRIMARY KEY, AUTOINCREMENT              |
| nombre       | VARCHAR(255)   | NOT NULL                                |
| descripcion  | TEXT           |                                         |
| precio       | NUMERIC(10, 2) | NOT NULL, CHECK (precio > 0)            |
| stock        | INTEGER        | NOT NULL, DEFAULT 0, CHECK (stock >= 0) |
| imagen_url   | VARCHAR(500)   |                                         |
| is_active    | BOOLEAN        | NOT NULL, DEFAULT true                  |
| created_at   | TIMESTAMP      | NOT NULL, DEFAULT now()                 |
| updated_at   | TIMESTAMP      | NOT NULL, DEFAULT now()                 |

## Endpoints

### GET /products/

Lista todos los productos activos. Accesible sin autenticacion.

**Query params opcionales:**
- `skip`: integer, default 0
- `limit`: integer, default 100

**Response 200:**
```json
[
  {
    "id": 1,
    "nombre": "string",
    "descripcion": "string",
    "precio": "29.99",
    "stock": 10,
    "imagen_url": "string",
    "is_active": true
  }
]
```

---

### GET /products/{id}

Devuelve el detalle de un producto. Accesible sin autenticacion.

**Response 200:**
```json
{
  "id": 1,
  "nombre": "string",
  "descripcion": "string",
  "precio": "29.99",
  "stock": 10,
  "imagen_url": "string",
  "is_active": true,
  "created_at": "2024-01-01T00:00:00",
  "updated_at": "2024-01-01T00:00:00"
}
```

**Errores:**
- 404 Not Found: producto no encontrado

---

### POST /products/

Crea un nuevo producto. Solo accesible para administradores.

**Headers:** Authorization: Bearer {token}

**Request body:**
```json
{
  "nombre": "string",
  "descripcion": "string",
  "precio": "29.99",
  "stock": 10,
  "imagen_url": "string"
}
```

**Response 201:**
```json
{
  "id": 2,
  "nombre": "string",
  "descripcion": "string",
  "precio": "29.99",
  "stock": 10,
  "imagen_url": "string",
  "is_active": true,
  "created_at": "2024-01-01T00:00:00",
  "updated_at": "2024-01-01T00:00:00"
}
```

**Errores:**
- 401 Unauthorized: token ausente o invalido
- 403 Forbidden: el usuario no es administrador
- 422 Unprocessable Entity: precio <= 0 o stock < 0

---

### PUT /products/{id}

Actualiza un producto existente. Solo accesible para administradores.

**Headers:** Authorization: Bearer {token}

**Request body** (todos los campos opcionales):
```json
{
  "nombre": "string",
  "descripcion": "string",
  "precio": "29.99",
  "stock": 10,
  "imagen_url": "string",
  "is_active": true
}
```

**Response 200:** mismo esquema que GET /products/{id}

**Errores:**
- 401 Unauthorized
- 403 Forbidden
- 404 Not Found
- 422 Unprocessable Entity

---

### DELETE /products/{id}

Desactiva un producto (soft delete: pone is_active a false). Solo accesible para administradores.

**Headers:** Authorization: Bearer {token}

**Response 200:**
```json
{
  "detail": "Producto desactivado correctamente"
}
```

**Errores:**
- 401 Unauthorized
- 403 Forbidden
- 404 Not Found

## Criterios de aceptacion

- El catalogo es visible sin autenticacion.
- Solo los administradores pueden crear, editar o desactivar productos.
- El precio debe ser mayor que 0, almacenado como Decimal con 2 decimales.
- El stock debe ser un entero mayor o igual a 0.
- Un producto con stock 0 aparece en el catalogo pero no puede agregarse al carrito.
- La desactivacion de un producto es un soft delete (no se elimina el registro de base de datos).
- Los 20 productos del seed se crean a partir de `docs/products-images.json` de forma idempotente.

## Pantallas en el frontend

- **Catalogo:** cuadricula de tarjetas de producto con imagen, nombre, precio y boton "Agregar al carrito". Si stock es 0 el boton aparece deshabilitado. Diseno responsive.
- **Panel de administrador - Productos:** tabla con listado de productos, precio, stock y estado activo. Botones para crear, editar y desactivar. Formulario de creacion y edicion en modal o pagina separada.
