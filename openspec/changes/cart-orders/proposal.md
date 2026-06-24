## Why

QuickShop currently has product catalog, authentication, and user management. Without a cart and order system, users cannot purchase products -- the platform is not functional as an e-commerce store. These two modules are tightly coupled (orders are created from cart items) and must be implemented together.

## What Changes

- Implement the full backend for shopping cart: persist cart and cart_items per user, add/update/remove items, validate stock limits, calculate totals server-side.
- Implement the full backend for orders: create order from cart (deduct stock, clear cart), list/filter orders by status, view order detail, admin-driven status transitions with validation, cancel orders with stock restoration.
- Create new SQLAlchemy models: Cart, CartItem, Order, OrderItem with corresponding Alembic migration.
- Create Pydantic schemas for all cart and order request/response payloads.
- Create service-layer business logic for cart operations and order lifecycle.
- Create FastAPI routers for /cart and /orders endpoints with role-based access control.
- Implement React pages: CartPage, OrderHistoryPage, OrderDetailPage (client), and OrderManagementPage (admin).
- Create React services: cartService.js and orderService.js.
- Add backend integration tests for all cart and order endpoints.

## Capabilities

### New Capabilities

- `cart-management`: Persistent shopping cart per user with add/update/remove item operations, stock validation, and server-side total calculation. Endpoints: GET /cart, POST /cart/items, PUT /cart/items/{id}, DELETE /cart/items/{id}, DELETE /cart.
- `order-management`: Order creation from cart with stock deduction, status lifecycle (pending -> confirmed -> shipped -> delivered / cancelled), admin status transitions, order history with pagination and status filter, cancel with stock restoration. Endpoints: POST /orders, GET /orders, GET /orders/{id}, PATCH /orders/{id}/status, DELETE /orders/{id}.

### Modified Capabilities

<!-- No existing specs are modified. Cart and orders consume existing product data via the product-catalog API without changing its requirements. -->

## Impact

- Creates `backend/app/models/cart.py` and `backend/app/models/order.py` with Cart, CartItem, Order, OrderItem models.
- Creates `backend/app/schemas/cart.py` and `backend/app/schemas/order.py` with Pydantic request/response schemas.
- Creates `backend/app/services/cart_service.py` and `backend/app/services/order_service.py` with business logic.
- Creates `backend/app/api/v1/cart.py` and `backend/app/api/v1/orders.py` with FastAPI routers.
- Registers new routers in `backend/app/main.py`.
- Generates Alembic migration for carts, cart_items, orders, order_items tables and OrderStatus enum.
- Creates `backend/tests/test_cart.py` and `backend/tests/test_orders.py` with integration tests.
- Creates `frontend/src/services/cartService.js` and `frontend/src/services/orderService.js`.
- Creates `frontend/src/pages/cart/CartPage.jsx`, `frontend/src/pages/orders/OrderHistoryPage.jsx`, `frontend/src/pages/orders/OrderDetailPage.jsx`, `frontend/src/pages/admin/OrderManagementPage.jsx`.
- Updates `frontend/src/routes/AppRouter.jsx` with new cart and order routes.
- Updates `backend/app/core/dependencies.py` to fix `require_client` enforcing client role.
