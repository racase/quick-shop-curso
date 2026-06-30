## ADDED Requirements

### Requirement: Listado de valoraciones de un producto
El sistema SHALL exponer GET /api/v1/products/{id}/reviews sin autenticación, devolviendo todas las valoraciones del producto, la media de puntuación y el total de valoraciones. SHALL soportar parámetros opcionales skip (default 0) y limit (default 50). SHALL devolver 404 si el producto no existe o está inactivo.

#### Scenario: Listado público de valoraciones
- **WHEN** cualquier visitante envía GET /api/v1/products/{id}/reviews con un id de producto válido
- **THEN** el sistema devuelve 200 con objeto conteniendo producto_id, media_puntuacion, total_valoraciones y array de valoraciones (id, usuario_id, puntuacion, created_at, updated_at)

#### Scenario: Producto no encontrado
- **WHEN** se envía GET /api/v1/products/{id}/reviews con un id de producto inexistente
- **THEN** el sistema devuelve 404 Not Found

#### Scenario: Producto inactivo
- **WHEN** se envía GET /api/v1/products/{id}/reviews para un producto con is_active=false
- **THEN** el sistema devuelve 404 Not Found

#### Scenario: Producto sin valoraciones
- **WHEN** se envía GET /api/v1/products/{id}/reviews para un producto válido sin valoraciones
- **THEN** el sistema devuelve 200 con media_puntuacion=0, total_valoraciones=0 y array vacío

### Requirement: Crear valoración
El sistema SHALL permitir a los usuarios con rol cliente crear una valoración para un producto mediante POST /api/v1/products/{id}/reviews. La puntuación SHALL ser un entero entre 1 y 5. Un cliente solo puede valorar un producto una vez. SHALL devolver 201.

#### Scenario: Creación exitosa
- **WHEN** un cliente envía POST /api/v1/products/{id}/reviews con puntuación válida (1-5)
- **THEN** el sistema crea la valoración con usuario_id del token y devuelve 201 con todos los campos

#### Scenario: Cliente no autenticado
- **WHEN** se envía POST /api/v1/products/{id}/reviews sin token
- **THEN** el sistema devuelve 401 Unauthorized

#### Scenario: Administrador intenta crear valoración
- **WHEN** un usuario con rol administrador envía POST /api/v1/products/{id}/reviews
- **THEN** el sistema devuelve 403 Forbidden

#### Scenario: Producto no encontrado
- **WHEN** un cliente envía POST /api/v1/products/{id}/reviews con un id de producto inexistente
- **THEN** el sistema devuelve 404 Not Found

#### Scenario: Producto inactivo
- **WHEN** un cliente envía POST /api/v1/products/{id}/reviews para un producto con is_active=false
- **THEN** el sistema devuelve 404 Not Found

#### Scenario: Cliente ya valoró el producto
- **WHEN** un cliente envía POST /api/v1/products/{id}/reviews y ya existe una valoración del mismo cliente para ese producto
- **THEN** el sistema devuelve 409 Conflict

#### Scenario: Puntuación fuera de rango
- **WHEN** un cliente envía POST /api/v1/products/{id}/reviews con puntuación < 1 o > 5
- **THEN** el sistema devuelve 422 Unprocessable Entity

### Requirement: Actualizar valoración
El sistema SHALL permitir a los usuarios con rol cliente actualizar su valoración existente para un producto mediante PUT /api/v1/products/{id}/reviews. Si el cliente no tiene valoración para ese producto, SHALL crear una nueva (upsert). La puntuación SHALL ser un entero entre 1 y 5.

#### Scenario: Actualización exitosa
- **WHEN** un cliente envía PUT /api/v1/products/{id}/reviews con puntuación válida y ya tiene una valoración para ese producto
- **THEN** el sistema actualiza la puntuación, actualiza updated_at y devuelve 200 con la valoración actualizada

#### Scenario: Creación por upsert
- **WHEN** un cliente envía PUT /api/v1/products/{id}/reviews con puntuación válida y no tiene valoración para ese producto
- **THEN** el sistema crea una nueva valoración y devuelve 201 con todos los campos

#### Scenario: Cliente no autenticado
- **WHEN** se envía PUT /api/v1/products/{id}/reviews sin token
- **THEN** el sistema devuelve 401 Unauthorized

#### Scenario: Administrador intenta actualizar valoración
- **WHEN** un usuario con rol administrador envía PUT /api/v1/products/{id}/reviews
- **THEN** el sistema devuelve 403 Forbidden

#### Scenario: Producto no encontrado
- **WHEN** un cliente envía PUT /api/v1/products/{id}/reviews con un id de producto inexistente
- **THEN** el sistema devuelve 404 Not Found

#### Scenario: Puntuación fuera de rango
- **WHEN** un cliente envía PUT /api/v1/products/{id}/reviews con puntuación < 1 o > 5
- **THEN** el sistema devuelve 422 Unprocessable Entity

### Requirement: Eliminar valoración
El sistema SHALL permitir a los usuarios conrol cliente eliminar su valoración para un producto mediante DELETE /api/v1/products/{id}/reviews.

#### Scenario: Eliminación exitosa
- **WHEN** un cliente envía DELETE /api/v1/products/{id}/reviews y tiene una valoración para ese producto
- **THEN** el sistema elimina la valoración y devuelve 200 con {"detail": "Valoracion eliminada correctamente"}

#### Scenario: Cliente no autenticado
- **WHEN** se envía DELETE /api/v1/products/{id}/reviews sin token
- **THEN** el sistema devuelve 401 Unauthorized

#### Scenario: Administrador intenta eliminar valoración
- **WHEN** un usuario con rol administrador envía DELETE /api/v1/products/{id}/reviews
- **THEN** el sistema devuelve 403 Forbidden

#### Scenario: Valoración no encontrada
- **WHEN** un cliente envía DELETE /api/v1/products/{id}/reviews y no tiene valoración para ese producto
- **THEN** el sistema devuelve 404 Not Found

### Requirement: Un voto por producto por cliente
El sistema SHALL garantizar que un cliente solo pueda tener una valoración por producto. La restricción SHALL ser enforced a nivel de base de datos con índice único en (usuario_id, producto_id).

#### Scenario: Restricción de integridad
- **WHEN** se intenta insertar una valoración con (usuario_id, producto_id) que ya existe
- **THEN** la base de datos rechaza la inserción y el sistema devuelve 409 Conflict
