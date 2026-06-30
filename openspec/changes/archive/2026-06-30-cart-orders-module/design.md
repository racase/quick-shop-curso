## Context

QuickShop's backend already handles auth, users, and products via async FastAPI routers backed by SQLAlchemy 2.0 and PostgreSQL. The frontend has corresponding pages for auth and the product catalog. Cart and orders are the last two modules needed to close the purchase loop. Both modules share a dependency on the products module (stock field) and must coordinate at order-creation time.

## Goals / Non-Goals

**Goals:**
- Persist cart state server-side so it survives page reloads
- Enforce stock limits at both cart add and order creation time
- Decrement stock atomically on order creation; restore it on cancellation
- Record the product price at order-creation time (historical pricing)
- Support two actor types: client (restricted) and admin (broader access)

**Non-Goals:**
- Payment processing or gateway integration
- Cart merging across devices or sessions
- Order editing after placement
- Notifications (email/push) on state changes

## Decisions

### D1 — Cart persistence: database over session/cookie

Cart lines are stored in `cart_items` (DB) rather than in a session cookie or Redis. Rationale: the PRD explicitly states "el carrito persiste en base de datos asociado al usuario autenticado". Simpler infrastructure (no extra cache layer), and the cart is naturally tied to the user identity already present in the JWT.

*Alternative considered*: Redis-backed session — rejected to avoid adding a dependency not present in the current stack.

### D2 — Stock validation at two checkpoints

Stock is validated when a client adds/updates a cart item (soft check) and again when the order is created (hard check inside a DB transaction). The second check prevents race conditions where two clients compete for the last unit.

### D3 — Historical pricing via `precio_unitario` in `order_items`

`order_items.precio_unitario` is captured at order-creation time from `products.precio`. Future price changes in the catalog do not retroactively alter placed orders. `total` is computed on read (sum of `cantidad * precio_unitario` per item) — not stored to avoid denormalization drift.

### D4 — Order state machine

```
pendiente → confirmado → enviado
pendiente → cancelado        (client or admin)
confirmado → cancelado       (admin only)
enviado → cancelado          (admin only)
cancelado → (terminal, no transitions out)
```

Stock is restored whenever a transition to `cancelado` occurs from any non-terminal state.

### D5 — CartContext in React (in-memory, server-authoritative)

Cart state is held in a React Context that mirrors the server state. On add/update/remove, the frontend calls the API and re-fetches the cart to keep count accurate. The Header item counter reads from CartContext. Cart state resets on logout (token lost from memory).

### D6 — Service layer separates business logic from routers

Following the existing pattern (`auth_service`, `product_service`), `cart_service.py` and `order_service.py` contain all business logic. Routers stay thin — dependency injection provides `db` session and `current_user`.

## Risks / Trade-offs

- **Race condition on stock** → Mitigated by the hard check inside a DB transaction at order creation; the first writer wins, the second gets a 400.
- **Cart stale data** → If a product's stock drops below a cart item's quantity between add and checkout, the order-creation hard check catches it. The client sees a 400 and must adjust the cart.
- **Token-only auth (no refresh token)** → Cart is lost on page reload (token in memory). By design per spec; not a bug.
- **No pagination on orders list** → Acceptable for a course project; can be added later without breaking the contract.

## Migration Plan

1. Write Alembic migration adding `cart_items`, `orders`, and `order_items` tables.
2. Migrations run automatically at container start (`alembic upgrade head`), so no manual step is needed.
3. Rollback: `alembic downgrade -1` removes the three tables without affecting existing data.
