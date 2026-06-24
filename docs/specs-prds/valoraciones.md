# Modulo: Valoraciones

## Descripcion

Permite a los clientes valorar productos del catalogo con una puntuacion del 1 al 5 estrellas y un comentario opcional. La media de valoraciones de cada producto se muestra en el catalogo y en el detalle del producto. Un cliente solo puede valorar un producto si ha completado al menos un pedido que contenga ese producto (estado delivered). Cada usuario puede valorar un producto una sola vez, pero puede editar o eliminar su valoracion.

## Modelo de datos

### Tabla: reviews

| Columna    | Tipo              | Restricciones                                        |
|------------|-------------------|------------------------------------------------------|
| id         | UUID              | PK, default uuid_generate_v4()                       |
| user_id    | UUID              | NOT NULL, FK users(id)                               |
| product_id | UUID              | NOT NULL, FK products(id)                            |
| order_id   | UUID              | FK orders(id), NULL para valoraciones sin pedido      |
| rating     | INTEGER           | NOT NULL, CHECK (rating >= 1 AND rating <= 5)        |
| comment    | TEXT              | NULL (opcional)                                      |
| created_at | TIMESTAMP WITH TZ | NOT NULL, default now()                              |
| updated_at | TIMESTAMP WITH TZ | NOT NULL, default now()                              |

Restricciones adicionales:
- UNIQUE (user_id, product_id): un usuario solo puede valorar una vez por producto.
- El campo order_id es opcional para permitir valoraciones directas (sin vincular a un pedido especifico).

Notas:
- La media de valoraciones se calcula como AVG(rating) agrupado por product_id.
- Un producto sin valoraciones no muestra estrellas en el catalogo.
- Las valoraciones se muestran ordenadas por created_at descendente (mas recientes primero).

## Endpoints

### GET /products/{product_id}/reviews

Lista las valoraciones de un producto. Acceso publico.

**Query params**
- page: int (default 1)
- size: int (default 10, maximo 50)

**Response 200**

```json
{
  "items": [
    {
      "id": "uuid",
      "user": {
        "id": "uuid",
        "full_name": "string"
      },
      "rating": 5,
      "comment": "string o null",
      "created_at": "datetime ISO 8601"
    }
  ],
  "total": 15,
  "page": 1,
  "size": 10,
  "average_rating": 4.2,
  "rating_count": 15
}
```

Notas:
- `average_rating` es la media de todas las valoraciones del producto.
- `rating_count` es el numero total de valoraciones del producto.

**Errores**
- 404: producto no encontrado

---

### POST /products/{product_id}/reviews

Crea una valoracion para un producto. Solo clientes autenticados.

**Headers**: Authorization: Bearer {token} (rol client)

**Request body**

```json
{
  "rating": "entero del 1 al 5",
  "comment": "string opcional (maximo 1000 caracteres)",
  "order_id": "uuid opcional"
}
```

**Response 201**: valoracion creada completa.

**Errores**
- 400: el usuario ya ha valorado este producto
- 400: el producto no existe o esta inactivo
- 400: el order_id no pertenece al usuario o no contiene el producto
- 401: no autenticado
- 403: usuario con rol admin
- 404: producto no encontrado

---

### GET /reviews/{review_id}

Detalle de una valoracion. Acceso publico.

**Response 200**

```json
{
  "id": "uuid",
  "user": {
    "id": "uuid",
    "full_name": "string"
  },
  "product": {
    "id": "uuid",
    "name": "string"
  },
  "rating": 5,
  "comment": "string o null",
  "created_at": "datetime ISO 8601",
  "updated_at": "datetime ISO 8601"
}
```

**Errores**
- 404: valoracion no encontrada

---

### PUT /reviews/{review_id}

Actualiza una valoracion existente. Solo el autor de la valoracion.

**Headers**: Authorization: Bearer {token} (rol client)

**Request body**

```json
{
  "rating": "entero del 1 al 5",
  "comment": "string opcional (maximo 1000 caracteres)"
}
```

**Response 200**: valoracion actualizada completa.

**Errores**
- 400: datos invalidos
- 401: no autenticado
- 403: no es el autor de la valoracion
- 404: valoracion no encontrada

---

### DELETE /reviews/{review_id}

Elimina una valoracion. Solo el autor o un administrador.

**Headers**: Authorization: Bearer {token}

**Response 204**: sin contenido.

**Errores**
- 401: no autenticado
- 403: no es el autor ni administrador
- 404: valoracion no encontrada

---

### GET /products/{product_id}/rating

Devuelve la media y el numero de valoraciones de un producto. Acceso publico.

**Response 200**

```json
{
  "average_rating": 4.2,
  "rating_count": 15,
  "rating_distribution": {
    "1": 2,
    "2": 1,
    "3": 3,
    "4": 5,
    "5": 4
  }
}
```

Notas:
- `rating_distribution` muestra el conteo de valoraciones por cada puntuacion.
- Util para mostrar un histograma de valoraciones en el frontend.

**Errores**
- 404: producto no encontrado

## Criterios de aceptacion

1. Solo los usuarios autenticados con rol cliente pueden crear, editar y eliminar valoraciones.
2. Un cliente solo puede valorar un producto si tiene al menos un pedido con ese producto en estado delivered.
3. Un cliente solo puede valorar un producto una vez.
4. La puntuacion es un entero del 1 al 5.
5. El comentario es opcional y tiene un maximo de 1000 caracteres.
6. La media de valoraciones se calcula automaticamente y se actualiza al crear, editar o eliminar una valoracion.
7. Un cliente puede editar o eliminar su propia valoracion.
8. Un administrador puede eliminar cualquier valoracion pero no puede crear valoraciones.
9. Las valoraciones se muestran ordenadas por fecha de creacion (mas recientes primero).
10. Un producto sin valoraciones no muestra estrellas en el catalogo.
11. El endpoint de detalle de producto incluye la media y el numero de valoraciones.
12. El catalogo muestra la media de valoraciones de cada producto.

## Pantallas en el frontend

### Catalogo de productos

- Cada tarjeta de producto muestra: imagen, nombre, precio, media de valoraciones (estrellas) y numero de valoraciones.
- Si no hay valoraciones, no se muestran estrellas.

### Detalle de producto

- Seccion de valoraciones: media de valoraciones, numero total de valoraciones y distribucion por puntuacion.
- Lista de valoraciones: autor, puntuacion (estrellas), comentario y fecha.
- Boton "Valorar este producto" visible solo si:
  - El usuario esta autenticado con rol cliente.
  - El usuario no ha valorado este producto aun.
  - El usuario tiene al menos un pedido con este producto en estado delivered.

### Formulario de valoracion

- Selector de estrellas (1 a 5) con efecto hover.
- Campo de comentario (textarea, opcional, maximo 1000 caracteres).
- Boton "Enviar valoracion".
- Mensaje de error si el usuario ya ha valorado el producto.

### Edicion de valoracion

- Mismo formulario que la creacion, prellenado con los datos existentes.
- Boton "Actualizar valoracion".
- Boton "Eliminar valoracion" con confirmacion.

### Gestion de valoraciones (solo administrador)

- Lista de todas las valoraciones del sistema.
- Acciones por fila: eliminar valoracion.
- Filtro por producto o por usuario.
