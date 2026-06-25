## ADDED Requirements

### Requirement: View cart
The system SHALL return the authenticated client's cart with all items, subtotals, and total. If no cart exists yet, it SHALL return an empty cart. Admin users SHALL receive HTTP 403.

#### Scenario: Empty cart for new client
- **WHEN** a GET request is sent to /cart by an authenticated client who has never added items
- **THEN** the system returns HTTP 200 with items=[], total="0.00", item_count=0

#### Scenario: Cart with items returns calculated totals
- **WHEN** a GET request is sent to /cart by a client who has items in their cart
- **THEN** the system returns each item with id, product (id, name, price, stock, image_url), quantity, subtotal (quantity * price) and the overall total sum and item_count

#### Scenario: Admin access forbidden
- **WHEN** a GET request is sent to /cart by an admin user
- **THEN** the system returns HTTP 403

#### Scenario: Unauthenticated access forbidden
- **WHEN** a GET request is sent to /cart without a valid token
- **THEN** the system returns HTTP 401

### Requirement: Add item to cart
The system SHALL allow a client to add a product to their cart. If the product is already in the cart, the quantity SHALL be incremented. The requested quantity (existing + new) SHALL NOT exceed available stock. The product SHALL exist and be active.

#### Scenario: Add new product to empty cart
- **WHEN** a POST request is sent to /cart/items with a valid product_id and quantity=2
- **THEN** the cart is created if needed, the item is added, and the system returns HTTP 201 with the updated cart

#### Scenario: Increment quantity of existing item
- **WHEN** a POST request is sent to /cart/items for a product already in the cart with quantity=1
- **THEN** the existing item quantity is incremented by 1 and the updated cart is returned

#### Scenario: Quantity exceeds stock
- **WHEN** a POST request is sent with quantity that makes total (existing + new) > product stock
- **THEN** the system returns HTTP 400 with detail "Insufficient stock"

#### Scenario: Product not found or inactive
- **WHEN** a POST request is sent with a product_id that does not exist or has is_active=false
- **THEN** the system returns HTTP 404

#### Scenario: Admin access forbidden
- **WHEN** a POST request is sent to /cart/items by an admin user
- **THEN** the system returns HTTP 403

### Requirement: Update cart item quantity
The system SHALL allow a client to update the quantity of an item in their cart. The new quantity SHALL NOT exceed available stock. The item SHALL belong to the authenticated user's cart.

#### Scenario: Update item quantity
- **WHEN** a PUT request is sent to /cart/items/{item_id} with quantity=5
- **THEN** the item quantity is updated to 5 and the updated cart is returned

#### Scenario: Quantity exceeds stock
- **WHEN** a PUT request is sent with quantity > product stock
- **THEN** the system returns HTTP 400 with detail "Insufficient stock"

#### Scenario: Item does not belong to user's cart
- **WHEN** a PUT request is sent to /cart/items/{item_id} where the item belongs to another user's cart
- **THEN** the system returns HTTP 403

#### Scenario: Item not found
- **WHEN** a PUT request is sent to /cart/items/{item_id} that does not exist
- **THEN** the system returns HTTP 404

### Requirement: Remove item from cart
The system SHALL allow a client to remove a specific item from their cart. The item SHALL belong to the authenticated user's cart.

#### Scenario: Remove item from cart
- **WHEN** a DELETE request is sent to /cart/items/{item_id}
- **THEN** the item is removed and the updated cart is returned

#### Scenario: Item does not belong to user's cart
- **WHEN** a DELETE request is sent to /cart/items/{item_id} where the item belongs to another user's cart
- **THEN** the system returns HTTP 403

#### Scenario: Item not found
- **WHEN** a DELETE request is sent to /cart/items/{item_id} that does not exist
- **THEN** the system returns HTTP 404

### Requirement: Clear cart
The system SHALL allow a client to remove all items from their cart while preserving the cart record.

#### Scenario: Clear cart with items
- **WHEN** a DELETE request is sent to /cart by a client with items in their cart
- **THEN** all cart_items are deleted and the system returns HTTP 200 with items=[], total="0.00", item_count=0

#### Scenario: Admin access forbidden
- **WHEN** a DELETE request is sent to /cart by an admin user
- **THEN** the system returns HTTP 403

### Requirement: Cart persistence
The system SHALL persist cart data across sessions. The cart and its items SHALL remain in the database even after the user logs out and logs back in.

#### Scenario: Cart survives logout/login
- **WHEN** a client adds items to their cart, logs out, and logs back in
- **THEN** GET /cart returns the same items with the same quantities

### Requirement: Cart totals calculated server-side
The system SHALL calculate all monetary values (subtotal per item, overall total) on the server. The frontend SHALL display values received from the API without recalculating them.

#### Scenario: Subtotal uses exact product price
- **WHEN** a cart has an item with quantity=3 and the product price is "19.99"
- **THEN** the item subtotal is "59.97" (3 * 19.99)

### Requirement: Cart page (frontend)
The React application SHALL provide a cart page at /cart accessible only to authenticated clients. It SHALL display all cart items with thumbnail, name, unit price, quantity selector, subtotal, and a remove button. It SHALL show the total at the bottom with "Clear cart" and "Confirm order" buttons.

#### Scenario: Cart page loads items
- **WHEN** an authenticated client navigates to /cart
- **THEN** the page calls GET /cart and renders all items with correct subtotals and total

#### Scenario: Empty cart message
- **WHEN** the cart has no items
- **THEN** the page displays an informative empty-cart message and no "Confirm order" button

#### Scenario: Quantity change via selector
- **WHEN** the user changes the quantity of an item via the selector
- **THEN** the page calls PUT /cart/items/{id} and re-renders with updated values

#### Scenario: Remove item via button
- **WHEN** the user clicks the remove button for an item
- **THEN** the page calls DELETE /cart/items/{id} and removes the item from the display

#### Scenario: Clear cart via button
- **WHEN** the user clicks "Clear cart"
- **THEN** the page calls DELETE /cart, clears all items, and shows the empty cart state

#### Scenario: Confirm order redirects
- **WHEN** the user clicks "Confirm order" with items in the cart
- **THEN** the page calls POST /orders and navigates to the order detail page on success
