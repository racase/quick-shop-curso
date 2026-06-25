## Context

QuickShop already has authentication (JWT), user management, and a product catalog with stock tracking. Cart and orders are the missing transactional core. The cart persists per user, accumulates items, and validates against available stock. Orders snap the cart state, deduct stock, and follow a predefined status lifecycle.

The backend follows FastAPI + SQLAlchemy 2.0 async + PostgreSQL 15, with `uv` as package manager. The frontend is React 18 + Vite + Tailwind CSS with pnpm. Both are deployed via Docker Compose.

## Goals / Non-Goals

**Goals:**
- Implement Cart/CartItem and Order/OrderItem SQLAlchemy models with Alembic migration.
- Implement cart operations: view, add item, update quantity, remove item, clear cart.
- Implement order operations: create from cart (stock deduction + cart clear), list (client own / admin all), detail, admin status transitions, cancel (stock restoration).
- Enforce role-based access: only client role can operate cart and create orders; admin manages order status.
- Calculate totals server-side with Decimal precision.
- Implement integration tests for all endpoints.
- Implement React pages: CartPage, OrderHistoryPage, OrderDetailPage, OrderManagementPage.

**Non-Goals:**
- Payment processing or payment gateways.
- Shipping address or shipping cost calculation.
- Email notifications for order status changes.
- Partial order fulfillment or partial cancellations.
- Order editing after creation (only status transitions and full cancellation).

## Decisions

### D1: Fix `require_client` to enforce client role

The existing `require_client` dependency passes through any authenticated user without checking the role. Cart and order specs state that admins MUST NOT access cart endpoints and MUST NOT create orders. The dependency needs to be updated to reject users with `UserRole.admin` returning HTTP 403.

**Alternative**: Create a separate `require_cart_access` or similar dependency. Rejected -- `require_client` semantically means "must be client", and all current usages (none yet) would expect this behavior.

### D2: Cart created lazily on first add

A cart row is NOT created at user registration or login. The first `POST /cart/items` creates the cart row implicitly if it does not exist. `GET /cart` returns an empty cart response (items=[], total="0.00", item_count=0) if no cart row exists yet.

**Alternative**: Create cart at registration time. Rejected -- wasteful for users who never add items to cart.

### D3: Order creation is transactional

`POST /orders` runs in a single transaction: validate stock for all cart items, deduct stock from products, create order + order_items rows, and clear cart_items. If any validation fails (insufficient stock, empty cart), the entire transaction is rolled back.

### D4: `unit_price` in order_items is frozen at purchase time

The `order_items.unit_price` column captures the product price at the moment of purchase. It is immutable. If a product price changes later, existing order items are unaffected.

### D5: Order status state machine with explicit allowed transitions

Allowed transitions are defined in a dictionary, checked in the service layer before any status change. Transitions from terminal states (delivered, cancelled) are rejected.

```
pending    -> confirmed, cancelled
confirmed  -> shipped, cancelled
shipped    -> delivered, cancelled
delivered  -> (terminal)
cancelled  -> (terminal)
```

### D6: Totals calculated server-side with Python Decimal

All monetary calculations (subtotal per item, cart total, order total) are computed in the service layer using `Decimal` arithmetic. The cart response includes `subtotal` per item and a `total` for the entire cart. The order response includes `total` and `subtotal` per item.

### D7: require_client endpoint vs admin-accessible endpoints

- Cart endpoints (GET /cart, POST /cart/items, PUT /cart/items/{id}, DELETE /cart/items/{id}, DELETE /cart): require `require_client` (only clients).
- POST /orders: requires `require_client` (only clients can create orders from their cart).
- GET /orders and GET /orders/{id}: uses `get_current_user`. Clients see their own orders; admins see all orders.
- PATCH /orders/{id}/status: requires `require_admin`.
- DELETE /orders/{id}: uses `require_client`, only allows cancellation of own pending orders.

### D8: Stock restored on cancellation, not on status changes

Stock is restored ONLY when an order transitions to `cancelled`. Stock is deducted ONLY at order creation. Status changes like confirmed -> shipped -> delivered do not affect stock.

### D9: Cart items cascade-delete when order is created

When an order is created, the service deletes all `cart_items` for that cart (via `DELETE FROM cart_items WHERE cart_id = ?`). The cart row itself is preserved for future use. `DELETE /cart` also only deletes cart_items, not the cart row.

### D10: UUID-based IDs follow existing conventions

All primary keys use UUID with `default=uuid.uuid4`, matching the existing User and Product models.

## Risks / Trade-offs

- [Stock race conditions] → Two concurrent orders could deplete stock. **Mitigation**: Use PostgreSQL row-level locking (`SELECT ... FOR UPDATE`) on product rows during order creation to prevent oversell. Alternatively, rely on the UNIQUE constraint catching the issue -- acceptable for a learning project.
- [Cart not auto-cleaned] → Cart rows without items accumulate in the database over time. **Mitigation**: Cart rows without items have no FK issues and are benign; they do not affect subsequent operations.
- [Fixing require_client] → Existing code may rely on the current pass-through behavior. **Mitigation**: `require_client` is currently unused in the codebase, so changing it has no impact on existing routers.
