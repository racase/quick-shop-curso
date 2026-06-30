## ADDED Requirements

### Requirement: Get cart contents
The system SHALL return the authenticated client's cart including all items with their current price, stock, quantity, subtotal per item, and the overall total.

#### Scenario: Client retrieves an empty cart
- **WHEN** a client sends GET /cart/ with a valid token and has no items in their cart
- **THEN** the system returns 200 with `{"items": [], "total": "0.00"}`

#### Scenario: Client retrieves a cart with items
- **WHEN** a client sends GET /cart/ with a valid token and has items in their cart
- **THEN** the system returns 200 with the list of items including `producto_id`, `nombre`, `precio`, `stock`, `imagen_url`, `cantidad`, and `subtotal`, plus the computed `total`

#### Scenario: Unauthenticated request is rejected
- **WHEN** a request is sent to GET /cart/ without a valid token
- **THEN** the system returns 401

#### Scenario: Admin cannot access cart
- **WHEN** a user with admin role sends GET /cart/
- **THEN** the system returns 403

---

### Requirement: Add item to cart
The system SHALL allow a client to add a product to their cart. If the product is already in the cart, the quantity SHALL be incremented rather than creating a duplicate line.

#### Scenario: New product added successfully
- **WHEN** a client sends POST /cart/items with `{"producto_id": X, "cantidad": N}` for a product not yet in their cart and N <= available stock
- **THEN** the system returns 201 with `{"producto_id": X, "cantidad": N}`

#### Scenario: Existing product quantity incremented
- **WHEN** a client sends POST /cart/items for a product already in their cart and the new total quantity does not exceed stock
- **THEN** the system returns 201 with the updated cumulative quantity

#### Scenario: Quantity exceeds available stock
- **WHEN** the requested quantity plus the current cart quantity for that product exceeds the product's available stock
- **THEN** the system returns 400

#### Scenario: Product not found or inactive
- **WHEN** a client adds a product that does not exist or is inactive
- **THEN** the system returns 404

#### Scenario: Quantity less than 1
- **WHEN** a client sends POST /cart/items with `cantidad` < 1
- **THEN** the system returns 422

---

### Requirement: Update item quantity
The system SHALL allow a client to update the quantity of an existing item in their cart.

#### Scenario: Quantity updated successfully
- **WHEN** a client sends PUT /cart/items/{producto_id} with a valid quantity not exceeding stock
- **THEN** the system returns 200 with `{"producto_id": X, "cantidad": N}`

#### Scenario: Quantity exceeds stock
- **WHEN** the new quantity exceeds the product's available stock
- **THEN** the system returns 400

#### Scenario: Item not in cart
- **WHEN** a client tries to update a product not present in their cart
- **THEN** the system returns 404

#### Scenario: Quantity less than 1
- **WHEN** a client sends PUT /cart/items/{producto_id} with `cantidad` < 1
- **THEN** the system returns 422

---

### Requirement: Remove item from cart
The system SHALL allow a client to remove a single product from their cart.

#### Scenario: Item removed successfully
- **WHEN** a client sends DELETE /cart/items/{producto_id} for a product in their cart
- **THEN** the system returns 200 with `{"detail": "Item eliminado del carrito"}`

#### Scenario: Item not in cart
- **WHEN** a client tries to remove a product not present in their cart
- **THEN** the system returns 404

---

### Requirement: Clear cart
The system SHALL allow a client to empty their entire cart in a single operation.

#### Scenario: Cart cleared successfully
- **WHEN** a client sends DELETE /cart/ with a valid token
- **THEN** the system returns 200 with `{"detail": "Carrito vaciado"}` and all items are removed

#### Scenario: Clearing an already empty cart
- **WHEN** a client sends DELETE /cart/ and their cart is already empty
- **THEN** the system returns 200 with `{"detail": "Carrito vaciado"}`
