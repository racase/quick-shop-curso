# Modulo: Pedidos

## Descripcion

Gestiona el ciclo de vida de los pedidos: creacion a partir del carrito, actualizacion de estado por el administrador y cancelacion por el cliente. Incluye la logica de descuento y restitucion de stock.

## Modelo de datos

### Tabla: orders

| Columna    | Tipo              | Restricciones                              |
|------------|-------------------|--------------------------------------------|
| id         | UUID              | PK, default uuid_generate_v4()            |
| user_id    | UUID              | NOT NULL, FK users(id)                     |
| status     | ENUM(OrderStatus) | NOT NULL, default 'pending'               |
| total      | NUMERIC(10, 2)    | NOT NULL                                   |
| created_at | TIMESTAMP WITH TZ | NOT NULL, default now()                    |
| updated_at | TIMESTAMP WITH TZ | NOT NULL, default now()                    |

Estados validos (OrderStatus): pending, confirmed, shipped, delivered, cancelled

### Tabla: order_items

| Columna    | Tipo           | Restricciones                               |
|------------|----------------|---------------------------------------------|
| id         | UUID           | PK, default uuid_generate_v4()             |
| order_id   | UUID           | NOT NULL, FK orders(id) ON DELETE CASCADE  |
| product_id | UUID           | NOT NULL, FK products(id)                  |
| quantity   | INTEGER        | NOT NULL, CHECK (quantity > 0)             |
| unit_price | NUMERIC(10, 2) | NOT NULL                                    |

Nota: unit_price es el precio en el momento de la compra. Es inmutable aunque el producto cambie de precio despues.

## Logica de stock

- Al crear el pedido desde el carrito: se descuenta el stock de cada producto (stock -= quantity). Si algun producto no tiene suficiente stock, el pedido no se crea y se devuelve error.
- Al cancelar un pedido en cualquier estado excepto delivered: se restituye el stock (stock += quantity).
- Al crear el pedido se vacia el carrito del cliente.

## Transiciones de estado validas

```
pending    -> confirmed   (solo admin)
pending    -> cancelled   (cliente propietario o admin)
confirmed  -> shipped     (solo admin)
confirmed  -> cancelled   (solo admin, restituye stock)
shipped    -> delivered   (solo admin)
shipped    -> cancelled   (solo admin, restituye stock)
delivered  -> (estado final, no se puede modificar)
cancelled  -> (estado final, no se puede modificar)
```

## Endpoints

### POST /orders

Crea un pedido a partir del carrito actual. Descuenta el stock y vacia el carrito.

**Headers**: Authorization: Bearer {token} (rol client)

**Response 201**

```json
{
  "id": "uuid",
  "status": "pending",
  "total": "89.97",
  "items": [
    {
      "product_id": "uuid",
      "product_name": "string",
      "quantity": 2,
      "unit_price": "29.99",
      "subtotal": "59.98"
    }
  ],
  "created_at": "datetime ISO 8601"
}
```

**Errores**
- 400: carrito vacio o stock insuficiente para algun producto
- 401: no autenticado
- 403: usuario con rol admin

---

### GET /orders

Lista los pedidos del usuario autenticado. Si el usuario es administrador, lista todos los pedidos del sistema.

**Headers**: Authorization: Bearer {token}

**Query params**
- page: int (default 1)
- size: int (default 20, maximo 100)
- status: string (opcional, filtra por estado)

**Response 200**

```json
{
  "items": [ ... ],
  "total": 5,
  "page": 1,
  "size": 20
}
```

---

### GET /orders/{order_id}

Detalle de un pedido. El cliente solo puede ver sus propios pedidos.

**Headers**: Authorization: Bearer {token}

**Response 200**: mismo esquema que POST /orders.

**Errores**
- 401: no autenticado
- 403: no es el propietario ni administrador
- 404: pedido no encontrado

---

### PATCH /orders/{order_id}/status

Cambia el estado de un pedido siguiendo las transiciones validas. Solo administrador.

**Headers**: Authorization: Bearer {token} (rol admin)

**Request body**

```json
{
  "status": "confirmed | shipped | delivered | cancelled"
}
```

**Response 200**: pedido actualizado completo.

**Errores**
- 400: transicion de estado no valida
- 401: no autenticado
- 403: no es administrador
- 404: pedido no encontrado

---

### DELETE /orders/{order_id}

Cancela un pedido propio que esta en estado pending. Solo el cliente propietario.

**Headers**: Authorization: Bearer {token} (rol client)

**Response 200**: pedido con status cancelled.

**Errores**
- 400: el pedido no esta en estado pending
- 401: no autenticado
- 403: no es el propietario
- 404: pedido no encontrado

## Criterios de aceptacion

1. Solo un cliente puede crear pedidos, y unicamente a partir de su carrito.
2. Al crear el pedido se descuenta el stock; si hay stock insuficiente el pedido no se crea.
3. Al crear el pedido se vacia el carrito del cliente.
4. El cliente puede cancelar su propio pedido solo si esta en estado pending.
5. El administrador puede cambiar el estado de cualquier pedido siguiendo las transiciones validas.
6. Al cancelar un pedido (en cualquier estado salvo delivered) se restituye el stock de todos sus items.
7. El precio unitario en order_items no cambia si el producto se edita despues de la compra.
8. El cliente puede ver su historial completo de pedidos con sus estados actualizados.

## Pantallas en el frontend

### Historial de pedidos (cliente)

- Lista de pedidos: fecha, total, numero de items y estado con color diferenciado por estado.
- Boton "Cancelar" visible solo si el estado es pending.
- Enlace al detalle de cada pedido.

### Detalle de pedido

- Lista de items: imagen miniatura, nombre, cantidad, precio unitario y subtotal.
- Estado actual del pedido.
- Total del pedido.

### Gestion de pedidos (solo administrador)

- Tabla con todos los pedidos: fecha, cliente, total, estado.
- Filtro por estado.
- Selector de nuevo estado que muestra unicamente las transiciones validas desde el estado actual.
