# Modulo: Valoraciones

## Descripcion

Permite a los usuarios con rol cliente puntuar productos del catalogo de 1 a 5 estrellas. Cada cliente puede valorar un producto una sola vez; si ya ha valorado un producto, puede actualizar su valoracion. La media de valoraciones de cada producto se muestra en el catalogo y en el detalle del producto. Las valoraciones de productos inactivos no se muestran.

## Modelo de datos

### Tabla: valoraciones

| Columna      | Tipo      | Restricciones                                    |
|--------------|-----------|--------------------------------------------------|
| id           | INTEGER   | PRIMARY KEY, AUTOINCREMENT                       |
| usuario_id   | INTEGER   | NOT NULL, FK -> usuarios.id, ON DELETE CASCADE   |
| producto_id  | INTEGER   | NOT NULL, FK -> productos.id, ON DELETE CASCADE  |
| puntuacion   | INTEGER   | NOT NULL, CHECK (puntuacion >= 1 AND puntuacion <= 5) |
| created_at   | TIMESTAMP | NOT NULL, DEFAULT now()                          |
| updated_at   | TIMESTAMP | NOT NULL, DEFAULT now()                          |

Indice unico en (usuario_id, producto_id) para que un solo cliente pueda valorar un producto una vez.

## Endpoints

### GET /products/{id}/reviews

Lista las valoraciones de un producto. Accesible sin autenticacion. Solo muestra valoraciones de productos activos.

**Query params opcionales:**
- `skip`: integer, default 0
- `limit`: integer, default 50

**Response 200:**
```json
{
  "producto_id": 1,
  "media_puntuacion": 4.5,
  "total_valoraciones": 12,
  "valoraciones": [
    {
      "id": 1,
      "usuario_id": 2,
      "puntuacion": 5,
      "created_at": "2024-01-01T00:00:00",
      "updated_at": "2024-01-01T00:00:00"
    }
  ]
}
```

**Errores:**
- 404 Not Found: producto no encontrado o inactivo

---

### POST /products/{id}/reviews

Crea una valoracion para un producto. Solo clientes autenticados. Un cliente solo puede valorar un producto una vez.

**Headers:** Authorization: Bearer {token}

**Request body:**
```json
{
  "puntuacion": 4
}
```

**Response 201:**
```json
{
  "id": 1,
  "usuario_id": 2,
  "producto_id": 1,
  "puntuacion": 4,
  "created_at": "2024-01-01T00:00:00",
  "updated_at": "2024-01-01T00:00:00"
}
```

**Errores:**
- 401 Unauthorized: token ausente o invalido
- 403 Forbidden: el usuario es administrador
- 404 Not Found: producto no encontrado o inactivo
- 409 Conflict: el cliente ya ha valorado este producto (usar PUT para actualizar)
- 422 Unprocessable Entity: puntuacion fuera de rango (1-5)

---

### PUT /products/{id}/reviews

Actualiza la valoracion existente del cliente autenticado para un producto. Si no existe, crea una nueva valoracion.

**Headers:** Authorization: Bearer {token}

**Request body:**
```json
{
  "puntuacion": 2
}
```

**Response 200:**
```json
{
  "id": 1,
  "usuario_id": 2,
  "producto_id": 1,
  "puntuacion": 2,
  "created_at": "2024-01-01T00:00:00",
  "updated_at": "2024-01-01T00:00:00"
}
```

**Errores:**
- 401 Unauthorized
- 403 Forbidden: el usuario es administrador
- 404 Not Found: producto no encontrado o inactivo
- 422 Unprocessable Entity: puntuacion fuera de rango (1-5)

---

### DELETE /products/{id}/reviews

Elimina la valoracion del cliente autenticado para un producto.

**Headers:** Authorization: Bearer {token}

**Response 200:**
```json
{
  "detail": "Valoracion eliminada correctamente"
}
```

**Errores:**
- 401 Unauthorized
- 403 Forbidden: el usuario es administrador
- 404 Not Found: el cliente no tiene valoracion para este producto

---

### GET /products/

El listado de productos incluye los campos adicionales `media_puntuacion` y `total_valoraciones` en cada producto.

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
    "is_active": true,
    "media_puntuacion": 4.5,
    "total_valoraciones": 12
  }
]
```

---

### GET /products/{id}

El detalle de un producto incluye los campos adicionales `media_puntuacion` y `total_valoraciones`.

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
  "media_puntuacion": 4.5,
  "total_valoraciones": 12,
  "created_at": "2024-01-01T00:00:00",
  "updated_at": "2024-01-01T00:00:00"
}
```

## Criterios de aceptacion

- Solo los usuarios con rol cliente pueden crear, actualizar o eliminar valoraciones.
- Un cliente solo puede valorar un producto una vez; si intenta valorar de nuevo, recibe un 409 Conflict y debe usar PUT para actualizar.
- La puntuacion debe ser un entero entre 1 y 5 (inclusive).
- Un cliente puede actualizar su valoracion existente para un producto.
- Un cliente puede eliminar su valoracion para un producto.
- La media de puntuacion se calcula como promedio de todas las valoraciones del producto.
- El campo `media_puntuacion` se redondea a un decimal.
- El campo `total_valoraciones` indica el numero total de valoraciones del producto.
- Las valoraciones de productos inactivos no se muestran en los endpoints de listings.
- El listado de productos (GET /products/) y el detalle (GET /products/{id}) incluyen `media_puntuacion` y `total_valoraciones`.
- Al eliminar una valoracion, la media se recalcula automaticamente.

## Pantallas en el frontend

- **Catalogo:** cada tarjeta de producto muestra estrellas de valoracion (iconos de estrella llenas/vacias) con la media numerica y el total de valoraciones junto al nombre del producto.
- **Detalle de producto:** seccion de valoraciones debajo de la informacion del producto. Muestra la media general, el total de valoraciones y la lista de valoraciones individuales (puntuacion con estrellas y fecha). Si el usuario esta autenticado como cliente y no ha valorado el producto, muestra un formulario para crear una valoracion (selector de estrellas). Si ya ha valorado, muestra su valoracion con opcion de editar o eliminar.
- **Indicador en el header:** no se modifica para este modulo.
