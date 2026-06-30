## 1. Database migration

- [x] 1.1 Create Alembic migration adding `cart_items`, `orders`, and `order_items` tables with all columns, constraints, FKs, and the `order_status` enum type

## 2. Cart backend

- [x] 2.1 Create `CartItem` SQLAlchemy model in `app/models/cart.py`
- [x] 2.2 Create cart Pydantic schemas in `app/schemas/cart.py` (CartItemAdd, CartItemUpdate, CartItemResponse, CartResponse)
- [x] 2.3 Create `cart_service.py` with get_cart, add_item, update_item, remove_item, clear_cart logic including stock validation
- [x] 2.4 Create `app/api/v1/cart.py` router with all five endpoints (GET /cart/, POST /cart/items, PUT /cart/items/{producto_id}, DELETE /cart/items/{producto_id}, DELETE /cart/)
- [x] 2.5 Register cart router in `main.py` under prefix `/api/v1`

## 3. Orders backend

- [x] 3.1 Create `Order` and `OrderItem` SQLAlchemy models in `app/models/order.py` including the `OrderStatus` enum
- [x] 3.2 Create order Pydantic schemas in `app/schemas/order.py` (OrderItemResponse, OrderResponse, OrderStatusUpdate)
- [x] 3.3 Create `order_service.py` with create_order (stock decrement + cart clear), list_orders (role-aware), get_order_detail (ownership check), update_status (admin, state machine + stock restore on cancel), cancel_order (client, pending-only + stock restore)
- [x] 3.4 Create `app/api/v1/orders.py` router with all five endpoints (POST /orders/, GET /orders/, GET /orders/{id}, PATCH /orders/{id}/status, PATCH /orders/{id}/cancel)
- [x] 3.5 Register orders router in `main.py` under prefix `/api/v1`

## 4. Frontend — Cart

- [x] 4.1 Create `src/api/cart.js` with getCart, addItem, updateItem, removeItem, clearCart functions
- [x] 4.2 Create `src/context/CartContext.jsx` with cart state, item count, and methods (fetchCart, addToCart, updateQuantity, removeFromCart, clearCart)
- [x] 4.3 Wrap app with CartContext provider in `main.jsx` (only active for authenticated clients)
- [x] 4.4 Update `Header` component to show cart icon with item count (from CartContext), visible only to authenticated clients
- [x] 4.5 Update `CatalogPage` product cards: "Agregar al carrito" button calls addToCart and updates the header counter; button disabled when stock is 0
- [x] 4.6 Create `src/pages/CartPage.jsx` with item list (image, name, unit price, quantity selector, remove button), total, "Finalizar compra" button (calls POST /orders/ then redirects to /orders), and "Vaciar carrito" button

## 5. Frontend — Orders

- [x] 5.1 Create `src/api/orders.js` with getOrders, getOrderDetail, cancelOrder, updateOrderStatus functions
- [x] 5.2 Create `src/pages/OrdersPage.jsx` with list of client's orders (id, date, status, total) and "Cancelar" button visible only for pending orders
- [x] 5.3 Create `src/pages/OrderDetailPage.jsx` with full order detail: item list with quantities, unit prices, subtotals, and order total
- [x] 5.4 Create `src/pages/AdminOrdersPage.jsx` with table of all orders (client email, date, status) and a status selector per row that calls PATCH /orders/{id}/status
- [x] 5.5 Add routes `/cart`, `/orders`, `/orders/:id`, `/admin/orders` in `App.jsx` with appropriate access guards (client / admin)
