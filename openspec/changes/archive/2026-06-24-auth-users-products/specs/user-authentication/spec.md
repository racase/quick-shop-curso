## ADDED Requirements

### Requirement: User registration
The system SHALL allow any visitor to create a new account by providing a unique email, a valid password, and a full name. The registered user SHALL always receive the `client` role. Passwords SHALL be hashed with bcrypt before storage; plain-text passwords SHALL never be persisted.

#### Scenario: Successful registration
- **WHEN** a POST request is sent to /auth/register with a valid email, password (min 8 chars, at least 1 uppercase, at least 1 digit), and full_name (min 2 chars)
- **THEN** the system creates the user with role=client and returns HTTP 201 with id, email, full_name, and role

#### Scenario: Duplicate email rejected
- **WHEN** a POST request is sent to /auth/register with an email that already exists in the database
- **THEN** the system returns HTTP 409 and does not create a new user

#### Scenario: Invalid password rejected
- **WHEN** a POST request is sent to /auth/register with a password shorter than 8 characters or missing uppercase/digit
- **THEN** the system returns HTTP 422 with validation error details

### Requirement: User login with JWT
The system SHALL authenticate users by email and password and return a signed JWT access token. The token SHALL be valid for exactly the number of minutes configured in ACCESS_TOKEN_EXPIRE_MINUTES (default 120). Tokens SHALL be signed with HS256 using the application's SECRET_KEY.

#### Scenario: Successful login
- **WHEN** a POST request is sent to /auth/login with a valid email and matching password
- **THEN** the system returns HTTP 200 with access_token (JWT string) and token_type="bearer"

#### Scenario: Wrong password rejected
- **WHEN** a POST request is sent to /auth/login with a valid email but incorrect password
- **THEN** the system returns HTTP 401

#### Scenario: Unknown email rejected
- **WHEN** a POST request is sent to /auth/login with an email that does not exist in the database
- **THEN** the system returns HTTP 401

### Requirement: Authenticated user identity
The system SHALL provide an endpoint that returns the identity of the currently authenticated user from their JWT token. The endpoint SHALL reject requests with missing, expired, or malformed tokens.

#### Scenario: Valid token returns user data
- **WHEN** a GET request is sent to /auth/me with a valid Bearer token
- **THEN** the system returns HTTP 200 with id, email, full_name, role, and is_active

#### Scenario: Missing token rejected
- **WHEN** a GET request is sent to /auth/me with no Authorization header
- **THEN** the system returns HTTP 403

#### Scenario: Expired token rejected
- **WHEN** a GET request is sent to /auth/me with a token whose exp claim is in the past
- **THEN** the system returns HTTP 401

### Requirement: Password complexity validation
The system SHALL enforce password complexity at registration time using Pydantic field validators. The password SHALL contain at least 8 characters, at least one uppercase letter, and at least one digit.

#### Scenario: Password too short
- **WHEN** the password field contains fewer than 8 characters
- **THEN** Pydantic raises a validation error before the request reaches the database

#### Scenario: Password meets complexity
- **WHEN** the password contains 8+ chars, at least 1 uppercase letter, and at least 1 digit
- **THEN** the validator passes and the request proceeds

### Requirement: Login page (frontend)
The React application SHALL provide a login page at /login with email and password fields. On successful login the application SHALL store the token in React state and navigate the user to the product catalog. On failure the page SHALL display an error message.

#### Scenario: Login redirects to catalog
- **WHEN** the user submits valid credentials on the login page
- **THEN** the application calls POST /auth/login, then GET /auth/me, stores user and token in AuthContext, and navigates to /

#### Scenario: Login error displayed
- **WHEN** the server returns 401
- **THEN** the login page displays "Credenciales incorrectas" without redirecting

### Requirement: Register page (frontend)
The React application SHALL provide a registration page at /register with fields for full_name, email, password, and password confirmation. Client-side validation SHALL run before submission. On success the page SHALL navigate to /login.

#### Scenario: Passwords must match
- **WHEN** the user submits the form with password and password confirmation that do not match
- **THEN** a client-side error is shown and no network request is made

#### Scenario: Successful registration navigates to login
- **WHEN** the server returns 201
- **THEN** the application navigates to /login
