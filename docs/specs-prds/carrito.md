# Modulo: Carrito

## Descripcion

Permite a los usuarios con rol cliente gestionar su carrito de compra. El administrador no dispone de carrito. No se puede agregar una cantidad superior al stock disponible del producto. El carrito persiste en base de datos asociado al usuario autenticado.

## Modelo de datos

### Tabla: items_carrito

| Columna      | Tipo      | Restricciones                                   |
|--------------|-----------|-------------------------------------------------|
| id           | INTEGER   | PRIMARY KEY, AUTOINCREMENT                      |
| usuario_id   | INTEGER   | NOT NULL, FK -> usuarios.id, ON DELETE CASCADE  |
| producto_id  | INTEGER   | NOT NULL, FK -> productos.id, ON DELETE CASCADE |
| cantidad     | INTEGER   | NOT NULL, CHECK (cantidad > 0)                  |
| created_at   | TIMESTAMP | NOT NULL, DEFAULT now()                         |

Indice unico en (usuario_id, producto_id) para evitar lineas duplicadas del mismo producto.

## Endpoints

Todos los endpoints requieren autenticacion con rol cliente.

**Headers comunes:** Authorization: Bearer {token}

---

### GET /cart/

Devuelve el carrito del usuario autenticado con subtotales y total.

**Response 200:**
```json
{
  "items": [
    {
      "producto_id": 1,
      "nombre": "string",
      "precio": "29.99",
      "stock": 10,
      "imagen_url": "string",
      "cantidad": 2,
      "subtotal": "59.98"
    }
  ],
  "total": "59.98"
}
```

---

### POST /cart/items

Agrega un producto al carrito. Si el producto ya existe en el carrito, incrementa la cantidad; no crea un item duplicado.

**Request body:**
```json
{
  "producto_id": 1,
  "cantidad": 2
}
```

**Response 201:**
```json
{
  "producto_id": 1,
  "cantidad": 2
}
```

**Errores:**
- 400 Bad Request: cantidad solicitada + cantidad actual en carrito excede el stock disponible
- 404 Not Found: producto no encontrado o inactivo
- 422 Unprocessable Entity: cantidad < 1

---

### PUT /cart/items/{producto_id}

Actualiza la cantidad de un producto ya existente en el carrito.

**Request body:**
```json
{
  "cantidad": 3
}
```

**Response 200:**
```json
{
  "producto_id": 1,
  "cantidad": 3
}
```

**Errores:**
- 400 Bad Request: cantidad > stock disponible del producto
- 404 Not Found: el producto no esta en el carrito del usuario
- 422 Unprocessable Entity: cantidad < 1

---

### DELETE /cart/items/{producto_id}

Elimina un producto del carrito.

**Response 200:**
```json
{
  "detail": "Item eliminado del carrito"
}
```

**Errores:**
- 404 Not Found: el producto no esta en el carrito del usuario

---

### DELETE /cart/

Vacia completamente el carrito del usuario autenticado.

**Response 200:**
```json
{
  "detail": "Carrito vaciado"
}
```

## Criterios de aceptacion

- Solo los usuarios con rol cliente tienen acceso a los endpoints del carrito.
- No se puede agregar mas cantidad que el stock disponible del producto.
- No se puede agregar al carrito un producto inactivo.
- Si el producto ya existe en el carrito, el endpoint POST incrementa la cantidad; no genera un item duplicado.
- La cantidad minima por item es 1; usar el endpoint DELETE para eliminar el item del carrito.
- El carrito devuelve subtotales por item y el total calculado.

## Pantallas en el frontend

- **Carrito (pagina o panel lateral):** lista de items con imagen, nombre, precio unitario, selector de cantidad y boton de eliminar. Total al pie. Boton "Finalizar compra" que inicia la creacion del pedido. Boton "Vaciar carrito".
- **Indicador en el header:** icono de carrito con el numero de items actual. Solo visible para clientes autenticados.
- Al agregar un producto desde el catalogo, el indicador del header se actualiza sin recargar la pagina.
