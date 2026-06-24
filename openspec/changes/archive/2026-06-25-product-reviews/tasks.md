## 1. Backend - Modelos y Migracion

- [x] 1.1 Crear modelo SQLAlchemy Review en app/models/review.py
- [x] 1.2 Crear migracion Alembic para tabla reviews
- [x] 1.3 Actualizar modelo Product para incluir relacion con reviews
- [x] 1.4 Crear seed de valoraciones de ejemplo en app/seed/seed.py

## 2. Backend - Schemas Pydantic

- [x] 2.1 Crear schemas de review en app/schemas/review.py (ReviewCreate, ReviewUpdate, ReviewResponse, ReviewListResponse)
- [x] 2.2 Crear schemas de rating en app/schemas/review.py (RatingResponse, RatingDistribution)
- [x] 2.3 Actualizar schema de Product para incluir average_rating y rating_count

## 3. Backend - Logica de Negocio

- [x] 3.1 Crear servicio de reviews en app/services/review_service.py (create, get, update, delete)
- [x] 3.2 Implementar validacion de pedido delivered para crear review
- [x] 3.3 Implementar restriccion UNIQUE(user_id, product_id) con mensaje de error claro
- [x] 3.4 Implementar calculo de media y distribucion de valoraciones
- [x] 3.5 Implementar permisos: solo autor puede editar/eliminar, admin puede eliminar cualquier review
- [x] 3.6 Crear seed con 30 valoraciones de ejemplo (2-3 por producto)

## 4. Backend - Endpoints API

- [x] 4.1 Crear router reviews.py en app/api/v1/ con endpoints GET/POST /products/{product_id}/reviews
- [x] 4.2 Agregar endpoints GET/PUT/DELETE /reviews/{review_id}
- [x] 4.3 Agregar endpoint GET /products/{product_id}/rating
- [x] 4.4 Actualizar endpoint GET /products/{product_id} para incluir average_rating y rating_count
- [x] 4.5 Registrar router reviews en app/main.py
- [x] 4.6 Agregar dependencia get_db y get_current_user a endpoints protegidos

## 5. Backend - Tests

- [x] 5.1 Crear tests de integracion para POST /products/{product_id}/reviews
- [x] 5.2 Crear tests de integracion para GET /products/{product_id}/reviews
- [x] 5.3 Crear tests de integracion para PUT /reviews/{review_id}
- [x] 5.4 Crear tests de integracion para DELETE /reviews/{review_id}
- [x] 5.5 Crear tests de integracion para GET /products/{product_id}/rating
- [x] 5.6 Crear tests de validacion (pedido delivered, unica valoracion por usuario)
- [x] 5.7 Crear tests de permisos (admin vs client)

## 6. Frontend - Componentes Base

- [x] 6.1 Crear componente StarRating.jsx reutilizable (muestra estrellas 1-5, editable o solo lectura)
- [x] 6.2 Crear componente ReviewCard.jsx (muestra autor, estrellas, comentario, fecha)
- [x] 6.3 Crear componente ReviewForm.jsx (formulario de creacion/edicion de review)
- [x] 6.4 Crear servicio reviewService.js con funciones para endpoints de reviews

## 7. Frontend - Paginas de Reviews

- [x] 7.1 Crear pagina ProductReviewsPage.jsx (lista de reviews de un producto con paginacion)
- [x] 7.2 Crear pagina ReviewFormPage.jsx (formulario para crear/editar review)
- [x] 7.3 Crear pagina AdminReviewsPage.jsx (gestion de reviews para administradores)

## 8. Frontend - Integracion con Catalogo

- [x] 8.1 Actualizar ProductCard.jsx para mostrar estrellas y numero de reviews
- [x] 8.2 Actualizar ProductDetailPage.jsx para incluir seccion de reviews
- [x] 8.3 Agregar boton "Valorar este producto" en detalle de producto (condicional)
- [x] 8.4 Crear componente RatingSummary.jsx (media, distribucion, histograma)
- [x] 8.5 Integrar ReviewForm en modal o seccion dedicada en detalle de producto

## 9. Frontend - Navegacion y Estilos

- [x] 9.1 Agregar rutas /products/:id/reviews y /reviews/:id/edit en AppRouter.jsx
- [x] 9.2 Agregar ruta /admin/reviews para gestion de administrador
- [x] 9.3 Estilizar componentes con Tailwind (estrellas doradas, hover effects)
- [x] 9.4 Adaptar disenio responsivo para mobile y desktop

## 10. Verificacion Final

- [x] 10.1 Ejecutar tests backend y verificar que pasan
- [x] 10.2 Ejecutar lint y typecheck en backend
- [x] 10.3 Ejecutar lint y typecheck en frontend
- [x] 10.4 Probar flujo completo: crear review, verificar media, editar, eliminar
- [x] 10.5 Verificar que el seed crea valoraciones de ejemplo correctamente
