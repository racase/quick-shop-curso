## MODIFIED Requirements

### Requirement: Catálogo público de productos activos
El sistema SHALL exponer GET /api/v1/products/ sin autenticación, devolviendo todos los productos con is_active=true. SHALL soportar parámetros opcionales skip (default 0) y limit (default 100). Cada producto SHALL incluir los campos media_puntuacion (decimal con 1 decimal) y total_valoraciones (entero) calculados a partir de la tabla de valoraciones.

#### Scenario: Listado público sin autenticación
- **WHEN** cualquier visitante envía GET /api/v1/products/ sin token
- **THEN** el sistema devuelve 200 con array de productos activos (id, nombre, descripcion, precio, stock, imagen_url, is_active, media_puntuacion, total_valoraciones)

#### Scenario: Productos inactivos no aparecen en el listado
- **WHEN** existe un producto con is_active=false
- **THEN** ese producto NO aparece en la respuesta de GET /api/v1/products/

#### Scenario: Producto sin valoraciones muestra ceros
- **WHEN** un producto activo no tiene valoraciones en la tabla valoraciones
- **THEN** media_puntuacion=0 y total_valoraciones=0 en la respuesta

### Requirement: Detalle de producto individual
El sistema SHALL exponer GET /api/v1/products/{id} sin autenticación. SHALL devolver 404 si el producto no existe. SHALL incluir los campos media_puntuacion (decimal con 1 decimal) y total_valoraciones (entero) calculados a partir de la tabla de valoraciones.

#### Scenario: Detalle de producto existente
- **WHEN** se envía GET /api/v1/products/{id} con un id válido
- **THEN** el sistema devuelve 200 con todos los campos del producto incluyendo created_at, updated_at, media_puntuacion y total_valoraciones

#### Scenario: Producto no encontrado
- **WHEN** se envía GET /api/v1/products/{id} con un id inexistente
- **THEN** el sistema devuelve 404 Not Found

#### Scenario: Producto sin valoraciones muestra ceros
- **WHEN** se envía GET /api/v1/products/{id} para un producto sin valoraciones
- **THEN** media_puntuacion=0 y total_valoraciones=0 en la respuesta
