## Why

QuickShop necesita los tres módulos fundacionales —autenticación, usuarios y productos— para que el sistema sea funcional de extremo a extremo. Sin ellos no es posible proteger ningún endpoint ni mostrar el catálogo de la tienda.

## What Changes

- Nuevo módulo de autenticación: registro de clientes y login con JWT (2 h de expiración).
- Nuevo módulo de usuarios: perfil propio para clientes, listado y gestión de estado para administradores.
- Nuevo módulo de productos: catálogo público, CRUD completo restringido a administradores, soft-delete.
- Backend FastAPI: modelos SQLAlchemy, schemas Pydantic, servicios y routers para los tres módulos.
- Migraciones Alembic para las tablas `usuarios` y `productos`.
- Seed idempotente: 1 admin, 2 clientes y 20 productos desde `docs/products-images.json`.
- Frontend React + Vite: páginas de login, registro, catálogo y panel de administrador de productos.

## Capabilities

### New Capabilities

- `auth`: Registro de usuarios cliente y autenticación JWT; gestión del token en memoria en el frontend.
- `users`: Consulta de perfil propio (clientes) y gestión de estado de usuarios (administradores).
- `products`: Catálogo público de productos y CRUD de administrador con soft-delete.

### Modified Capabilities

## Impact

- **Backend**: nuevos ficheros en `app/models/`, `app/schemas/`, `app/services/`, `app/api/v1/`; `app/main.py` registra los tres routers; `app/core/security.py` y `app/core/dependencies.py` implementan JWT y guards; nueva migración Alembic.
- **Frontend**: nuevas páginas en `src/pages/`, clientes HTTP en `src/api/`, `AuthContext` y `CartContext` en `src/context/`, rutas en `App.jsx`.
- **Dependencias backend**: `python-jose[cryptography]`, `bcrypt`, `email-validator`, `pydantic-settings`.
- **Base de datos**: tablas `usuarios` y `productos` creadas vía Alembic.
