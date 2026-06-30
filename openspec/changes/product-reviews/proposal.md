## Why

Los usuarios necesitan una forma de expresar su opinión sobre los productos comprados. Actualmente el catálogo solo muestra información estática del producto sin feedback de otros compradores. Un sistema de valoraciones mejora la experiencia de compra y proporciona información útil para la toma de decisiones.

## What Changes

- Nueva tabla `valoraciones` con relación a usuarios y productos, puntuación de 1-5 estrellas, e índice único por usuario-producto
- Nuevo endpoint GET /api/v1/products/{id}/reviews para listar valoraciones de un producto con media y total
- Nuevo endpoint POST /api/v1/products/{id}/reviews para crear valoración (solo clientes)
- Nuevo endpoint PUT /api/v1/products/{id}/reviews para actualizar valoración existente
- Nuevo endpoint DELETE /api/v1/products/{id}/reviews para eliminar valoración
- Modificación de GET /api/v1/products/ para incluir campos `media_puntuacion` y `total_valoraciones`
- Modificación de GET /api/v1/products/{id} para incluir campos `media_puntuacion` y `total_valoraciones`
- Nuevo esquema Pydantic `ReviewCreate` para validación de puntuación
- Nuevo modelo SQLAlchemy `Valoracion` con restricción de integridad unique(usuario_id, producto_id)
- Nuevo servicio `reviews` con lógica de negocio para crear, actualizar, eliminar y calcular medias
- Frontend: estrellas de valoración en tarjetas de catálogo y sección de valoraciones en detalle de producto

## Capabilities

### New Capabilities

- `product-reviews`: Sistema completo de valoraciones de productos - modelo de datos, endpoints CRUD, cálculo de medias, restricciones de negocio (un voto por usuario), integración con catálogo y detalle de producto

### Modified Capabilities

- `products`: Los endpoints GET /api/v1/products/ y GET /api/v1/products/{id} incluyen campos adicionales `media_puntuacion` (decimal con 1 decimal) y `total_valoraciones` (entero) calculados a partir de la tabla de valoraciones

## Impact

- **Backend**: Nuevo módulo `reviews` en `backend/app/api/`, nuevo modelo en `backend/app/models/`, nuevos esquemas en `backend/app/schemas/`, nuevo servicio en `backend/app/services/`
- **Base de datos**: Nueva tabla `valoraciones`, nueva migración Alembic
- **API**: 4 nuevos endpoints, 2 endpoints modificados con campos adicionales en response
- **Frontend**: Componente de estrellas reutilizable, nueva sección en página de detalle de producto, modificación de tarjetas de catálogo
- **Seed**: No requiere cambios (las valoraciones se crean por interacción del usuario)
