## Context

QuickShop es una plataforma de e-commerce con catálogo de productos, carrito y pedidos. Actualmente no existe mecanismo de feedback de usuarios sobre productos. El sistema tiene dos roles: cliente y administrador. Los clientes pueden comprar productos pero no pueden opiniones. Se necesita agregar un sistema de valoraciones que permita a los clientes puntuar productos de 1 a 5 estrellas.

## Goals / Non-Goals

**Goals:**
- Permitir a clientes autenticados valorar productos con puntuación de 1-5 estrellas
- Mostrar media de valoraciones y total de valoraciones en catálogo y detalle de producto
- Un cliente solo puede valorar un producto una vez (puede actualizar su valoración)
- Mantener consistencia con la arquitectura existente (models/schemas/services/api)

**Non-Goals:**
- No se requiere autenticación para ver valoraciones (público)
- No se permite a administradores crear valoraciones
- No se implementa sistema de comentarios de texto (solo puntuación numérica)
- No se requiere haber comprado el producto para valorarlo (simplificación inicial)
- No se implementa moderación de valoraciones
- No se muestran valoraciones de productos inactivos

## Decisions

### 1. Modelo de datos: tabla `valoraciones` separada

**Decisión:** Crear una nueva tabla `valoraciones` con relación a `usuarios` y `productos`, en lugar de agregar campos de rating a la tabla `productos`.

**Razón:**
- Separación de responsabilidades: productos almacena datos del catálogo, valoraciones almacena opiniones de usuarios
- Facilita cálculos de media sin impactar rendimiento de consultas de productos
- Permite auditoría (created_at, updated_at por valoración)
- Consistente con el patrón existente (items_carrito, items_pedido como tablas separadas)

**Alternativa considerada:** Agregar `media_puntuacion` y `total_valoraciones` como columnas en `productos`. Rechazada porque requiere actualización atómica en cada nueva valoración y viola normalización.

### 2. Índice único compuesto (usuario_id, producto_id)

**Decisión:** Crear índice único en `(usuario_id, producto_id)` para garantizar que un cliente solo pueda valorar un producto una vez.

**Razón:**
- Restricción de integridad a nivel de base de datos
- Previene race conditions en creación simultánea de valoraciones
- Consistente con el patrón de `items_carrito` que usa índice único en `(usuario_id, producto_id)`

### 3. Cálculo de media en tiempo de consulta

**Decisión:** Calcular `media_puntuacion` y `total_valoraciones` mediante consulta SQL (AVG, COUNT) en cada petición de listado/detalle de producto.

**Razón:**
- Garantiza consistencia (no hay desfase entre valoraciones y media)
- Complejidad de implementación baja
- Volumen esperado: 20 productos × N valoraciones = consultas simples

**Alternativa considerada:** Almacenar media y total como columnas denormalizadas en `productos`. Rechazada porque requiere transacciones complejas para mantener consistencia.

### 4. Endpoints bajo prefijo `/products/{id}/reviews`

**Decisión:** Anidar endpoints de valoraciones bajo el recurso padre `/products/{id}/reviews` en lugar de crear `/reviews/` independiente.

**Razón:**
- RESTful: las valoraciones son sub-recursos de productos
- Facilita filtering por producto_id en la URL
- Consistente con la estructura existente `/products/`, `/cart/`, `/orders/`

### 5. PUT como upsert (crear o actualizar)

**Decisión:** El endpoint PUT `/products/{id}/reviews` crea una nueva valoración si no existe, o actualiza la existente.

**Razón:**
- UX simplificada: un solo botón para "dar mi opinión"
- Evita que el usuario tenga que verificar si ya valoró antes de actuar
- Consistente con el comportamiento de otros endpoints PUT del sistema

### 6. Frontend: componente de estrellas reutilizable

**Decisión:** Crear un componente `StarRating` reutilizable que se use tanto en tarjetas de catálogo (solo lectura) como en formulario de detalle de producto (interactivo).

**Razón:**
- Reutilizabilidad entre catálogo y detalle
- Consistencia visual
- El componente maneja estados: solo lectura (media), interactivo (selección de puntuación)

## Risks / Trade-offs

- **[Rendimiento]** Consultas de media en cada petición de listado → Aceptable para el volumen esperado (20 productos). Si en el futuro hay miles de productos, considerar denormalización.
- **[Consistencia]** Un cliente puede valorar sin haber comprado → Aceptable como simplificación inicial. Se puede agregar validación de compra en el futuro.
- **[Moderación]** No hay sistema de moderación → Las valoraciones son públicas y no se pueden ocultar. Se puede agregar flags de reporte en el futuro.
- **[Migración]** Nueva tabla requiere migración Alembic → Migración simple, sin dependencias con datos existentes.
