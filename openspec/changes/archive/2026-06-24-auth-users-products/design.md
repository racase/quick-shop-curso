## Context

QuickShop is an e-commerce learning platform. The backend and frontend directories exist but contain no code — only AGENTS.md and CLAUDE.md convention files. This change bootstraps both projects from scratch and implements the first three functional modules: authentication, user management, and product catalog.

The backend follows FastAPI + SQLAlchemy 2.0 async + PostgreSQL 15, managed with `uv`. The frontend is React 18 + Vite + Tailwind CSS, managed with `pnpm 11`. Deployment is via Docker Compose.

## Goals / Non-Goals

**Goals:**
- Bootstrap backend project structure (pyproject.toml, Dockerfile, alembic, main.py, core utilities).
- Bootstrap frontend project structure (package.json, pnpm-workspace.yaml, vite.config.js, tailwind config, Dockerfile, nginx.conf).
- Implement `users` table, Alembic migration, and seed (2 admins, 2 clients, 20 products).
- Implement authentication module: POST /auth/register, POST /auth/login, GET /auth/me.
- Implement user management module: GET/PUT /users/me, GET /users, GET /users/{id}.
- Implement product catalog module: public GET /products + /products/{id}, admin POST/PUT/DELETE /products, admin GET /admin/products.
- Implement integration tests for all endpoints.
- Implement React pages: LoginPage, RegisterPage, ProductListPage, ProductDetailPage, UserProfilePage, admin UserListPage, admin ProductManagementPage.

**Non-Goals:**
- Cart and Orders modules (separate changes).
- File upload for product images (images use external picsum.photos URLs).
- Email verification or password reset flows.
- OAuth / social login.

## Decisions

### D1: bcrypt directly, no passlib

passlib has known incompatibilities with recent bcrypt versions. Use `bcrypt` directly as documented in backend/AGENTS.md:
```python
import bcrypt
def hash_password(plain): return bcrypt.hashpw(plain.encode(), bcrypt.gensalt()).decode()
def verify_password(plain, hashed): return bcrypt.checkpw(plain.encode(), hashed.encode())
```
Alternative (passlib): rejected — runtime warnings and version conflicts with bcrypt 4.x.

### D2: JWT in memory only (no localStorage, no HttpOnly cookie)

The spec states the JWT must not be stored in localStorage. The frontend stores the token in React state (`useState`) inside `AuthContext`. On page refresh the user is logged out — acceptable for a learning project.

Alternative (HttpOnly cookie): would require CSRF protection and same-site configuration in the nginx reverse proxy; out of scope.

### D3: SQLAlchemy 2.0 `Mapped` / `mapped_column` style

Use the modern SQLAlchemy 2.0 declarative style with `Mapped[T]` type annotations and `mapped_column()`. No use of legacy `Column()` syntax.

### D4: Alembic autogenerate via lifespan

`main.py` runs `alembic upgrade head` in the FastAPI lifespan before accepting traffic. The seed runs immediately after. This avoids a separate entrypoint script and keeps startup self-contained.

### D5: Tailwind CSS via @tailwindcss/vite plugin

Use the `@tailwindcss/vite` Vite plugin (not postcss + tailwindcss). This avoids postcss/autoprefixer regex errors on Windows and is the approach documented in frontend/AGENTS.md.

### D6: Single `products` table with `is_active` soft-delete

Products are never hard-deleted. `DELETE /products/{id}` sets `is_active = false`. The public catalog filters by `is_active = true`; the admin endpoint lists all.

### D7: Paginated responses with `items / total / page / size`

Both `/users` and `/products` return the same paginated envelope:
```json
{ "items": [...], "total": N, "page": P, "size": S }
```
Implemented via SQLAlchemy `count()` + `limit/offset`.

### D8: UserRole as Python Enum + PostgreSQL native ENUM type

`UserRole` is a Python `enum.Enum` with values `client` and `admin`, mapped to a PostgreSQL ENUM type via SQLAlchemy. Alembic autogenerate detects it.

### D9: Frontend uses native `fetch` (no Axios)

The frontend/AGENTS.md defines `apiFetch` using native `fetch`. Follow that pattern — do not add axios as a dependency.

## Risks / Trade-offs

- [JWT in memory] → On page refresh the user is logged out. **Mitigation**: acceptable for a learning project; documented in spec.
- [Alembic autogenerate] → Requires all models imported in `alembic/env.py` before autogenerate works. **Mitigation**: import all model modules in env.py explicitly.
- [asyncpg + PostgreSQL ENUM] → Alembic may generate `CREATE TYPE` before `CREATE TABLE`. Ensure Alembic revision is reviewed before committing. **Mitigation**: review generated migration file.
- [pnpm 11 allowBuilds] → Docker build fails with ERR_PNPM_IGNORED_BUILDS if `pnpm-workspace.yaml` is not copied before `pnpm install`. **Mitigation**: documented in frontend/AGENTS.md; Dockerfile must copy it first.
- [Price as NUMERIC(10,2)] → SQLAlchemy returns `Decimal`; Pydantic schema uses `Decimal` or `float`. Use `Decimal` in schema and serialize via `model_config = {"json_encoders": {Decimal: str}}` for consistent 2-decimal output.
