# Modulo: Carrito

## Descripcion

Permite a los clientes acumular productos antes de confirmar un pedido. El carrito es persistente entre sesiones. Los administradores no tienen carrito ni pueden operar sobre este endpoint.

## Modelo de datos

### Tabla: carts

| Columna    | Tipo              | Restricciones                          |
|------------|-------------------|----------------------------------------|
| id         | UUID              | PK, default uuid_generate_v4()        |
| user_id    | UUID              | NOT NULL, FK users(id), UNIQUE        |
| created_at | TIMESTAMP WITH TZ | NOT NULL, default now()                |
| updated_at | TIMESTAMP WITH TZ | NOT NULL, default now()                |

### Tabla: cart_items

| Columna    | Tipo              | Restricciones                               |
|------------|-------------------|---------------------------------------------|
| id         | UUID              | PK, default uuid_generate_v4()             |
| cart_id    | UUID              | NOT NULL, FK carts(id) ON DELETE CASCADE   |
| product_id | UUID              | NOT NULL, FK products(id)                  |
| quantity   | INTEGER           | NOT NULL, CHECK (quantity > 0)             |
| created_at | TIMESTAMP WITH TZ | NOT NULL, default now()                     |
| updated_at | TIMESTAMP WITH TZ | NOT NULL, default now()                     |

Restriccion adicional: UNIQUE (cart_id, product_id)

## Endpoints

### GET /cart

Devuelve el carrito del usuario autenticado con sus items y el total calculado.

**Headers**: Authorization: Bearer {token} (rol client)

**Response 200**

```json
{
  "id": "uuid",
  "items": [
    {
      "id": "uuid",
      "product": {
        "id": "uuid",
        "name": "string",
        "price": "10.99",
        "stock": 10,
        "image_url": "string"
      },
      "quantity": 2,
      "subtotal": "21.98"
    }
  ],
  "total": "21.98",
  "item_count": 2
}
```

**Errores**
- 401: no autenticado
- 403: usuario con rol admin

---

### POST /cart/items

Agrega un producto al carrito. Si el producto ya existe en el carrito, incrementa la cantidad.

**Headers**: Authorization: Bearer {token} (rol client)

**Request body**

```json
{
  "product_id": "uuid",
  "quantity": 1
}
```

**Response 201**: carrito actualizado con el mismo esquema que GET /cart.

**Errores**
- 400: cantidad solicitada (existente + nueva) supera el stock disponible
- 401: no autenticado
- 403: usuario con rol admin
- 404: producto no encontrado o inactivo

---

### PUT /cart/items/{item_id}

Modifica la cantidad de un item existente en el carrito.

**Headers**: Authorization: Bearer {token} (rol client)

**Request body**

```json
{
  "quantity": 3
}
```

**Response 200**: carrito actualizado.

**Errores**
- 400: cantidad supera el stock disponible
- 401: no autenticado
- 403: el item no pertenece al carrito del usuario
- 404: item no encontrado

---

### DELETE /cart/items/{item_id}

Elimina un item del carrito.

**Headers**: Authorization: Bearer {token} (rol client)

**Response 200**: carrito actualizado.

**Errores**
- 401: no autenticado
- 403: el item no pertenece al carrito del usuario
- 404: item no encontrado

---

### DELETE /cart

Vacia completamente el carrito del usuario autenticado.

**Headers**: Authorization: Bearer {token} (rol client)

**Response 200**: carrito vacio (items: [], total: "0.00", item_count: 0).

**Errores**
- 401: no autenticado
- 403: usuario con rol admin

## Criterios de aceptacion

1. Solo los usuarios con rol cliente pueden acceder y operar el carrito.
2. No se puede agregar una cantidad que supere el stock disponible del producto.
3. No se puede agregar un producto inactivo o inexistente.
4. Si se agrega un producto ya presente en el carrito, la cantidad se acumula.
5. El total y los subtotales se calculan en el servidor, nunca en el cliente.
6. Vaciar el carrito elimina todos los items pero mantiene el registro del carrito.
7. El carrito persiste entre sesiones del mismo usuario.

## Pantallas en el frontend

### Vista del carrito

- Listado de items: imagen miniatura, nombre, precio unitario, selector de cantidad, subtotal y boton de eliminar por item.
- Total del carrito al pie.
- Boton "Vaciar carrito".
- Boton "Confirmar pedido" que inicia el flujo del modulo de pedidos.
- Mensaje informativo cuando el carrito esta vacio.
