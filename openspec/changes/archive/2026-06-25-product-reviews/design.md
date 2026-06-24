## Context

QuickShop es una plataforma de e-commerce con FastAPI + React + PostgreSQL. Actualmente no existe un sistema de valoraciones. Los usuarios pueden navegar el catalogo, agregar productos al carrito y realizar pedidos, pero no pueden proporcionar retroalimentacion sobre los productos comprados.

El sistema debe permitir a los clientes valorar productos que han comprado, mostrando la media de valoraciones en el catalogo y en el detalle de producto. Las valoraciones deben estar vinculadas a pedidos completados (estado delivered) para garantizar la autenticidad.

## Goals / Non-Goals

**Goals:**
- Permitir a clientes autenticados valorar productos del 1 al 5 estrellas
- Mostrar la media de valoraciones en el catalogo y detalle de producto
- Validar que solo clientes con pedidos delivered puedan valorar
- Permitir a clientes editar/eliminar sus propias valoraciones
- Permitir a administradores eliminar cualquier valoracion
- Calcular automaticamente la media y distribucion de valoraciones

**Non-Goals:**
- Sistema de moderacion de comentarios
- Respuestas de administradores a valoraciones
- Valoraciones anonimas
- Sistema de likes/dislikes en valoraciones
- Notificaciones de nuevas valoraciones

## Decisions

### Decision 1: Modelo de datos con tabla reviews separada

**Alternativas consideradas:**
1. Campo JSON en products (no escalable, dificil de consultar)
2. Tabla reviews separada (seleccionado)
3. Tabla reviews con campos denormalizados en products

**Justificacion:** La tabla separada permite:
- Consultas eficientes con indices
- Restriccion UNIQUE(user_id, product_id)
- Joins simples con users y products
- Facil migracion y mantenimiento

### Decision 2: Endpoint GET /products/{product_id}/rating separado

**Alternativas consideradas:**
1. Incluir media en GET /products/{product_id} (seleccionado)
2. Solo endpoint separado
3. Ambos (seleccionado - endpoint separado para distribucion)

**Justificacion:** Se implementan ambos porque:
- GET /products/{product_id} incluye average_rating y rating_count para el catalogo
- GET /products/{product_id}/rating incluye rating_distribution para el histograma
- Separacion de responsabilidades: listado vs estadisticas detalladas

### Decision 3: Validacion de pedido delivered

**Alternativas consideradas:**
1. Cualquier pedido (no garantiza calidad)
2. Solo pedido delivered (seleccionado)
3. Pedido delivered + tiempo minimo desde entrega

**Justificacion:** Estado delivered garantiza que:
- El usuario recibio el producto
- Puede formarse una opinion informada
- Evita valoraciones prematuras

### Decision 4: Un usuario una valoracion por producto

**Alternativas consideradas:**
1. Multiples valoraciones (ruido, dificil de calcular media)
2. Una valoracion por usuario/producto (seleccionado)
3. Una valoracion activa + historial

**Justificacion:** Una sola valoracion:
- Simplifica el calculo de media
- Evita manipulacion con multiples valoraciones
- Permite edicion en lugar de crear nuevas

## Risks / Trade-offs

### Risk 1: Rendimiento en productos populares
- **Riesgo**: Productos con miles de valoraciones pueden lentizar consultas
- **Mitigacion**: Indices en product_id, paginacion de valoraciones, cache de media

### Risk 2: Spam y valoraciones falsas
- **Riesgo**: Usuarios pueden crear cuentas falsas para valorar
- **Mitigacion**: Requiere pedido delivered, una sola valoracion por usuario/producto

### Risk 3: Migracion de datos existentes
- **Riesgo**: Productos actuales no tendran valoraciones iniciales
- **Mitigacion**: Seed de valoraciones de ejemplo, mostrar "Sin valoraciones" cuando no existan

### Trade-off: Complejidad vs Funcionalidad
- Se sacrifica simplicidad (endpoint adicional) por mejor UX (histograma de distribucion)
- Se agrega validacion de pedido (complejidad) por calidad de datos (funcionalidad)

## Migration Plan

1. Crear migracion Alembic para tabla reviews
2. Actualizar modelo SQLAlchemy Review
3. Crear servicio y router de reviews
4. Modificar endpoint GET /products/{product_id} para incluir media
5. Crear seed de valoraciones de ejemplo
6. Actualizar frontend: componentes de estrellas y formularios
7. Probar integracion completa
8. Desplegar en orden: backend -> migracion -> frontend

## Open Questions

1. ¿Se permiten valoraciones sin comentario (solo estrellas)?
   - **Decision**: Si, el comentario es opcional
2. ¿Se pueden eliminar valoraciones desde el panel de administracion?
   - **Decision**: Si, administradores pueden eliminar cualquier valoracion
3. ¿Se muestra el nombre completo del usuario en la valoracion?
   - **Decision**: Si, para transparencia
