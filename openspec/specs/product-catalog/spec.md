# product-catalog Specification

## Purpose
TBD - created by archiving change auth-users-products. Update Purpose after archive.
## Requirements
### Requirement: Public product listing
The system SHALL return a paginated list of active products at GET /products with no authentication required. Products with is_active=false SHALL be excluded. The endpoint SHALL support optional search filtering by name or description (case-insensitive substring match) and pagination via page and size query parameters.

#### Scenario: Public catalog returns active products
- **WHEN** a GET request is sent to /products with no token
- **THEN** the system returns HTTP 200 with items (only is_active=true), total, page, and size

#### Scenario: Search filters results
- **WHEN** a GET request is sent to /products?search=laptop
- **THEN** the system returns only products whose name or description contains "laptop" (case-insensitive)

#### Scenario: Inactive products excluded
- **WHEN** a product has is_active=false
- **THEN** it does not appear in the GET /products response

### Requirement: Public product detail
The system SHALL return the full detail of a single active product at GET /products/{product_id} with no authentication required. If the product does not exist or is inactive, the system SHALL return 404.

#### Scenario: Active product returned
- **WHEN** a GET request is sent to /products/{product_id} for a product with is_active=true
- **THEN** the system returns HTTP 200 with id, name, description, price, stock, image_url, is_active

#### Scenario: Inactive product returns 404
- **WHEN** a GET request is sent to /products/{product_id} for a product with is_active=false
- **THEN** the system returns HTTP 404

### Requirement: Admin creates product
The system SHALL allow admin users to create a new product via POST /products. All fields (name, description, price, stock, image_url) are required. Price SHALL be a positive decimal; stock SHALL be a non-negative integer.

#### Scenario: Admin creates product
- **WHEN** a POST request is sent to /products with a valid admin token and all required fields
- **THEN** the system returns HTTP 201 with the created product including its generated UUID and is_active=true

#### Scenario: Client cannot create product
- **WHEN** a POST request is sent to /products with a valid client token
- **THEN** the system returns HTTP 403

#### Scenario: Negative price rejected
- **WHEN** the price field is 0 or negative
- **THEN** the system returns HTTP 422

### Requirement: Admin updates product
The system SHALL allow admin users to update any field of an existing product via PUT /products/{product_id}. All fields in the request body are optional; only provided fields are updated.

#### Scenario: Admin updates name and price
- **WHEN** a PUT request is sent to /products/{product_id} with valid admin token and body `{"name": "New Name", "price": "29.99"}`
- **THEN** the system persists the changes and returns HTTP 200 with the updated product

#### Scenario: Product not found
- **WHEN** a PUT request is sent to /products/{product_id} with a UUID that does not match any product
- **THEN** the system returns HTTP 404

### Requirement: Admin soft-deletes product
The system SHALL allow admin users to deactivate a product via DELETE /products/{product_id}. The product SHALL NOT be removed from the database; its is_active field SHALL be set to false. The endpoint SHALL return 204 on success.

#### Scenario: Admin deactivates product
- **WHEN** a DELETE request is sent to /products/{product_id} with a valid admin token
- **THEN** the system sets is_active=false on the product and returns HTTP 204

#### Scenario: Deactivated product hidden from public catalog
- **WHEN** a product is deactivated
- **THEN** GET /products no longer includes it in the results

### Requirement: Admin product list including inactive
The system SHALL provide an admin-only endpoint at GET /admin/products that returns all products regardless of is_active status, with the same pagination and search parameters as GET /products.

#### Scenario: Admin sees inactive products
- **WHEN** a GET request is sent to /admin/products with a valid admin token
- **THEN** the response includes both active and inactive products

#### Scenario: Client access forbidden
- **WHEN** a GET request is sent to /admin/products with a client token
- **THEN** the system returns HTTP 403

### Requirement: Price always has 2 decimal places
The system SHALL store and return product prices as NUMERIC(10,2). The API response SHALL always serialize price as a string with exactly 2 decimal places (e.g., "10.99", not "10.9" or 10.99).

#### Scenario: Price serialized as 2-decimal string
- **WHEN** a product with price=10.9 is retrieved
- **THEN** the price field in the JSON response is "10.90"

### Requirement: Stock never negative
The system SHALL enforce a CHECK constraint on the products table: stock >= 0. Attempts to set a negative stock SHALL be rejected.

#### Scenario: Negative stock rejected at creation
- **WHEN** a POST /products request includes stock=-1
- **THEN** the system returns HTTP 422

### Requirement: Product catalog page (frontend)
The React application SHALL provide a public product catalog at / (index route). It SHALL display products in a responsive grid with image, name, price, and a stock indicator. It SHALL include a search bar and pagination controls. The "Add to cart" button SHALL be disabled if stock=0 or if the user is not an authenticated client.

#### Scenario: Products displayed in grid
- **WHEN** any visitor navigates to /
- **THEN** the page calls GET /products and renders product cards in a responsive grid

#### Scenario: Add to cart disabled for unauthenticated user
- **WHEN** the visitor is not logged in
- **THEN** the "Add to cart" button is disabled or hidden

#### Scenario: Add to cart disabled when stock is zero
- **WHEN** a product has stock=0
- **THEN** the "Add to cart" button for that product is disabled

### Requirement: Product detail page (frontend)
The React application SHALL provide a public product detail page at /products/:id showing a large image, full description, price, available stock, and an "Add to cart" button with a quantity selector (max value = available stock).

#### Scenario: Detail page loads product
- **WHEN** a user navigates to /products/:id
- **THEN** the page calls GET /products/{id} and displays all product fields

#### Scenario: Quantity selector bounded by stock
- **WHEN** the product has stock=3
- **THEN** the quantity selector maximum is 3

### Requirement: Admin product management page (frontend)
The React application SHALL provide an admin-only page at /admin/products showing all products (active and inactive) in a table with actions to edit and deactivate each product, and a button to create a new product. Create and edit forms SHALL be presented in a modal or dedicated section.

#### Scenario: Admin table shows all products
- **WHEN** an admin navigates to /admin/products
- **THEN** the page calls GET /admin/products and renders all products including inactive ones

#### Scenario: Deactivate action calls DELETE
- **WHEN** the admin clicks Deactivate for a product
- **THEN** the page calls DELETE /products/{id} and refreshes the list

### Requirement: Seed creates 20 products
The seed script SHALL create exactly 20 products with realistic names, descriptions, prices greater than 0, stock values between 0 and 100, and image URLs in the format https://picsum.photos/seed/quickshop-{N}/400/300 where N is 1 through 20. The seed SHALL be idempotent: if products already exist it SHALL not insert duplicates.

#### Scenario: Seed is idempotent
- **WHEN** the seed runs a second time with products already in the database
- **THEN** no duplicate products are inserted

#### Scenario: Seed creates 20 products on first run
- **WHEN** the database has no products
- **THEN** the seed inserts exactly 20 product rows

