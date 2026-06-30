# Modulo: Pedidos

## Descripcion

Gestiona la creacion y el ciclo de vida de los pedidos. Un pedido se crea a partir del carrito del cliente: se descuenta el stock de cada producto, se vacia el carrito y el pedido queda en estado pendiente. Solo el administrador puede cambiar el estado de un pedido, con una excepcion: el cliente puede cancelar su propio pedido si esta en estado pendiente. Al cancelar un pedido (en cualquier estado en que el stock ya fue descontado) el stock de los productos involucrados se restituye.

## Modelo de datos

### Tabla: pedidos

| Columna      | Tipo      | Restricciones                       |
|--------------|-----------|-------------------------------------|
| id           | INTEGER   | PRIMARY KEY, AUTOINCREMENT          |
| usuario_id   | INTEGER   | NOT NULL, FK -> usuarios.id         |
| estado       | ENUM      | NOT NULL, DEFAULT 'pendiente'       |
| created_at   | TIMESTAMP | NOT NULL, DEFAULT now()             |
| updated_at   | TIMESTAMP | NOT NULL, DEFAULT now()             |

Valores del enum estado: pendiente, confirmado, enviado, cancelado

### Tabla: items_pedido

| Columna          | Tipo           | Restricciones                                    |
|------------------|----------------|--------------------------------------------------|
| id               | INTEGER        | PRIMARY KEY, AUTOINCREMENT                       |
| pedido_id        | INTEGER        | NOT NULL, FK -> pedidos.id, ON DELETE CASCADE    |
| producto_id      | INTEGER        | NOT NULL, FK -> productos.id                     |
| cantidad         | INTEGER        | NOT NULL, CHECK (cantidad > 0)                   |
| precio_unitario  | NUMERIC(10, 2) | NOT NULL                                         |

El campo `precio_unitario` registra el precio del producto en el momento de la creacion del pedido, independientemente de futuros cambios en el catalogo.

## Endpoints

### POST /orders/

Crea un pedido a partir del carrito del usuario autenticado. Solo clientes.

**Headers:** Authorization: Bearer {token}

**Response 201:**
```json
{
  "id": 1,
  "usuario_id": 2,
  "estado": "pendiente",
  "items": [
    {
      "producto_id": 1,
      "nombre": "string",
      "cantidad": 2,
      "precio_unitario": "29.99",
      "subtotal": "59.98"
    }
  ],
  "total": "59.98",
  "created_at": "2024-01-01T00:00:00"
}
```

**Errores:**
- 400 Bad Request: el carrito esta vacio
- 400 Bad Request: stock insuficiente para alguno de los productos en el momento de confirmar
- 401 Unauthorized

---

### GET /orders/

Lista pedidos. El administrador ve todos los pedidos del sistema; el cliente ve solo los suyos.

**Headers:** Authorization: Bearer {token}

**Response 200:**
```json
[
  {
    "id": 1,
    "usuario_id": 2,
    "estado": "pendiente",
    "total": "59.98",
    "created_at": "2024-01-01T00:00:00"
  }
]
```

**Errores:**
- 401 Unauthorized

---

### GET /orders/{id}

Devuelve el detalle de un pedido. El cliente solo puede ver sus propios pedidos; el administrador puede ver cualquiera.

**Headers:** Authorization: Bearer {token}

**Response 200:** mismo esquema que POST /orders/ response

**Errores:**
- 401 Unauthorized
- 403 Forbidden: el cliente intenta ver un pedido que no es suyo
- 404 Not Found

---

### PATCH /orders/{id}/status

Cambia el estado de un pedido. Solo administradores.

**Headers:** Authorization: Bearer {token}

**Request body:**
```json
{
  "estado": "confirmado"
}
```

Valores permitidos para estado: confirmado, enviado, cancelado

**Response 200:** mismo esquema que GET /orders/{id}

**Logica de stock al cancelar:**
Si el nuevo estado es cancelado y el pedido estaba en estado pendiente, confirmado o enviado, se restituye el stock de cada producto involucrado.

**Errores:**
- 400 Bad Request: transicion de estado no permitida (ej. revertir un pedido ya cancelado)
- 401 Unauthorized
- 403 Forbidden
- 404 Not Found

---

### PATCH /orders/{id}/cancel

El cliente cancela su propio pedido. Solo posible si el pedido esta en estado pendiente.

**Headers:** Authorization: Bearer {token}

Al cancelar, se restituye el stock de todos los productos del pedido.

**Response 200:** mismo esquema que GET /orders/{id} con estado "cancelado"

**Errores:**
- 400 Bad Request: el pedido no esta en estado pendiente
- 401 Unauthorized
- 403 Forbidden: el pedido no pertenece al cliente autenticado
- 404 Not Found

## Criterios de aceptacion

- Solo los clientes pueden crear pedidos.
- No se puede crear un pedido con el carrito vacio.
- Al crear un pedido se descuenta el stock de cada producto y se vacia el carrito.
- El pedido recien creado tiene estado pendiente.
- Los items del pedido registran el precio unitario en el momento de la creacion.
- Al cancelar un pedido (por el cliente o por el administrador), se restituye el stock de los productos involucrados.
- Solo el administrador puede cambiar el estado a confirmado, enviado o cancelado.
- El cliente solo puede cancelar sus propios pedidos y solo cuando estan en estado pendiente.
- El administrador ve todos los pedidos; el cliente solo ve los suyos.

## Pantallas en el frontend

- **Historial de pedidos (cliente):** lista de pedidos con id, fecha, estado y total. Boton "Cancelar" visible y activo solo si el pedido esta en estado pendiente.
- **Detalle de pedido:** lista de productos con cantidades, precios unitarios, subtotales y total del pedido.
- **Panel de administrador - Pedidos:** tabla con todos los pedidos del sistema, email del cliente, fecha, estado. Selector de estado para cambiar el estado de cada pedido directamente desde la tabla.
