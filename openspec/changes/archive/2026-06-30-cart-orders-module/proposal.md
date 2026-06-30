## Why

QuickShop already covers auth, users, and products. The cart and orders modules complete the core purchasing flow: customers need a way to add products to a cart and place orders that track inventory changes and lifecycle states.

## What Changes

- New `cart_items` table persists per-user cart lines in the database
- New `orders` and `order_items` tables track placed orders and their historical prices
- Five cart endpoints (get, add, update quantity, remove item, clear cart)
- Five order endpoints (create, list, get detail, admin status update, customer cancel)
- Frontend pages: CartPage, OrdersPage, OrderDetailPage, AdminOrdersPage
- Cart item counter added to global Header (clients only)

## Capabilities

### New Capabilities

- `cart`: Shopping cart management — add, update, remove, and clear items with stock validation and per-user persistence
- `orders`: Order lifecycle — create from cart (with stock deduction), list and view details, admin status transitions, customer self-cancel for pending orders

### Modified Capabilities

<!-- No existing specs require behavioral changes -->

## Impact

- **Backend**: new models (`CartItem`, `Order`, `OrderItem`), services (`cart_service`, `order_service`), routers (`cart.py`, `orders.py`), and Alembic migration for the three new tables
- **Frontend**: four new pages (CartPage, OrdersPage, OrderDetailPage, AdminOrdersPage), CartContext for global cart state, and Header updated with cart item counter
- **Products module**: stock field is decremented on order creation and restored on cancellation (read/write, no schema change)
- **Dependencies**: none new
