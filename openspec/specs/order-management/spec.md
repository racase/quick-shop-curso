## ADDED Requirements

### Requirement: Create order from cart
The system SHALL allow a client to create an order from their current cart. On success the system SHALL deduct stock for each product, save unit_price at purchase time, clear the cart, and return the created order. If the cart is empty or any product lacks sufficient stock, the order SHALL NOT be created. Admin users SHALL receive HTTP 403.

#### Scenario: Order created successfully
- **WHEN** a POST request is sent to /orders by a client with items in their cart and sufficient stock for all items
- **THEN** the system deducts stock from each product, creates the order with status "pending", clears the cart, and returns HTTP 201 with order details

#### Scenario: Empty cart rejected
- **WHEN** a POST request is sent to /orders by a client with an empty cart
- **THEN** the system returns HTTP 400 with detail "Cart is empty"

#### Scenario: Insufficient stock rejected
- **WHEN** a POST request is sent and a cart item has quantity exceeding the product's available stock
- **THEN** the system returns HTTP 400, no order is created, and no stock is deducted

#### Scenario: Admin access forbidden
- **WHEN** a POST request is sent to /orders by an admin user
- **THEN** the system returns HTTP 403

### Requirement: List orders
The system SHALL return a paginated list of orders. Client users SHALL see only their own orders. Admin users SHALL see all orders in the system. Results SHALL be filterable by status.

#### Scenario: Client sees own orders
- **WHEN** a GET request is sent to /orders by a client
- **THEN** the system returns only orders belonging to that client, paginated

#### Scenario: Admin sees all orders
- **WHEN** a GET request is sent to /orders by an admin
- **THEN** the system returns all orders in the system, paginated

#### Scenario: Filter by status
- **WHEN** a GET request is sent to /orders?status=pending
- **THEN** the system returns only orders with status "pending"

#### Scenario: Pagination defaults
- **WHEN** a GET request is sent to /orders with no query parameters
- **THEN** the system returns page=1, size=20

### Requirement: View order detail
The system SHALL return the full detail of a specific order including all items. Clients SHALL only see their own orders. Admins SHALL see any order.

#### Scenario: Client sees own order
- **WHEN** a GET request is sent to /orders/{order_id} by the order's owner
- **THEN** the system returns HTTP 200 with id, status, total, items (with product_id, product_name, quantity, unit_price, subtotal), and created_at

#### Scenario: Client cannot see another's order
- **WHEN** a GET request is sent to /orders/{order_id} by a client who does not own the order
- **THEN** the system returns HTTP 403

#### Scenario: Admin can see any order
- **WHEN** a GET request is sent to /orders/{order_id} by an admin
- **THEN** the system returns the order regardless of ownership

#### Scenario: Order not found
- **WHEN** a GET request is sent to /orders/{order_id} with a UUID that does not match any order
- **THEN** the system returns HTTP 404

### Requirement: Admin updates order status
The system SHALL allow an admin to change the status of any order, following valid transitions. Invalid transitions SHALL be rejected. Cancelling an order SHALL restore stock to the corresponding products.

#### Scenario: Admin confirms a pending order
- **WHEN** a PATCH request is sent to /orders/{order_id}/status with status="confirmed" by an admin
- **THEN** the system updates the order status to "confirmed" and returns the updated order

#### Scenario: Admin ships a confirmed order
- **WHEN** a PATCH request is sent with status="shipped" on a confirmed order by an admin
- **THEN** the system updates the order status to "shipped"

#### Scenario: Admin delivers a shipped order
- **WHEN** a PATCH request is sent with status="delivered" on a shipped order by an admin
- **THEN** the system updates the order status to "delivered"

#### Scenario: Admin cancels and stock is restored
- **WHEN** an admin cancels an order (pending, confirmed, or shipped) via PATCH with status="cancelled"
- **THEN** the system updates the order status to "cancelled" and restores the stock for all order items

#### Scenario: Invalid status transition rejected
- **WHEN** a PATCH request attempts an invalid transition (e.g., pending -> delivered)
- **THEN** the system returns HTTP 400 with detail specifying the invalid transition

#### Scenario: Terminal state cannot change
- **WHEN** a PATCH request attempts to change status of a delivered or cancelled order
- **THEN** the system returns HTTP 400

#### Scenario: Client cannot update status
- **WHEN** a PATCH request is sent by a client user
- **THEN** the system returns HTTP 403

### Requirement: Client cancels own pending order
The system SHALL allow a client to cancel their own order only if it is in "pending" status. Cancelling SHALL restore stock to all items.

#### Scenario: Client cancels pending order
- **WHEN** a DELETE request is sent to /orders/{order_id} by the order owner and the order is in "pending" status
- **THEN** the system sets status to "cancelled", restores stock, and returns HTTP 200

#### Scenario: Non-pending order cannot be cancelled
- **WHEN** a DELETE request is sent by the owner for an order in "confirmed" status
- **THEN** the system returns HTTP 400 with detail "Only pending orders can be cancelled"

#### Scenario: Non-owner cannot cancel
- **WHEN** a DELETE request is sent by a client who does not own the order
- **THEN** the system returns HTTP 403

### Requirement: Order history page (frontend)
The React application SHALL provide an order history page at /orders accessible to authenticated clients. It SHALL display a paginated list of the user's orders with date, total, item count, and status color-coded.

#### Scenario: Order history displays orders
- **WHEN** an authenticated client navigates to /orders
- **THEN** the page calls GET /orders and renders the list with status badge colors

#### Scenario: Cancel button visible only for pending
- **WHEN** an order has status "pending"
- **THEN** a "Cancel" button is visible; for any other status it is hidden

#### Scenario: Clicking cancel sends delete
- **WHEN** the user clicks "Cancel" on a pending order
- **THEN** the page calls DELETE /orders/{id} and refreshes the list

### Requirement: Order detail page (frontend)
The React application SHALL provide an order detail page at /orders/:id showing the complete order: all items with name, quantity, unit price, and subtotal, plus the order status and total.

#### Scenario: Detail page loads order
- **WHEN** a user navigates to /orders/:id for their own order
- **THEN** the page calls GET /orders/{id} and displays all items and totals

#### Scenario: Non-owner redirected
- **WHEN** a client navigates to another user's order
- **THEN** the page receives HTTP 403 and displays an error

### Requirement: Admin order management page (frontend)
The React application SHALL provide an admin-only page at /admin/orders showing all orders in a table with client email, date, total, status, and a status selector showing only valid transitions from the current state.

#### Scenario: Admin sees all orders table
- **WHEN** an admin navigates to /admin/orders
- **THEN** the page calls GET /orders and renders a table with all orders including client email

#### Scenario: Status filter works
- **WHEN** the admin selects a status filter
- **THEN** the page reloads with the filtered results

#### Scenario: Status change via selector
- **WHEN** the admin selects a new status from the valid transitions dropdown
- **THEN** the page calls PATCH /orders/{id}/status and refreshes the row

### Requirement: Frozen unit price at purchase
The system SHALL store the product price in order_items.unit_price at the time of order creation. Subsequent changes to the product price SHALL NOT affect existing order items.

#### Scenario: Unit price unchanged after product price update
- **WHEN** an admin updates a product's price after an order was created containing that product
- **THEN** the order detail still shows the original unit_price from the time of purchase

### Requirement: Stock restored on cancellation
The system SHALL restore stock (stock += quantity) for all order items when an order is cancelled. Stock SHALL NOT be restored on any other status transition. Stock SHALL NOT be restored if the order is already in "delivered" status (as cancellation is not allowed in that state).

#### Scenario: Stock added back on cancellation
- **WHEN** an order with product A (quantity=3) is cancelled
- **THEN** product A's stock is increased by 3

#### Scenario: Stock not affected by confirmed -> shipped transition
- **WHEN** an order transitions from confirmed to shipped
- **THEN** no product stock values change
