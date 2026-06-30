### Requirement: Create order from cart
The system SHALL allow an authenticated client to place an order from their current cart. On success, the stock of each product SHALL be decremented by the ordered quantity, the cart SHALL be cleared, and the order SHALL be recorded with status `pendiente`. The price of each product at the moment of creation SHALL be captured in the order item.

#### Scenario: Order created successfully
- **WHEN** a client sends POST /orders/ with a valid token and a non-empty cart with sufficient stock for all items
- **THEN** the system returns 201 with the full order including `id`, `usuario_id`, `estado: "pendiente"`, `items` (with `producto_id`, `nombre`, `cantidad`, `precio_unitario`, `subtotal`), `total`, and `created_at`
- **AND** each product's stock is decremented by the ordered quantity
- **AND** the client's cart is emptied

#### Scenario: Cart is empty
- **WHEN** a client sends POST /orders/ but their cart is empty
- **THEN** the system returns 400

#### Scenario: Insufficient stock at order time
- **WHEN** stock for one or more products in the cart has dropped below the cart quantity since the item was added
- **THEN** the system returns 400

#### Scenario: Unauthenticated request
- **WHEN** POST /orders/ is called without a valid token
- **THEN** the system returns 401

---

### Requirement: List orders
The system SHALL return a list of orders. A client SHALL see only their own orders; an admin SHALL see all orders in the system.

#### Scenario: Client lists their orders
- **WHEN** a client sends GET /orders/ with a valid token
- **THEN** the system returns 200 with only that client's orders, each including `id`, `usuario_id`, `estado`, `total`, and `created_at`

#### Scenario: Admin lists all orders
- **WHEN** an admin sends GET /orders/ with a valid token
- **THEN** the system returns 200 with all orders in the system

#### Scenario: Unauthenticated request
- **WHEN** GET /orders/ is called without a valid token
- **THEN** the system returns 401

---

### Requirement: Get order detail
The system SHALL return the full detail of a single order including all items. A client SHALL only access their own orders; an admin SHALL access any order.

#### Scenario: Client retrieves own order
- **WHEN** a client sends GET /orders/{id} for an order that belongs to them
- **THEN** the system returns 200 with full order detail (same schema as POST response)

#### Scenario: Client tries to access another client's order
- **WHEN** a client sends GET /orders/{id} for an order that belongs to another user
- **THEN** the system returns 403

#### Scenario: Admin retrieves any order
- **WHEN** an admin sends GET /orders/{id} for any order
- **THEN** the system returns 200 with full order detail

#### Scenario: Order not found
- **WHEN** GET /orders/{id} is called with an id that does not exist
- **THEN** the system returns 404

---

### Requirement: Admin updates order status
The system SHALL allow an admin to transition an order's status. Valid target states are `confirmado`, `enviado`, and `cancelado`. When transitioning to `cancelado`, the stock of all order items SHALL be restored.

#### Scenario: Successful status transition
- **WHEN** an admin sends PATCH /orders/{id}/status with a valid target state
- **THEN** the system returns 200 with the updated order

#### Scenario: Transition to cancelled restores stock
- **WHEN** an admin transitions an order from `pendiente`, `confirmado`, or `enviado` to `cancelado`
- **THEN** each product's stock is incremented by the ordered quantity

#### Scenario: Invalid transition (terminal state)
- **WHEN** an admin tries to change the status of an already `cancelado` order
- **THEN** the system returns 400

#### Scenario: Non-admin user attempts status update
- **WHEN** a client sends PATCH /orders/{id}/status
- **THEN** the system returns 403

#### Scenario: Order not found
- **WHEN** PATCH /orders/{id}/status is called with a non-existent id
- **THEN** the system returns 404

---

### Requirement: Client cancels own pending order
The system SHALL allow a client to cancel their own order if and only if it is in `pendiente` status. On cancellation, the stock of all order items SHALL be restored.

#### Scenario: Client cancels pending order
- **WHEN** a client sends PATCH /orders/{id}/cancel for their own order in `pendiente` status
- **THEN** the system returns 200 with the order showing `estado: "cancelado"`
- **AND** each product's stock is restored

#### Scenario: Order not in pending status
- **WHEN** a client tries to cancel an order not in `pendiente` status
- **THEN** the system returns 400

#### Scenario: Client tries to cancel another user's order
- **WHEN** a client sends PATCH /orders/{id}/cancel for an order that does not belong to them
- **THEN** the system returns 403

#### Scenario: Order not found
- **WHEN** PATCH /orders/{id}/cancel is called with a non-existent id
- **THEN** the system returns 404
