# Modulo: Pedidos

## Descripcion

Gestiona la creacion de pedidos a partir del carrito y el seguimiento de su estado. Los pedidos los crea el cliente a partir de su carrito; el administrador es el unico que puede cambiar el estado de un pedido, con una excepcion: el cliente puede cancelar su propio pedido si y solo si esta en estado pendiente. Al confirmar un pedido se descuenta el stock de cada producto. Al cancelar un pedido confirmado o enviado, el stock se restituye.

## Modelo de datos

### Tabla: orders

| Columna    | Tipo                        | Restricciones                                                  |
|------------|-----------------------------|----------------------------------------------------------------|
| id         | UUID                        | PK, default gen_random_uuid()                                  |
| user_id    | UUID                        | NOT NULL, FK → users.id                                        |
| status     | ENUM(ver abajo)             | NOT NULL, default 'pending'                                    |
| total      | NUMERIC(10, 2)              | NOT NULL, CHECK (total > 0)                                    |
| created_at | TIMESTAMP WITH TIME ZONE    | NOT NULL, default now()                                        |
| updated_at | TIMESTAMP WITH TIME ZONE    | NOT NULL, default now()                                        |

**Estados validos de `status`**

| Estado      | Descripcion                                             |
|-------------|---------------------------------------------------------|
| pending     | Pedido creado, pendiente de confirmacion por el admin   |
| confirmed   | Pedido confirmado por el admin; stock ya descontado     |
| shipped     | Pedido enviado al cliente                               |
| cancelled   | Pedido cancelado; stock restituido si aplica            |

**Transiciones de estado permitidas**

| Desde       | Hacia       | Quien puede hacerlo                              |
|-------------|-------------|--------------------------------------------------|
| pending     | confirmed   | Admin                                            |
| pending     | cancelled   | Admin o el propio cliente                        |
| confirmed   | shipped     | Admin                                            |
| confirmed   | cancelled   | Admin (restituye stock)                          |
| shipped     | cancelled   | Admin (restituye stock)                          |
| cancelled   | —           | Ninguno (estado terminal)                        |

---

### Tabla: order_items

| Columna    | Tipo                        | Restricciones                                    |
|------------|-----------------------------|--------------------------------------------------|
| id         | UUID                        | PK, default gen_random_uuid()                    |
| order_id   | UUID                        | NOT NULL, FK → orders.id ON DELETE CASCADE       |
| product_id | UUID                        | NOT NULL, FK → products.id                       |
| quantity   | INTEGER                     | NOT NULL, CHECK (quantity >= 1)                  |
| unit_price | NUMERIC(10, 2)              | NOT NULL, CHECK (unit_price > 0)                 |

**Nota**: `unit_price` almacena el precio en el momento de la compra, independientemente de cambios futuros en el producto.

## Endpoints

### POST /orders

Crea un pedido a partir del carrito actual del cliente. El carrito debe tener al menos un articulo. Se descuenta el stock de cada producto y se vacia el carrito en la misma transaccion.

**Headers requeridos**: `Authorization: Bearer {access_token}` (rol client)

**Request body**: ninguno (el pedido se construye desde el carrito del usuario)

**Response 201**

```json
{
  "id": "770a0600-g41d-63f6-c938-668877662222",
  "status": "pending",
  "total": "179.98",
  "items": [
    {
      "id": "880b1700-h52e-74g7-d049-779988773333",
      "product_id": "660f9500-f30c-52e5-b827-557766551111",
      "product_name": "Teclado mecanico TKL",
      "quantity": 2,
      "unit_price": "89.99",
      "subtotal": "179.98"
    }
  ],
  "created_at": "2024-06-24T12:00:00Z"
}
```

**Errores**

| Codigo | Motivo                                             |
|--------|----------------------------------------------------|
| 400    | El carrito esta vacio                              |
| 400    | Stock insuficiente para uno o mas productos        |
| 401    | Token ausente, invalido o expirado                 |
| 403    | El usuario tiene rol admin                         |

---

### GET /orders

Lista los pedidos. El cliente ve solo sus propios pedidos; el admin ve todos.

**Headers requeridos**: `Authorization: Bearer {access_token}`

**Query params**

| Param  | Tipo    | Default | Descripcion                         |
|--------|---------|---------|-------------------------------------|
| skip   | integer | 0       | Numero de registros a saltar        |
| limit  | integer | 20      | Maximo de registros a devolver      |
| status | string  | -       | Filtrar por estado                  |

**Response 200**

```json
[
  {
    "id": "770a0600-g41d-63f6-c938-668877662222",
    "status": "pending",
    "total": "179.98",
    "item_count": 1,
    "created_at": "2024-06-24T12:00:00Z"
  }
]
```

**Errores**

| Codigo | Motivo                              |
|--------|-------------------------------------|
| 401    | Token ausente, invalido o expirado  |

---

### GET /orders/{order_id}

Devuelve el detalle de un pedido con todos sus articulos. El cliente solo puede ver sus propios pedidos; el admin puede ver cualquiera.

**Headers requeridos**: `Authorization: Bearer {access_token}`

**Response 200**

```json
{
  "id": "770a0600-g41d-63f6-c938-668877662222",
  "status": "pending",
  "total": "179.98",
  "items": [
    {
      "id": "880b1700-h52e-74g7-d049-779988773333",
      "product_id": "660f9500-f30c-52e5-b827-557766551111",
      "product_name": "Teclado mecanico TKL",
      "quantity": 2,
      "unit_price": "89.99",
      "subtotal": "179.98"
    }
  ],
  "created_at": "2024-06-24T12:00:00Z",
  "updated_at": "2024-06-24T12:00:00Z"
}
```

**Errores**

| Codigo | Motivo                              |
|--------|-------------------------------------|
| 401    | Token ausente, invalido o expirado  |
| 403    | El cliente intenta ver un pedido ajeno |
| 404    | Pedido no encontrado                |

---

### PATCH /orders/{order_id}/status

Cambia el estado de un pedido. El admin puede hacer cualquier transicion valida. El cliente solo puede cancelar (pasar a `cancelled`) su propio pedido si esta en estado `pending`.

**Headers requeridos**: `Authorization: Bearer {access_token}`

**Request body**

```json
{
  "status": "confirmed"
}
```

**Response 200**

```json
{
  "id": "770a0600-g41d-63f6-c938-668877662222",
  "status": "confirmed",
  "total": "179.98",
  "updated_at": "2024-06-24T13:00:00Z"
}
```

**Logica de stock en el backend**

- `pending → confirmed`: no se descuenta stock adicional (ya se descontó al crear el pedido).
- `confirmed → cancelled` o `shipped → cancelled`: se restituye el stock de cada `order_item`.
- `pending → cancelled` (por el cliente): no hay stock que restituir porque no se habia descontado al pasar de pending a confirmed; sin embargo, el stock ya fue descontado en `POST /orders`, por lo que si se cancela en `pending` tambien se restituye.

**Errores**

| Codigo | Motivo                                                  |
|--------|---------------------------------------------------------|
| 400    | Transicion de estado no permitida                       |
| 401    | Token ausente, invalido o expirado                      |
| 403    | El cliente intenta cambiar estado a algo distinto de cancelar su propio pedido pendiente |
| 404    | Pedido no encontrado                                    |
| 422    | Estado invalido                                         |

## Criterios de aceptacion

- Un cliente puede crear un pedido solo si tiene articulos en el carrito.
- Al crear el pedido: el stock de cada producto se descuenta, el carrito se vacia y el pedido queda en estado `pending`.
- Si al crear el pedido el stock de algun producto es insuficiente, la operacion falla completamente (rollback).
- Un cliente puede cancelar su propio pedido solo si esta en estado `pending`.
- El admin puede cambiar el estado siguiendo las transiciones validas definidas.
- Al cancelar un pedido en estado `confirmed` o `shipped`, el stock de cada articulo se restituye.
- El precio unitario almacenado en `order_items` no cambia si el precio del producto cambia despues.
- Un cliente no puede ver ni modificar pedidos de otro cliente.

## Pantallas en el frontend

### /orders — Historial de pedidos (cliente)

- Listado de pedidos del cliente con: numero de pedido (truncado), estado, total, fecha de creacion.
- Indicador visual de estado con colores distintos por estado (pending, confirmed, shipped, cancelled).
- Boton "Cancelar" visible solo para pedidos en estado `pending`.
- Enlace al detalle de cada pedido.
- Solo accesible para clientes autenticados.

### /orders/{id} — Detalle de pedido (cliente)

- Informacion completa: estado, fecha, total.
- Tabla de articulos con: nombre, precio unitario, cantidad, subtotal.
- Boton "Cancelar pedido" si el estado es `pending`.
- Enlace de regreso al historial.

### /admin/orders — Gestion de pedidos (admin)

- Tabla de todos los pedidos con: cliente, estado, total, fecha.
- Filtro por estado.
- Enlace al detalle de cada pedido.
- Solo accesible para usuarios con rol admin.

### /admin/orders/{id} — Detalle y gestion de pedido (admin)

- Misma informacion que la vista de cliente mas el email del cliente.
- Selector o botones para cambiar el estado (solo transiciones validas disponibles).
- Confirmacion antes de aplicar el cambio de estado.
