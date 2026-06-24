# Modulo: Carrito

## Descripcion

Gestiona el carrito de compras de cada cliente autenticado. El administrador no tiene carrito. Las operaciones incluyen agregar articulos, modificar cantidades, eliminar articulos individuales y vaciar el carrito completo. No se puede agregar mas cantidad de un producto que el stock disponible en ese momento.

## Modelo de datos

### Tabla: cart_items

| Columna    | Tipo                        | Restricciones                                                  |
|------------|-----------------------------|----------------------------------------------------------------|
| id         | UUID                        | PK, default gen_random_uuid()                                  |
| user_id    | UUID                        | NOT NULL, FK → users.id ON DELETE CASCADE                      |
| product_id | UUID                        | NOT NULL, FK → products.id ON DELETE CASCADE                   |
| quantity   | INTEGER                     | NOT NULL, CHECK (quantity >= 1)                                |
| created_at | TIMESTAMP WITH TIME ZONE    | NOT NULL, default now()                                        |
| updated_at | TIMESTAMP WITH TIME ZONE    | NOT NULL, default now()                                        |

**Restriccion unica**: UNIQUE (user_id, product_id) — cada producto aparece como maximo una vez por carrito.

## Endpoints

Todos los endpoints de este modulo requieren autenticacion con rol cliente.

---

### GET /cart

Devuelve el contenido actual del carrito del usuario autenticado.

**Headers requeridos**: `Authorization: Bearer {access_token}` (rol client)

**Response 200**

```json
{
  "items": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "product": {
        "id": "660f9500-f30c-52e5-b827-557766551111",
        "name": "Teclado mecanico TKL",
        "price": "89.99",
        "stock": 15,
        "image_url": "https://picsum.photos/seed/quickshop-1/400/300",
        "is_active": true
      },
      "quantity": 2,
      "subtotal": "179.98"
    }
  ],
  "total": "179.98",
  "item_count": 1
}
```

**Errores**

| Codigo | Motivo                              |
|--------|-------------------------------------|
| 401    | Token ausente, invalido o expirado  |
| 403    | El usuario tiene rol admin          |

---

### POST /cart/items

Agrega un producto al carrito. Si el producto ya existe en el carrito, incrementa la cantidad. La cantidad total no puede superar el stock disponible.

**Headers requeridos**: `Authorization: Bearer {access_token}` (rol client)

**Request body**

```json
{
  "product_id": "660f9500-f30c-52e5-b827-557766551111",
  "quantity": 2
}
```

**Response 201**

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "product": {
    "id": "660f9500-f30c-52e5-b827-557766551111",
    "name": "Teclado mecanico TKL",
    "price": "89.99",
    "stock": 15,
    "image_url": "https://picsum.photos/seed/quickshop-1/400/300",
    "is_active": true
  },
  "quantity": 2,
  "subtotal": "179.98"
}
```

**Errores**

| Codigo | Motivo                                                      |
|--------|-------------------------------------------------------------|
| 400    | Cantidad solicitada supera el stock disponible              |
| 400    | El producto no esta activo                                  |
| 401    | Token ausente, invalido o expirado                          |
| 403    | El usuario tiene rol admin                                  |
| 404    | Producto no encontrado                                      |
| 422    | Datos invalidos (quantity < 1)                              |

---

### PUT /cart/items/{item_id}

Actualiza la cantidad de un articulo del carrito. La nueva cantidad no puede superar el stock disponible ni ser menor que 1.

**Headers requeridos**: `Authorization: Bearer {access_token}` (rol client)

**Request body**

```json
{
  "quantity": 3
}
```

**Response 200**

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "product": {
    "id": "660f9500-f30c-52e5-b827-557766551111",
    "name": "Teclado mecanico TKL",
    "price": "89.99",
    "stock": 15,
    "image_url": "https://picsum.photos/seed/quickshop-1/400/300",
    "is_active": true
  },
  "quantity": 3,
  "subtotal": "269.97"
}
```

**Errores**

| Codigo | Motivo                                         |
|--------|------------------------------------------------|
| 400    | Cantidad solicitada supera el stock disponible |
| 401    | Token ausente, invalido o expirado             |
| 403    | El usuario tiene rol admin o no es el dueno    |
| 404    | Articulo de carrito no encontrado              |
| 422    | Datos invalidos (quantity < 1)                 |

---

### DELETE /cart/items/{item_id}

Elimina un articulo especifico del carrito del usuario autenticado.

**Headers requeridos**: `Authorization: Bearer {access_token}` (rol client)

**Response 200**

```json
{
  "message": "Articulo eliminado del carrito"
}
```

**Errores**

| Codigo | Motivo                                         |
|--------|------------------------------------------------|
| 401    | Token ausente, invalido o expirado             |
| 403    | El usuario tiene rol admin o no es el dueno    |
| 404    | Articulo de carrito no encontrado              |

---

### DELETE /cart

Vacia el carrito completo del usuario autenticado.

**Headers requeridos**: `Authorization: Bearer {access_token}` (rol client)

**Response 200**

```json
{
  "message": "Carrito vaciado correctamente"
}
```

**Errores**

| Codigo | Motivo                              |
|--------|-------------------------------------|
| 401    | Token ausente, invalido o expirado  |
| 403    | El usuario tiene rol admin          |

## Criterios de aceptacion

- Un cliente puede agregar cualquier producto activo con stock > 0 al carrito.
- Si el producto ya esta en el carrito, `POST /cart/items` incrementa la cantidad en lugar de duplicar el articulo.
- No es posible agregar mas unidades de un producto que el stock disponible (validacion en backend).
- Un cliente puede modificar la cantidad de cualquier articulo propio (minimo 1, maximo stock).
- Un cliente puede eliminar articulos individuales o vaciar el carrito completo.
- El total del carrito refleja la suma de (precio x cantidad) de todos los articulos.
- El administrador no puede operar el carrito; recibe 403 en todos los endpoints.
- Al crear un pedido (modulo Pedidos), el carrito se vacia automaticamente.

## Pantallas en el frontend

### /cart — Carrito de compras (cliente)

- Listado de articulos con: imagen, nombre, precio unitario, selector de cantidad, subtotal y boton de eliminar.
- Total calculado en tiempo real.
- Boton "Vaciar carrito" con confirmacion.
- Boton "Confirmar pedido" que navega al flujo de creacion de pedido.
- Mensaje de carrito vacio con enlace al catalogo si no hay articulos.
- Solo accesible para clientes autenticados; redireccion a /login si no autenticado.

**Indicador de carrito en la cabecera**

- Icono con el numero de articulos del carrito actualizado en tiempo real.
- Solo visible para clientes autenticados.
