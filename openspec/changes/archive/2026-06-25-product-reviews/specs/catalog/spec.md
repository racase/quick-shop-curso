## MODIFIED Requirements

### Requirement: Product catalog page (frontend)
The React application SHALL provide a public product catalog at / (index route). It SHALL display products in a responsive grid with image, name, price, and a stock indicator. It SHALL include a search bar and pagination controls. The "Add to cart" button SHALL be disabled if stock=0 or if the user is not an authenticated client. Each product card SHALL display the average rating as stars (1-5) and the total number of reviews. If a product has no reviews, no stars SHALL be displayed.

#### Scenario: Products displayed in grid
- **WHEN** any visitor navigates to /
- **THEN** the page calls GET /products and renders product cards in a responsive grid

#### Scenario: Product card shows rating stars
- **WHEN** a product has average_rating > 0
- **THEN** the product card displays star icons representing the rating (e.g., 4.2 shows 4 full stars and 1 partial star)

#### Scenario: Product card shows review count
- **WHEN** a product has rating_count > 0
- **THEN** the product card displays the number of reviews in parentheses (e.g., "(15)")

#### Scenario: Product with no reviews
- **WHEN** a product has rating_count = 0
- **THEN** no stars or review count are displayed

#### Scenario: Add to cart disabled for unauthenticated user
- **WHEN** the visitor is not logged in
- **THEN** the "Add to cart" button is disabled or hidden

#### Scenario: Add to cart disabled when stock is zero
- **WHEN** a product has stock=0
- **THEN** the "Add to cart" button for that product is disabled
