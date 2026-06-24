## Why

Los clientes no tienen forma de expresar su satisfaccion con los productos comprados, lo que limita la confianza de potenciales compradores y no proporciona retroalimentacion valiosa al vendedor. Implementar un sistema de valoraciones mejorara la experiencia de compra y proporcionara datos valiosos para la gestion del catalogo.

## What Changes

- Nueva tabla `reviews` para almacenar valoraciones de productos (puntuacion 1-5 y comentario opcional)
- Nuevo endpoint `GET /products/{product_id}/reviews` para listar valoraciones de un producto
- Nuevo endpoint `POST /products/{product_id}/reviews` para crear valoraciones (solo clientes autenticados)
- Nuevo endpoint `GET /reviews/{review_id}` para detalle de valoracion
- Nuevo endpoint `PUT /reviews/{review_id}` para actualizar valoracion (solo autor)
- Nuevo endpoint `DELETE /reviews/{review_id}` para eliminar valoracion (solo autor o admin)
- Nuevo endpoint `GET /products/{product_id}/rating` para obtener estadisticas de valoraciones
- Modificacion del endpoint `GET /products/{product_id}` para incluir media de valoraciones
- Modificacion del catalogo frontend para mostrar estrellas de valoracion
- Nueva pantalla de detalle de producto con seccion de valoraciones
- Nuevo formulario de creacion/edicion de valoraciones

## Capabilities

### New Capabilities
- `product-reviews`: Sistema completo de valoraciones de productos, incluyendo modelo de datos, endpoints API, validaciones de negocio y pantallas frontend para crear, editar, eliminar y visualizar valoraciones.

### Modified Capabilities
- `products`: Se modifica el endpoint de detalle de producto para incluir la media de valoraciones y el numero total de valoraciones.
- `catalog`: Se modifican las tarjetas del catalogo para mostrar estrellas de valoracion junto al precio.

## Impact

- **Backend**: Nuevo modelo SQLAlchemy `Review`, nuevo router `reviews.py`, nuevos schemas `review.py`, nuevo servicio `review_service.py`
- **Base de datos**: Nueva tabla `reviews` con migracion Alembic
- **API**: 6 nuevos endpoints REST, modificacion de 1 endpoint existente
- **Frontend**: Nuevos componentes `StarRating`, `ReviewForm`, `ReviewList`, nuevas paginas `ProductReviewsPage`, modificacion de `ProductDetailPage` y `ProductCard`
- **Dependencias**: Ninguna nueva dependencia requerida
- **Seed**: Nuevo seed de valoraciones de ejemplo para desarrollo
