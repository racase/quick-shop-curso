## ADDED Requirements

### Requirement: Authenticated user can view own profile
The system SHALL return the full profile of the currently authenticated user at GET /users/me. The response SHALL include id, email, full_name, role, is_active, and created_at.

#### Scenario: Client views own profile
- **WHEN** a GET request is sent to /users/me with a valid Bearer token
- **THEN** the system returns HTTP 200 with the user's profile data

#### Scenario: Unauthenticated request rejected
- **WHEN** a GET request is sent to /users/me with no Authorization header
- **THEN** the system returns HTTP 403

### Requirement: Authenticated user can update own profile
The system SHALL allow an authenticated user to update their full_name and/or password via PUT /users/me. The email field SHALL NOT be modifiable. When a new password is provided it SHALL be validated for complexity and stored as a bcrypt hash.

#### Scenario: Update full_name
- **WHEN** a PUT request is sent to /users/me with a valid token and body `{"full_name": "New Name"}`
- **THEN** the system persists the new name and returns HTTP 200 with the updated profile

#### Scenario: Update password
- **WHEN** a PUT request is sent to /users/me with a valid token and body `{"password": "NewPass1!"}`
- **THEN** the system stores the new bcrypt hash and the old password no longer authenticates the user

#### Scenario: Email update not allowed
- **WHEN** a PUT request is sent to /users/me with a body containing an `email` field
- **THEN** the system ignores the email field and does not change the stored email

### Requirement: Admin can list all users
The system SHALL provide a paginated list of all users at GET /users, accessible only to users with role=admin. The default page size SHALL be 20 with a maximum of 100.

#### Scenario: Admin lists users
- **WHEN** a GET request is sent to /users with a valid admin token
- **THEN** the system returns HTTP 200 with items, total, page, and size

#### Scenario: Client access forbidden
- **WHEN** a GET request is sent to /users with a valid client token
- **THEN** the system returns HTTP 403

#### Scenario: Pagination applied
- **WHEN** a GET request is sent to /users?page=2&size=10
- **THEN** the system returns items offset by 10, with page=2 and size=10 in the response

### Requirement: Admin can view any user's detail
The system SHALL return the profile of a specific user at GET /users/{user_id}, accessible only to admins. The endpoint SHALL return 404 if the user does not exist.

#### Scenario: Admin views user detail
- **WHEN** a GET request is sent to /users/{user_id} with a valid admin token and a user that exists
- **THEN** the system returns HTTP 200 with the user's full profile

#### Scenario: User not found
- **WHEN** a GET request is sent to /users/{user_id} with a UUID that does not match any user
- **THEN** the system returns HTTP 404

### Requirement: User profile page (frontend)
The React application SHALL provide a profile page at /profile accessible only to authenticated users. It SHALL display the user's full_name, email, and role, and include a form to update full_name and password.

#### Scenario: Profile data loaded on mount
- **WHEN** an authenticated user navigates to /profile
- **THEN** the page calls GET /users/me and pre-fills the form with the current full_name

#### Scenario: Successful update shows confirmation
- **WHEN** the user submits a valid update
- **THEN** the page calls PUT /users/me and displays a success message on HTTP 200

### Requirement: Admin user list page (frontend)
The React application SHALL provide an admin-only page at /admin/users that displays a paginated table of all users with columns: full_name, email, role, is_active, created_at.

#### Scenario: Admin page loads user list
- **WHEN** an admin navigates to /admin/users
- **THEN** the page calls GET /users and renders the results in a table

#### Scenario: Non-admin redirected
- **WHEN** a client user navigates to /admin/users
- **THEN** the AdminRoute component redirects them to /
