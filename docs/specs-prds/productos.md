# Modulo: Productos

## Descripcion

Gestiona el catalogo de productos de la tienda. Los visitantes y clientes pueden consultarlo sin autenticacion. Los administradores pueden crear, editar y desactivar productos. La modificacion de stock es responsabilidad del modulo de pedidos.

## Modelo de datos

### Tabla: products

| Columna     | Tipo              | Restricciones                              |
|-------------|-------------------|--------------------------------------------|
| id          | UUID              | PK, default uuid_generate_v4()            |
| name        | VARCHAR(255)      | NOT NULL                                   |
| description | TEXT              | NOT NULL                                   |
| price       | NUMERIC(10, 2)    | NOT NULL, CHECK (price > 0)               |
| stock       | INTEGER           | NOT NULL, CHECK (stock >= 0)              |
| image_url   | VARCHAR(500)      | NOT NULL                                   |
| is_active   | BOOLEAN           | NOT NULL, default TRUE                     |
| created_at  | TIMESTAMP WITH TZ | NOT NULL, default now()                    |
| updated_at  | TIMESTAMP WITH TZ | NOT NULL, default now()                    |

Notas:
- Las imagenes usan URLs de picsum.photos con seed estable. Ejemplo: https://picsum.photos/seed/quickshop-1/400/300
- Un producto con stock = 0 permanece visible en el catalogo pero no puede agregarse al carrito.
- Desactivar un producto (is_active = false) lo oculta del catalogo publico pero el administrador lo sigue viendo.

## Endpoints

### GET /products

Lista los productos activos. Acceso publico.

**Query params**
- page: int (default 1)
- size: int (default 20, maximo 100)
- search: string (opcional, filtra por nombre o descripcion)

**Response 200**

```json
{
  "items": [
    {
      "id": "uuid",
      "name": "string",
      "description": "string",
      "price": "10.99",
      "stock": 10,
      "image_url": "string",
      "is_active": true
    }
  ],
  "total": 20,
  "page": 1,
  "size": 20
}
```

---

### GET /products/{product_id}

Detalle de un producto activo. Acceso publico.

**Response 200**: mismo esquema que un item de la lista.

**Errores**
- 404: producto no encontrado o inactivo

---

### POST /products

Crea un nuevo producto. Solo administrador.

**Headers**: Authorization: Bearer {token} (rol admin)

**Request body**

```json
{
  "name": "string",
  "description": "string",
  "price": "decimal mayor que 0",
  "stock": "entero mayor o igual que 0",
  "image_url": "string (URL valida)"
}
```

**Response 201**: producto creado completo.

**Errores**
- 400: datos invalidos
- 401: no autenticado
- 403: no es administrador

---

### PUT /products/{product_id}

Actualiza un producto existente. Solo administrador.

**Headers**: Authorization: Bearer {token} (rol admin)

**Request body**: mismos campos que POST, todos opcionales.

**Response 200**: producto actualizado completo.

**Errores**
- 400: datos invalidos
- 401: no autenticado
- 403: no es administrador
- 404: producto no encontrado

---

### DELETE /products/{product_id}

Desactiva un producto (soft delete: is_active = false). Solo administrador.

**Headers**: Authorization: Bearer {token} (rol admin)

**Response 204**: sin contenido.

**Errores**
- 401: no autenticado
- 403: no es administrador
- 404: producto no encontrado

---

### GET /admin/products

Lista todos los productos incluyendo los inactivos. Solo administrador.

**Headers**: Authorization: Bearer {token} (rol admin)

**Query params**: mismos que GET /products.

**Response 200**: misma estructura que GET /products pero incluye productos con is_active = false.

## Criterios de aceptacion

1. El catalogo publico muestra unicamente productos activos.
2. Un producto con stock = 0 aparece en el catalogo pero el boton de agregar al carrito esta deshabilitado.
3. El administrador puede crear, editar y desactivar productos.
4. El precio siempre tiene exactamente 2 decimales y es mayor que 0.
5. El stock nunca es negativo.
6. Las imagenes apuntan a picsum.photos con seed estable.
7. El seed del backend crea exactamente 20 productos con datos realistas.

## Pantallas en el frontend

### Catalogo de productos (acceso publico)

- Grid responsivo con tarjetas: imagen, nombre, precio, indicador de stock.
- Barra de busqueda por nombre.
- Paginacion.
- Boton "Agregar al carrito" deshabilitado si stock = 0 o si el usuario no esta autenticado como cliente.

### Detalle de producto (acceso publico)

- Imagen grande, nombre, descripcion completa, precio, stock disponible.
- Boton "Agregar al carrito" con selector de cantidad (maximo: stock disponible).

### Gestion de productos (solo administrador)

- Tabla con todos los productos, incluidos los inactivos.
- Acciones por fila: editar, desactivar.
- Boton para crear nuevo producto.
- Formulario en modal o pagina dedicada para crear y editar.
