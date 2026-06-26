## 1. Backend — Infraestructura base

- [x] 1.1 Crear `backend/app/db/base.py` con la Base declarativa de SQLAlchemy
- [x] 1.2 Crear `backend/app/db/session.py` con el motor async y la función `get_db`
- [x] 1.3 Crear `backend/app/core/config.py` con Settings usando pydantic-settings (DATABASE_URL, SECRET_KEY, ACCESS_TOKEN_EXPIRE_MINUTES, CORS_ORIGINS)
- [x] 1.4 Crear `backend/app/core/security.py` con `hash_password`, `verify_password` (bcrypt directo) y `create_access_token` / `decode_access_token` (PyJWT)
- [x] 1.5 Crear `backend/app/core/dependencies.py` con `get_current_user` y `require_admin`
- [x] 1.6 Actualizar `backend/pyproject.toml` con dependencias: PyJWT, bcrypt, email-validator, pydantic-settings, asyncpg, sqlalchemy, alembic, uvicorn, fastapi

## 2. Backend — Módulo Usuarios

- [x] 2.1 Crear `backend/app/models/user.py` con el modelo SQLAlchemy `User` (id, email, hashed_password, rol Enum, is_active, created_at)
- [x] 2.2 Crear `backend/app/schemas/user.py` con los schemas Pydantic: `UserCreate`, `UserOut`, `UserUpdate`
- [x] 2.3 Crear `backend/app/services/user.py` con funciones: `get_user_by_email`, `create_user`, `get_all_users`, `get_user_by_id`, `update_user_status`
- [x] 2.4 Crear `backend/app/api/v1/users.py` con los endpoints: GET /users/me, GET /users/, PATCH /users/{id}

## 3. Backend — Módulo Autenticación

- [x] 3.1 Crear `backend/app/schemas/auth.py` con `LoginRequest` y `TokenResponse`
- [x] 3.2 Crear `backend/app/services/auth.py` con `authenticate_user` (verifica credenciales y estado activo)
- [x] 3.3 Crear `backend/app/api/v1/auth.py` con los endpoints: POST /auth/register (201), POST /auth/login (200)

## 4. Backend — Módulo Productos

- [x] 4.1 Crear `backend/app/models/product.py` con el modelo SQLAlchemy `Product` (id, nombre, descripcion, precio Numeric, stock, imagen_url, is_active, created_at, updated_at)
- [x] 4.2 Crear `backend/app/schemas/product.py` con `ProductCreate`, `ProductUpdate`, `ProductOut`, `ProductListOut`
- [x] 4.3 Crear `backend/app/services/product.py` con funciones: `list_products`, `get_product`, `create_product`, `update_product`, `deactivate_product`
- [x] 4.4 Crear `backend/app/api/v1/products.py` con los endpoints: GET /products/, GET /products/{id}, POST /products/ (201), PUT /products/{id}, DELETE /products/{id}

## 5. Backend — Migración, Seed y Main

- [x] 5.1 Actualizar `backend/alembic/env.py` para importar los modelos y usar el motor async
- [x] 5.2 Generar migración Alembic inicial con `alembic revision --autogenerate` para tablas `usuarios` y `productos`
- [x] 5.3 Crear `backend/seed.py` idempotente: 1 admin, 2 clientes y 20 productos desde `docs/products-images.json`
- [x] 5.4 Crear `backend/app/main.py` con la app FastAPI, CORS configurado y routers de auth, users y products registrados con prefijo `/api/v1`

## 6. Frontend — Infraestructura base

- [x] 6.1 Crear `frontend/src/context/AuthContext.jsx` con estado del token en memoria, funciones `login`, `logout` y `user`
- [x] 6.2 Crear `frontend/src/hooks/useAuth.js` para consumir `AuthContext`
- [x] 6.3 Crear componente `frontend/src/components/Header.jsx` con nombre de la app, enlace al catálogo, email del usuario y botón de cerrar sesión
- [x] 6.4 Crear componente de layout o wrapper que incluya el Header en todas las páginas
- [x] 6.5 Configurar rutas en `frontend/src/App.jsx` con React Router v6 (rutas públicas, de cliente y de administrador)
- [x] 6.6 Crear `frontend/src/api/auth.js` con funciones `login(email, password)` y `register(email, password)` usando fetch y VITE_API_URL

## 7. Frontend — Páginas de autenticación

- [x] 7.1 Crear `frontend/src/pages/LoginPage.jsx` con formulario email + password, manejo de error 401 y enlace a /register
- [x] 7.2 Crear `frontend/src/pages/RegisterPage.jsx` con formulario email + password, validaciones inline y enlace a /login
- [x] 7.3 Implementar redirección automática al catálogo tras login/registro exitoso

## 8. Frontend — Catálogo de productos

- [x] 8.1 Crear `frontend/src/api/products.js` con funciones `getProducts()` y `getProduct(id)`
- [x] 8.2 Crear componente `frontend/src/components/ProductCard.jsx` con imagen, nombre, precio y botón "Agregar al carrito" (deshabilitado si stock=0)
- [x] 8.3 Crear `frontend/src/pages/CatalogPage.jsx` con cuadrícula responsive de ProductCard

## 9. Frontend — Panel de administrador de productos

- [x] 9.1 Ampliar `frontend/src/api/products.js` con funciones `createProduct`, `updateProduct` y `deactivateProduct`
- [x] 9.2 Crear `frontend/src/pages/AdminProductsPage.jsx` con tabla de productos (nombre, precio, stock, estado), botones crear, editar y desactivar
- [x] 9.3 Implementar formulario modal o página separada para crear y editar productos en AdminProductsPage
