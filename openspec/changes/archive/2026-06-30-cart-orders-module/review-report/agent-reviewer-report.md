# Revisión de Código: Módulo Carrito y Pedidos (cart-orders-module)

## Resumen

La implementación cubre correctamente los requisitos funcionales principales del módulo: doble validación de stock, máquina de estados con transiciones válidas, restitución de stock al cancelar, precios históricos en `order_items`, y acceso role-aware. La calidad general es buena y las convenciones del proyecto se siguen en su mayor parte. Se identifican tres hallazgos críticos y varios menores.

---

## Hallazgos Críticos

### 1. El administrador puede crear pedidos — endpoint POST /orders/ sin restricción de rol

`backend/app/api/v1/orders.py`, línea 16

El endpoint `POST /orders/` solo exige `get_current_user`, no filtra por rol `cliente`. La spec es explícita: "Solo los clientes pueden crear pedidos". Un administrador puede crear pedidos actualmente.

### 2. La columna `email` del cliente no existe en la respuesta de pedidos — AdminOrdersPage muestra "Usuario #N" siempre

`backend/app/schemas/order.py`, líneas 19-26; `frontend/src/pages/AdminOrdersPage.jsx`, línea 95

La spec pide que el panel de administrador muestre el email del cliente en cada pedido. El schema `OrderListResponse` solo expone `usuario_id`, y el servicio `list_orders` nunca carga el usuario relacionado. El frontend intenta leer `order.email` pero ese campo nunca llega.

### 3. Race condition en la validación de stock al crear pedido — doble lectura sin bloqueo

`backend/app/services/order.py`, líneas 73-103

La función `create_order` lee el stock de cada producto dos veces: una en el bucle de validación y otra en el bucle de descuento. Entre ambas lecturas, otra transacción concurrente podría reducir el stock. La solución es usar `SELECT ... FOR UPDATE` (bloqueo pesimista) en una única pasada.

---

## Hallazgos Importantes

### 4. `cancel_order` sin restricción de rol explícita

`backend/app/api/v1/orders.py`, líneas 48-54

La spec dice que este endpoint es solo para clientes. El servicio valida ownership, pero semánticamente el admin debería recibir 403 antes de llegar a esa lógica.

### 5. `update_item` en el carrito no verifica que el producto esté activo

`backend/app/services/cart.py`, líneas 95-101

Si un producto se desactiva mientras está en el carrito, el cliente puede seguir incrementando su cantidad. Debería filtrarse por `is_active == True`.

### 6. Imports dentro de funciones en el router del carrito

`backend/app/api/v1/cart.py`, líneas 35-37 y 59-61

Los imports de `select` y `Product` están dentro de las funciones en lugar de al nivel del módulo.

### 7. `OrderStatusUpdate` acepta `pendiente` como valor válido

`backend/app/schemas/order.py`, línea 41

El schema usa `OrderStatus` completo pero la spec dice que los valores permitidos para `PATCH /orders/{id}/status` son solo `confirmado`, `enviado`, `cancelado`. La máquina de estados rechaza `pendiente` igualmente, pero debería modelarse con un enum específico.

---

## Hallazgos Menores

### 8. `OrdersPage` y `AdminOrdersPage` sin `token` en dependencias del `useEffect`

`frontend/src/pages/OrdersPage.jsx`, línea 37; `frontend/src/pages/AdminOrdersPage.jsx`, línea 44

El token no está en el array de dependencias, lo que generaría advertencia del linter de React (exhaustive-deps).

### 9. `handleCheckout` en CartPage no refresca el carrito tras crear el pedido

`frontend/src/pages/CartPage.jsx`, línea 18-19

Tras crear el pedido, debería llamarse a `fetchCart()` antes de navegar a `/orders` para evitar estado stale del badge.

### 10. `rounded-full` en botones de selector de cantidad en vez de `rounded-pill`

`frontend/src/pages/CartPage.jsx`, líneas 91 y 99

La convención del proyecto exige `rounded-pill` en todos los botones.

---

## Lo que está bien

- **Migración coherente**: tipos SQLAlchemy nativos, `ondelete="CASCADE"` correcto, `downgrade` limpio.
- **Arquitectura correcta**: lógica de negocio en `services/`, routers delgados, schemas separados.
- **Máquina de estados**: `_VALID_ADMIN_TRANSITIONS` cubre todas las transiciones; `cancelado` es terminal.
- **Precios históricos**: `precio_unitario` copiado del producto en el momento de creación.
- **Restitución de stock**: cubierta en ambas rutas (admin y cliente).
- **Async correcto**: todos los servicios usan `async def` y `await session.execute()`.
- **Códigos HTTP correctos**: 201, 400, 403, 404 en los lugares adecuados.
- **Token en memoria**: `AuthContext` nunca usa `localStorage`.
- **Design system**: pista transaccional, elevaciones exactas, `rounded-pill`, `font-display` con `fontWeight: 330`.
- **CartContext**: estado reactivo al token y al rol, `itemCount` derivado correctamente.

---

## Veredicto

**REQUIERE CAMBIOS**

Los hallazgos 1 y 2 son bloqueantes. El hallazgo 3 es crítico en producción con carga concurrente.

**Ficheros que requieren cambios:**
- `backend/app/api/v1/orders.py` — hallazgos 1 y 4
- `backend/app/schemas/order.py` — hallazgos 2 y 7
- `backend/app/services/order.py` — hallazgos 2 y 3
- `backend/app/services/cart.py` — hallazgos 3 y 5
- `backend/app/api/v1/cart.py` — hallazgo 6
- `frontend/src/pages/CartPage.jsx` — hallazgos 9 y 10
