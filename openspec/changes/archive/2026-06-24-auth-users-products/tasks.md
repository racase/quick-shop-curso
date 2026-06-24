## 1. Backend project bootstrap

- [x] 1.1 Create backend/pyproject.toml with all dependencies (fastapi, uvicorn[standard], sqlalchemy, asyncpg, alembic, pydantic-settings, python-jose[cryptography], bcrypt, email-validator) and dev dependencies (pytest, pytest-asyncio, httpx)
- [x] 1.2 Create backend/app/__init__.py and all package __init__.py files (api/, api/v1/, core/, db/, models/, schemas/, services/, seed/)
- [x] 1.3 Create backend/app/core/config.py with Pydantic Settings (database_url, secret_key, access_token_expire_minutes, cors_origins)
- [x] 1.4 Create backend/app/db/base.py with DeclarativeBase
- [x] 1.5 Create backend/app/db/session.py with async engine and async_session_maker
- [x] 1.6 Create backend/app/core/security.py with hash_password, verify_password (bcrypt direct), create_access_token, verify_token (python-jose HS256)
- [x] 1.7 Create backend/app/core/dependencies.py with get_db, get_current_user, require_admin, require_client
- [x] 1.8 Create backend/app/main.py with FastAPI app, CORS middleware, lifespan (alembic upgrade head + seed), and include all routers
- [x] 1.9 Initialize Alembic: create alembic.ini and alembic/env.py importing all models for autogenerate
- [x] 1.10 Create backend/Dockerfile (multi-stage with uv)
- [x] 1.11 Create backend/.env.example
- [x] 1.12 Create docker-compose.yml with db (postgres:15), backend, and frontend services

## 2. User model and migration

- [x] 2.1 Create backend/app/models/user.py with User model (id UUID, email, hashed_password, full_name, role UserRole enum, is_active, created_at, updated_at)
- [x] 2.2 Create UserRole Python Enum (client, admin) and SQLAlchemy ENUM type mapping
- [x] 2.3 Generate Alembic migration for users table (autogenerate)
- [x] 2.4 Verify generated migration creates users table and UserRole enum type correctly

## 3. Authentication backend

- [x] 3.1 Create backend/app/schemas/auth.py with RegisterRequest (email EmailStr, password str with complexity validator, full_name str), LoginRequest, TokenResponse, UserPublic
- [x] 3.2 Create backend/app/services/auth_service.py with register(db, data) and authenticate(db, email, password) functions
- [x] 3.3 Create backend/app/api/v1/auth.py router with POST /auth/register (201), POST /auth/login (200), GET /auth/me (200)
- [x] 3.4 Register auth router in main.py with prefix /auth

## 4. Users backend

- [x] 4.1 Create backend/app/schemas/user.py with UserResponse (id, email, full_name, role, is_active, created_at), UserUpdate (full_name optional, password optional), PaginatedUsers
- [x] 4.2 Create backend/app/services/user_service.py with get_by_id, get_by_email, update_me, list_users functions
- [x] 4.3 Create backend/app/api/v1/users.py router with GET /users/me, PUT /users/me, GET /users (admin), GET /users/{user_id} (admin)
- [x] 4.4 Register users router in main.py with prefix /users

## 5. Product model and migration

- [x] 5.1 Create backend/app/models/product.py with Product model (id UUID, name, description, price NUMERIC(10,2), stock, image_url, is_active, created_at, updated_at) with CHECK constraints
- [x] 5.2 Generate Alembic migration for products table (autogenerate)
- [x] 5.3 Verify generated migration includes price > 0 and stock >= 0 CHECK constraints

## 6. Products backend

- [x] 6.1 Create backend/app/schemas/product.py with ProductCreate, ProductUpdate (all optional), ProductResponse, PaginatedProducts (price as Decimal serialized to str with 2 decimals)
- [x] 6.2 Create backend/app/services/product_service.py with list_active, get_active_by_id, list_all (admin), create, update, deactivate functions
- [x] 6.3 Create backend/app/api/v1/products.py router with GET /products, GET /products/{id}, POST /products (admin), PUT /products/{id} (admin), DELETE /products/{id} (admin), GET /admin/products (admin)
- [x] 6.4 Register products router in main.py

## 7. Seed script

- [x] 7.1 Create backend/app/seed/seed.py with idempotent seed: check user count before inserting; create admin@quickshop.com (Admin1234!), cliente1@quickshop.com and cliente2@quickshop.com (Cliente1234!) with hashed passwords
- [x] 7.2 Add 20 products to seed with realistic names, descriptions, prices, stock (0-100), and image_url = https://picsum.photos/seed/quickshop-{1..20}/400/300

## 8. Backend integration tests

- [x] 8.1 Create backend/tests/conftest.py with async test client and in-memory or test database setup
- [x] 8.2 Create backend/tests/test_auth.py: test register success, duplicate email 409, invalid password 422, login success, wrong password 401, /auth/me valid token, /auth/me missing token
- [x] 8.3 Create backend/tests/test_users.py: test GET /users/me (auth), PUT /users/me (update name, update password), GET /users (admin), GET /users (client 403), GET /users/{id} (admin), GET /users/{id} 404
- [x] 8.4 Create backend/tests/test_products.py: test GET /products (public), GET /products?search=..., GET /products/{id} active, GET /products/{id} inactive 404, POST /products (admin), POST /products (client 403), PUT /products/{id}, DELETE /products/{id} soft-delete, GET /admin/products (admin)
- [x] 8.5 Run all tests and confirm they pass

## 9. Frontend project bootstrap

- [x] 9.1 Create frontend/package.json with dependencies: react, react-dom, react-router-dom and devDependencies: vite, @vitejs/plugin-react, @tailwindcss/vite, tailwindcss
- [x] 9.2 Create frontend/pnpm-workspace.yaml with allowBuilds for esbuild, @tailwindcss/oxide, lightningcss
- [x] 9.3 Create frontend/vite.config.js using @tailwindcss/vite plugin (no postcss)
- [x] 9.4 Create frontend/index.html entry point and frontend/src/main.jsx with AuthProvider and RouterProvider
- [x] 9.5 Create frontend/src/services/api.js with apiFetch using native fetch
- [x] 9.6 Create frontend/src/contexts/AuthContext.jsx with AuthProvider, useAuth, user+token state, login, logout
- [x] 9.7 Create frontend/src/routes/ProtectedRoute.jsx and AdminRoute.jsx
- [x] 9.8 Create frontend/src/components/layout/Header.jsx (nav links by role) and Layout.jsx (Header + Outlet)
- [x] 9.9 Create frontend/Dockerfile (multi-stage: node:22-alpine builder + nginx:alpine serving /dist) and frontend/nginx.conf
- [x] 9.10 Create frontend/.env.example and frontend/.dockerignore

## 10. Authentication frontend

- [x] 10.1 Create frontend/src/services/authService.js with login(email, password), register(data), getMe(token)
- [x] 10.2 Create frontend/src/pages/auth/LoginPage.jsx with email+password form, error display, redirect to / on success
- [x] 10.3 Create frontend/src/pages/auth/RegisterPage.jsx with full_name, email, password, confirm password fields, client-side validation, redirect to /login on success

## 11. Users frontend

- [x] 11.1 Create frontend/src/services/userService.js with getMe(token), updateMe(data, token), listUsers(page, size, token), getUserById(id, token)
- [x] 11.2 Create frontend/src/pages/catalog/UserProfilePage.jsx (accessible via /profile) showing current user data and update form
- [x] 11.3 Create frontend/src/pages/admin/UserListPage.jsx showing paginated table of users (admin only)

## 12. Products frontend

- [x] 12.1 Create frontend/src/services/productService.js with listProducts(page, size, search), getProduct(id), createProduct(data, token), updateProduct(id, data, token), deleteProduct(id, token), listAllProducts(page, size, search, token)
- [x] 12.2 Create frontend/src/pages/catalog/ProductListPage.jsx: responsive product grid, search bar, pagination, disabled Add-to-cart if stock=0 or unauthenticated
- [x] 12.3 Create frontend/src/pages/catalog/ProductDetailPage.jsx: large image, full description, price, stock, quantity selector (max=stock), Add-to-cart button
- [x] 12.4 Create frontend/src/pages/admin/ProductManagementPage.jsx: table with all products (active + inactive), edit/deactivate actions, create-new button, modal or inline form for create/edit

## 13. Router and app wiring

- [x] 13.1 Create frontend/src/routes/AppRouter.jsx with all routes: /, /products/:id, /login, /register, /profile (protected), /admin/users (admin), /admin/products (admin), * NotFoundPage
- [x] 13.2 Create frontend/src/pages/NotFoundPage.jsx
- [x] 13.3 Verify all page imports and route guards work correctly

## 14. End-to-end verification

- [x] 14.1 Start Docker Compose (db + backend), run Alembic migrations, confirm seed data exists
- [x] 14.2 Manually test register → login → /auth/me via curl or Swagger UI (/docs)
- [x] 14.3 Manually test product CRUD as admin via Swagger UI
- [x] 14.4 Start frontend dev server, verify login/register flow in browser
- [x] 14.5 Verify product catalog loads public products, search works, and detail page shows correct data
- [x] 14.6 Verify admin product management CRUD in browser
