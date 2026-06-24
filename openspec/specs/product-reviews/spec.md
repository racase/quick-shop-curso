# product-reviews Specification

## Purpose
Allow authenticated clients to rate and review products they have purchased, providing social proof and feedback for the product catalog.

## Requirements

### Requirement: Users can create product reviews
The system SHALL allow authenticated clients to create reviews for products they have purchased (orders with status "delivered"). Each client can only create one review per product.

#### Scenario: Client creates a valid review
- **WHEN** an authenticated client sends POST /products/{product_id}/reviews with rating (1-5) and optional comment
- **THEN** the system creates the review and returns 201 with the complete review object

#### Scenario: Client tries to review same product twice
- **WHEN** an authenticated client sends POST /products/{product_id}/reviews for a product they already reviewed
- **THEN** the system returns 400 with error "el usuario ya ha valorado este producto"

#### Scenario: Client tries to review without purchase
- **WHEN** an authenticated client sends POST /products/{product_id}/reviews for a product they haven't purchased
- **THEN** the system returns 400 with error "el producto no existe o esta inactivo"

#### Scenario: Unauthenticated user tries to create review
- **WHEN** an unauthenticated user sends POST /products/{product_id}/reviews
- **THEN** the system returns 401

#### Scenario: Admin tries to create review
- **WHEN** an authenticated admin sends POST /products/{product_id}/reviews
- **THEN** the system returns 403

### Requirement: Users can update their reviews
The system SHALL allow clients to update their own reviews (rating and comment).

#### Scenario: Client updates own review
- **WHEN** an authenticated client sends PUT /reviews/{review_id} with new rating and/or comment
- **THEN** the system updates the review and returns 200 with the updated review object

#### Scenario: Client tries to update another user's review
- **WHEN** an authenticated client sends PUT /reviews/{review_id} for a review they don't own
- **THEN** the system returns 403

### Requirement: Users can delete their reviews
The system SHALL allow clients to delete their own reviews. Admins can delete any review.

#### Scenario: Client deletes own review
- **WHEN** an authenticated client sends DELETE /reviews/{review_id} for their own review
- **THEN** the system deletes the review and returns 204

#### Scenario: Admin deletes any review
- **WHEN** an authenticated admin sends DELETE /reviews/{review_id}
- **THEN** the system deletes the review and returns 204

#### Scenario: Client tries to delete another user's review
- **WHEN** an authenticated client sends DELETE /reviews/{review_id} for a review they don't own
- **THEN** the system returns 403

### Requirement: System calculates average rating
The system SHALL calculate and return the average rating and total count for each product.

#### Scenario: Get product rating statistics
- **WHEN** a user sends GET /products/{product_id}/rating
- **THEN** the system returns average_rating, rating_count, and rating_distribution (count of reviews per rating 1-5)

#### Scenario: Product with no reviews
- **WHEN** a user sends GET /products/{product_id}/rating for a product with no reviews
- **THEN** the system returns average_rating: 0, rating_count: 0, and distribution with all zeros

### Requirement: Reviews are listed with pagination
The system SHALL list reviews for a product with pagination, sorted by creation date (newest first).

#### Scenario: Get paginated reviews
- **WHEN** a user sends GET /products/{product_id}/reviews with page and size parameters
- **THEN** the system returns paginated reviews with total count, average_rating, and rating_count

### Requirement: Product detail includes rating info
The system SHALL include average_rating and rating_count in the product detail response.

#### Scenario: Get product with rating
- **WHEN** a user sends GET /products/{product_id}
- **THEN** the response includes average_rating and rating_count fields

### Requirement: Rating validation
The system SHALL validate that rating is an integer between 1 and 5 inclusive.

#### Scenario: Invalid rating value
- **WHEN** a user sends POST or PUT with rating < 1 or rating > 5
- **THEN** the system returns 400 with validation error

### Requirement: Comment length validation
The system SHALL validate that comment does not exceed 1000 characters.

#### Scenario: Comment too long
- **WHEN** a user sends POST or PUT with comment > 1000 characters
- **THEN** the system returns 400 with validation error
