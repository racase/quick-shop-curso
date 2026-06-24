# Modulo: Productos

## Descripcion

Gestiona el catalogo de productos de la tienda. Los clientes pueden consultar el catalogo y el detalle de cada producto. El administrador puede crear, editar y desactivar productos. Los productos con stock 0 son visibles en el catalogo pero no se pueden agregar al carrito. Los productos se crean por seed al arrancar si la base de datos esta vacia.

## Modelo de datos

### Tabla: products

| Columna     | Tipo                        | Restricciones                              |
|-------------|-----------------------------|--------------------------------------------|
| id          | UUID                        | PK, default gen_random_uuid()              |
| name        | VARCHAR(255)                | NOT NULL                                   |
| description | TEXT                        | NOT NULL                                   |
| price       | NUMERIC(10, 2)              | NOT NULL, CHECK (price > 0)                |
| stock       | INTEGER                     | NOT NULL, CHECK (stock >= 0)               |
| image_url   | VARCHAR(500)                | NOT NULL                                   |
| is_active   | BOOLEAN                     | NOT NULL, default TRUE                     |
| created_at  | TIMESTAMP WITH TIME ZONE    | NOT NULL, default now()                    |
| updated_at  | TIMESTAMP WITH TIME ZONE    | NOT NULL, default now()                    |

**Nota sobre imagenes**: usar `https://picsum.photos/seed/quickshop-{n}/400/300` con `n` entre 1 y 20 para obtener imagenes estables entre reinicios.

## Endpoints

### GET /products

Lista los productos activos del catalogo. Accesible sin autenticacion.

**Query params**

| Param  | Tipo    | Default | Descripcion                         |
|--------|---------|---------|-------------------------------------|
| skip   | integer | 0       | Numero de registros a saltar        |
| limit  | integer | 20      | Maximo de registros a devolver      |
| search | string  | -       | Filtro por nombre (busqueda parcial) |

**Response 200**

```json
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "Teclado mecanico TKL",
    "description": "Teclado mecanico tenkeyless con switches Cherry MX Red.",
    "price": "89.99",
    "stock": 15,
    "image_url": "https://picsum.photos/seed/quickshop-1/400/300",
    "is_active": true
  }
]
```

**Errores**

| Codigo | Motivo          |
|--------|-----------------|
| 422    | Params invalidos |

---

### GET /products/{product_id}

Devuelve el detalle de un producto. Accesible sin autenticacion.

**Response 200**

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "name": "Teclado mecanico TKL",
  "description": "Teclado mecanico tenkeyless con switches Cherry MX Red.",
  "price": "89.99",
  "stock": 15,
  "image_url": "https://picsum.photos/seed/quickshop-1/400/300",
  "is_active": true,
  "created_at": "2024-01-15T10:00:00Z",
  "updated_at": "2024-01-15T10:00:00Z"
}
```

**Errores**

| Codigo | Motivo                  |
|--------|-------------------------|
| 404    | Producto no encontrado  |

---

### POST /products — Solo admin

Crea un nuevo producto.

**Headers requeridos**: `Authorization: Bearer {access_token}` (rol admin)

**Request body**

```json
{
  "name": "Monitor 4K 27 pulgadas",
  "description": "Monitor IPS 4K con frecuencia de refresco de 144 Hz.",
  "price": "349.99",
  "stock": 8,
  "image_url": "https://picsum.photos/seed/quickshop-21/400/300"
}
```

**Response 201**

```json
{
  "id": "660f9500-f30c-52e5-b827-557766551111",
  "name": "Monitor 4K 27 pulgadas",
  "description": "Monitor IPS 4K con frecuencia de refresco de 144 Hz.",
  "price": "349.99",
  "stock": 8,
  "image_url": "https://picsum.photos/seed/quickshop-21/400/300",
  "is_active": true,
  "created_at": "2024-06-24T12:00:00Z",
  "updated_at": "2024-06-24T12:00:00Z"
}
```

**Errores**

| Codigo | Motivo                              |
|--------|-------------------------------------|
| 401    | Token ausente, invalido o expirado  |
| 403    | El usuario no tiene rol admin       |
| 422    | Datos invalidos                     |

---

### PUT /products/{product_id} — Solo admin

Actualiza todos los campos de un producto existente.

**Headers requeridos**: `Authorization: Bearer {access_token}` (rol admin)

**Request body** (misma estructura que POST; todos los campos son obligatorios)

**Response 200** (producto actualizado completo)

**Errores**

| Codigo | Motivo                              |
|--------|-------------------------------------|
| 401    | Token ausente, invalido o expirado  |
| 403    | El usuario no tiene rol admin       |
| 404    | Producto no encontrado              |
| 422    | Datos invalidos                     |

---

### PATCH /products/{product_id} — Solo admin

Actualiza campos individuales de un producto (incluido `is_active` para activar/desactivar).

**Headers requeridos**: `Authorization: Bearer {access_token}` (rol admin)

**Request body** (todos los campos son opcionales)

```json
{
  "stock": 20,
  "is_active": false
}
```

**Response 200** (producto actualizado completo)

**Errores**

| Codigo | Motivo                              |
|--------|-------------------------------------|
| 401    | Token ausente, invalido o expirado  |
| 403    | El usuario no tiene rol admin       |
| 404    | Producto no encontrado              |
| 422    | Datos invalidos                     |

---

### DELETE /products/{product_id} — Solo admin

Desactiva un producto (soft delete: cambia `is_active` a `false`). No elimina el registro fisicamente para preservar historial de pedidos.

**Headers requeridos**: `Authorization: Bearer {access_token}` (rol admin)

**Response 200**

```json
{
  "message": "Producto desactivado correctamente"
}
```

**Errores**

| Codigo | Motivo                              |
|--------|-------------------------------------|
| 401    | Token ausente, invalido o expirado  |
| 403    | El usuario no tiene rol admin       |
| 404    | Producto no encontrado              |

## Criterios de aceptacion

- El catalogo muestra solo productos con `is_active = true`.
- Un producto con stock 0 aparece en el catalogo pero el boton de agregar al carrito esta deshabilitado.
- El seed crea exactamente 20 productos con datos realistas e imagenes de picsum.photos.
- El precio se almacena con precision decimal y se serializa como string para evitar errores de punto flotante.
- El stock nunca puede quedar en valor negativo.
- El administrador puede crear, actualizar y desactivar productos desde el panel de administracion.
- La eliminacion es logica (soft delete); el registro permanece en la base de datos.

## Pantallas en el frontend

### / — Catalogo de productos (publica)

- Grid de tarjetas de producto con: imagen, nombre, precio, stock disponible.
- Campo de busqueda por nombre.
- Boton "Agregar al carrito" deshabilitado si stock es 0 o el usuario no esta autenticado como cliente.
- Indicador visual en tarjetas con stock 0 ("Sin stock").
- Al hacer clic en una tarjeta, navega al detalle del producto.

### /products/{id} — Detalle de producto (publica)

- Imagen ampliada, nombre, descripcion completa, precio, stock disponible.
- Selector de cantidad (1 hasta stock disponible).
- Boton "Agregar al carrito" deshabilitado si stock es 0.
- Enlace de regreso al catalogo.

### /admin/products — Gestion de productos (admin)

- Tabla con todos los productos (activos e inactivos) con columnas: nombre, precio, stock, estado.
- Botones de editar y desactivar/activar por fila.
- Boton para crear nuevo producto.
- Solo accesible para usuarios con rol admin.

### /admin/products/new y /admin/products/{id}/edit — Formulario de producto (admin)

- Campos: nombre, descripcion, precio, stock, URL de imagen, estado activo.
- Validacion de cliente antes de enviar.
- Confirmacion visual tras guardar.
