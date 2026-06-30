## 1. Backend - Modelo de datos

- [x] 1.1 Crear modelo SQLAlchemy `Valoracion` en `backend/app/models/review.py` con campos id, usuario_id (FK), producto_id (FK), puntuacion (1-5), created_at, updated_at
- [x] 1.2 Agregar índice único compuesto en (usuario_id, producto_id) al modelo
- [x] 1.3 Registrar modelo en `backend/app/models/__init__.py`

## 2. Backend - Migración de base de datos

- [x] 2.1 Generar migración Alembic con `alembic revision --autogenerate -m "add reviews table"`
- [x] 2.2 Verificar que la migración crea la tabla valoraciones con el índice único
- [x] 2.3 Ejecutar migración con `alembic upgrade head`

## 3. Backend - Esquemas Pydantic

- [x] 3.1 Crear esquemas en `backend/app/schemas/review.py`: ReviewCreate (puntuacion: int 1-5), ReviewResponse (id, usuario_id, producto_id, puntuacion, created_at, updated_at), ReviewListResponse (producto_id, media_puntuacion, total_valoraciones, valoraciones[])
- [x] 3.2 Registrar esquemas en `backend/app/schemas/__init__.py`

## 4. Backend - Servicio de valoraciones

- [x] 4.1 Crear servicio en `backend/app/services/review.py` con funciones: create_review, update_review, delete_review, get_product_reviews, get_product_rating_stats
- [x] 4.2 Implementar lógica de upsert en update_review (crear si no existe)
- [x] 4.3 Implementar cálculo de media_puntuacion (AVG con 1 decimal) y total_valoraciones (COUNT)
- [x] 4.4 Implementar validación de unicidad (un voto por usuario por producto)

## 5. Backend - Endpoints API

- [x] 5.1 Crear router en `backend/app/api/v1/reviews.py` con endpoints: GET /, POST /, PUT /, DELETE /
- [x] 5.2 Implementar GET /api/v1/products/{id}/reviews (público, con paginación)
- [x] 5.3 Implementar POST /api/v1/products/{id}/reviews (solo clientes, retorna 409 si ya existe)
- [x] 5.4 Implementar PUT /api/v1/products/{id}/reviews (solo clientes, upsert)
- [x] 5.5 Implementar DELETE /api/v1/products/{id}/reviews (solo clientes)
- [x] 5.6 Registrar router en `backend/app/api/v1/__init__.py`
- [x] 5.7 Agregar dependencia `get_current_active_client` para endpoints de escritura

## 6. Backend - Modificar endpoints de productos

- [x] 6.1 Modificar servicio de productos para incluir media_puntuacion y total_valoraciones en respuestas de listado y detalle
- [x] 6.2 Actualizar esquemas de producto para incluir campos media_puntuacion y total_valoraciones
- [x] 6.3 Verificar que GET /api/v1/products/ retorna los nuevos campos
- [x] 6.4 Verificar que GET /api/v1/products/{id} retorna los nuevos campos

## 7. Frontend - Componentes de estrellas

- [x] 7.1 Crear componente `StarRating` reutilizable en `frontend/src/components/StarRating.jsx` con soporte para modo solo lectura (media) y modo interactivo (selección)
- [x] 7.2 Implementar lógica de estrellas llenas, medias y vacías basada en puntuación

## 8. Frontend - Página de detalle de producto

- [x] 8.1 Agregar sección de valoraciones en la página de detalle de producto
- [x] 8.2 Mostrar media general, total de valoraciones y lista de valoraciones individuales
- [x] 8.3 Implementar formulario de valoración para clientes autenticados (selector de estrellas)
- [x] 8.4 Implementar lógica de crear/actualizar/eliminar valoración
- [x] 8.5 Mostrar valoración del usuario actual con opción de editar o eliminar

## 9. Frontend - Catálogo de productos

- [x] 9.1 Modificar tarjetas de producto en el catálogo para incluir estrellas de valoración y media numérica
- [x] 9.2 Actualizar llamada a API para recibir campos media_puntuacion y total_valoraciones

## 10. Verificación

- [x] 10.1 Ejecutar tests del backend si existen
- [x] 10.2 Verificar que los endpoints funcionan correctamente con curl o Postman
- [x] 10.3 Verificar que el frontend muestra correctamente las estrellas
- [x] 10.4 Verificar que un cliente no puede valorar dos veces el mismo producto
- [x] 10.5 Verificar que los administradores no pueden crear valoraciones
