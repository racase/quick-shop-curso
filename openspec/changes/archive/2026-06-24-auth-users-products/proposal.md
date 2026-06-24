## Why

QuickShop needs its three foundational modules — authentication, user management, and product catalog — before any other feature can be built. These modules establish identity, access control, and the core data domain of the store.

## What Changes

- Implement the full backend for authentication (register, login JWT, /auth/me) following the spec in docs/specs-prds/autenticacion.md.
- Implement user profile and admin user-management endpoints following docs/specs-prds/usuarios.md.
- Implement the public product catalog and admin product CRUD following docs/specs-prds/productos.md.
- Bootstrap the backend project structure: FastAPI app, SQLAlchemy 2.0 async engine, Alembic migrations, Pydantic Settings config, bcrypt + JWT security utilities.
- Bootstrap the frontend project structure: React 18 + Vite + Tailwind CSS, Axios API client, React Router v6.
- Implement React pages and services for login, register, user profile, public catalog, product detail, and admin product management.
- Add a seed script that creates 2 admin users, 2 client users, and 20 products with stable picsum images.
- Add Docker Compose configuration wiring PostgreSQL 15, backend, and frontend.

## Capabilities

### New Capabilities

- `user-authentication`: Register, login (JWT Bearer), /auth/me endpoint and React login/register pages.
- `user-management`: /users/me (get + update), /users (admin list), /users/{id} (admin detail) endpoints and React profile + admin user-list pages.
- `product-catalog`: Public GET /products + GET /products/{id}, admin POST/PUT/DELETE /products and GET /admin/products, React catalog, product-detail, and admin product-management pages.

### Modified Capabilities

## Impact

- Creates all files under `backend/app/` (models, schemas, services, api/v1 routers, core utilities, seed, main.py, Dockerfile, pyproject.toml, alembic/).
- Creates all files under `frontend/src/` (contexts, pages, services, routes, components, Dockerfile, package.json, vite.config.js, tailwind.config.js).
- Creates `docker-compose.yml` at project root.
- No existing code is modified (backend and frontend are currently empty).
- Adds Python dependencies: fastapi, uvicorn, sqlalchemy, asyncpg, alembic, pydantic-settings, python-jose, passlib[bcrypt].
- Adds JS dependencies: react, react-dom, react-router-dom, axios, tailwindcss, vite.
