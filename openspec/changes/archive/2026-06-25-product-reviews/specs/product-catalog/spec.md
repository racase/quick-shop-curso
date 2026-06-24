## MODIFIED Requirements

### Requirement: Public product detail
The system SHALL return the full detail of a single active product at GET /products/{product_id} with no authentication required. If the product does not exist or is inactive, the system SHALL return 404. The response SHALL include average_rating (numeric, 1 decimal) and rating_count (integer) fields representing the product's rating statistics.

#### Scenario: Active product returned
- **WHEN** a GET request is sent to /products/{product_id} for a product with is_active=true
- **THEN** the system returns HTTP 200 with id, name, description, price, stock, image_url, is_active, average_rating, and rating_count

#### Scenario: Product with no reviews
- **WHEN** a product has no reviews
- **THEN** average_rating is 0.0 and rating_count is 0

#### Scenario: Inactive product returns 404
- **WHEN** a GET request is sent to /products/{product_id} for a product with is_active=false
- **THEN** the system returns HTTP 404
