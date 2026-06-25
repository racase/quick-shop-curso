## MODIFIED Requirements

### Requirement: Admin product management page (frontend)
The React application SHALL provide an admin-only page at /admin/products showing all products (active and inactive) in a table with actions to edit and deactivate each product, and a button to create a new product. Create and edit forms SHALL be presented in a modal or dedicated section. The product creation form SHALL include a button labeled "Crear producto con IA" that opens a prompt input dialog; upon submission the form SHALL call `POST /api/v1/products/ai-generate` and pre-fill all form fields with the returned values, allowing the admin to review and edit before saving. While the AI generation request is in progress the button SHALL show a loading state and be disabled.

#### Scenario: Admin table shows all products
- **WHEN** an admin navigates to /admin/products
- **THEN** the page calls GET /admin/products and renders all products including inactive ones

#### Scenario: Deactivate action calls DELETE
- **WHEN** the admin clicks Deactivate for a product
- **THEN** the page calls DELETE /products/{id} and refreshes the list

#### Scenario: AI generation button opens prompt dialog
- **WHEN** the admin clicks "Crear producto con IA" in the product creation form
- **THEN** a dialog or inline input appears asking for a product description in natural language

#### Scenario: Form pre-filled after AI generation
- **WHEN** the admin enters a description and confirms the AI generation dialog
- **THEN** the system calls `POST /api/v1/products/ai-generate` and upon success populates the form fields (name, description, price, stock, image_url) with the returned values

#### Scenario: Loading state during AI generation
- **WHEN** the AI generation request is in flight
- **THEN** the "Crear producto con IA" button is disabled and shows a loading indicator (spinner or text)

#### Scenario: Error feedback on AI generation failure
- **WHEN** the AI generation request returns an error (4xx or 5xx)
- **THEN** the form displays an error message and the fields remain unchanged, allowing the admin to retry or fill manually

#### Scenario: Admin can edit pre-filled fields before saving
- **WHEN** the form fields are pre-filled from AI generation
- **THEN** all fields remain editable and the admin can modify any value before clicking the save/create button
