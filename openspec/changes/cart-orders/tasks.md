## 1. Fix require_client dependency

- [x] 1.1 Update `require_client` in `backend/app/core/dependencies.py` to reject admin users (return 403 if `current_user.role != UserRole.client`)

## 2. Cart and Order models + Alembic migration

- [x] 2.1 Create `backend/app/models/cart.py` with Cart model (id UUID PK, user_id UUID FK UNIQUE, created_at, updated_at) and CartItem model (id UUID PK, cart_id UUID FK ON DELETE CASCADE, product_id UUID FK, quantity INTEGER CHECK > 0, UNIQUE(cart_id, product_id), created_at, updated_at)
- [x] 2.2 Create `backend/app/models/order.py` with OrderStatus Enum (pending, confirmed, shipped, delivered, cancelled), Order model (id UUID PK, user_id UUID FK, status OrderStatus default pending, total NUMERIC(10,2), created_at, updated_at) and OrderItem model (id UUID PK, order_id UUID FK ON DELETE CASCADE, product_id UUID FK, quantity INTEGER CHECK > 0, unit_price NUMERIC(10,2))
- [x] 2.3 Update `backend/app/models/__init__.py` to import cart and order models
- [x] 2.4 Update `backend/alembic/env.py` to import cart and order models
- [x] 2.5 Generate Alembic migration via `uv run alembic revision --autogenerate -m "add_cart_and_orders"`
- [x] 2.6 Review and verify the generated migration creates carts, cart_items, orders, order_items tables and orderstatus enum

## 3. Cart and Order Pydantic schemas

- [x] 3.1 Create `backend/app/schemas/cart.py` with CartItemResponse (id, product with ProductResponse fields, quantity, subtotal), CartResponse (id, items list, total, item_count), AddItemRequest (product_id UUID, quantity int >= 1), UpdateItemRequest (quantity int >= 1)
- [x] 3.2 Create `backend/app/schemas/order.py` with OrderItemResponse (product_id, product_name, quantity, unit_price, subtotal), OrderResponse (id, status, total, items list, created_at), OrderListResponse (items, total, page, size), UpdateOrderStatusRequest (status OrderStatus)
- [x] 3.3 Create `backend/app/schemas/__init__.py` to import schemas

## 4. Cart service

- [x] 4.1 Create `backend/app/services/cart_service.py` with: get_or_create_cart(db, user_id), get_cart(db, user_id) returning cart with items, products, and calculated totals, add_item(db, user_id, product_id, quantity) with stock validation and quantity accumulation, update_item(db, user_id, item_id, quantity) with ownership and stock checks, remove_item(db, user_id, item_id) with ownership check, clear_cart(db, user_id)
- [x] 4.2 Create `backend/app/services/__init__.py` to import cart service

## 5. Order service

- [x] 5.1 Create `backend/app/services/order_service.py` with: create_order(db, user_id) transactional (validate cart not empty, check stock, deduct stock, create order+order_items with frozen unit_price, clear cart), list_orders(db, user_id, role, page, size, status) returning client-own or all based on role, get_order(db, order_id, user_id, role) with ownership/role check, update_status(db, order_id, status) admin-only valid transitions + stock restore on cancel, cancel_order(db, order_id, user_id) client-own pending only + stock restore
- [x] 5.3 Define VALID_TRANSITIONS dict for state machine validation
- [x] 5.4 Create `backend/app/services/__init__.py` to import order service

## 6. Cart API router

- [x] 6.1 Create `backend/app/api/v1/cart.py` router with GET /cart, POST /cart/items, PUT /cart/items/{item_id}, DELETE /cart/items/{item_id}, DELETE /cart, all protected by require_client
- [x] 6.2 Register cart router in `backend/app/main.py` with prefix /cart

## 7. Order API router

- [x] 7.1 Create `backend/app/api/v1/orders.py` router with POST /orders (require_client), GET /orders (get_current_user, paginated + optional status filter), GET /orders/{order_id} (get_current_user, ownership/role check), PATCH /orders/{order_id}/status (require_admin), DELETE /orders/{order_id} (require_client, own pending only)
- [x] 7.2 Register orders router in `backend/app/main.py` with prefix /orders

## 8. Backend integration tests

- [x] 8.1 Create `backend/tests/test_cart.py`: test get empty cart, add item, add existing item increments, add exceeding stock 400, add inactive product 404, update item, remove item, clear cart, admin forbidden, unauthenticated 401
- [x] 8.2 Create `backend/tests/test_orders.py`: test create order from cart (stock deducted, cart cleared), empty cart 400, insufficient stock 400, admin cannot create, client lists own orders, admin lists all orders, filter by status, order detail own/other/admin, admin status transitions (valid and invalid), admin cancel restores stock, client cancel own pending, client cancel non-pending 400, delivered cannot be modified
- [x] 8.3 Run all tests and confirm they pass (`uv run pytest`)

## 9. Frontend cart and order services

- [x] 9.1 Create `frontend/src/services/cartService.js` with getCart(token), addItem(productId, quantity, token), updateItem(itemId, quantity, token), removeItem(itemId, token), clearCart(token)
- [x] 9.2 Create `frontend/src/services/orderService.js` with createOrder(token), listOrders(page, size, status, token), getOrder(id, token), updateOrderStatus(id, status, token), cancelOrder(id, token)

## 10. Frontend cart page

- [x] 10.1 Create `frontend/src/pages/cart/CartPage.jsx` with: list of cart items (image, name, unit price, quantity selector via PUT, subtotal, remove button), total at bottom, "Clear cart" button (DELETE /cart), "Confirm order" button (POST /orders then navigate to /orders/:id), empty cart message
- [x] 10.2 Add /cart route to `frontend/src/routes/AppRouter.jsx` as protected route (ProtectedRoute)

## 11. Frontend order pages

- [x] 11.1 Create `frontend/src/pages/orders/OrderHistoryPage.jsx` with paginated order list (date, total, item count, status with color badge), "Cancel" button only for pending, link to detail, optional status filter
- [x] 11.2 Create `frontend/src/pages/orders/OrderDetailPage.jsx` showing items (name, quantity, unit price, subtotal), total, status, created date
- [x] 11.3 Add /orders and /orders/:id routes to `frontend/src/routes/AppRouter.jsx` as protected routes

## 12. Frontend admin order management page

- [x] 12.1 Create `frontend/src/pages/admin/OrderManagementPage.jsx` with all-orders table (client email, date, total, status, status selector showing only valid transitions from current state), status filter dropdown, pagination
- [x] 12.2 Add /admin/orders route to `frontend/src/routes/AppRouter.jsx` as admin route (AdminRoute)

## 13. End-to-end verification

- [ ] 13.1 Run Docker Compose, verify migrations create all tables, verify seed runs correctly with new models present
- [ ] 13.2 Test cart flow via Swagger UI: login as client, add items, update quantity, remove item, clear cart
- [ ] 13.3 Test order flow via Swagger UI: add items to cart, create order, verify stock deducted and cart empty, cancel order, verify stock restored
- [ ] 13.4 Test admin order management via Swagger UI: list all orders, change status through valid transitions, verify invalid transitions rejected
- [ ] 13.5 Test frontend cart page in browser: add items from product detail, verify cart page shows correct data, confirm order
- [ ] 13.6 Test frontend order pages in browser: view order history, see order detail, cancel pending order
- [ ] 13.7 Test admin order management in browser: see all orders, filter by status, change status via dropdown
