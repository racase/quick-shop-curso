# Guia de agentes — Backend QuickShop

## Stack y herramientas

- Python 3.11
- FastAPI (framework web)
- SQLAlchemy 2.0 con sesiones async (asyncpg como driver)
- Alembic para migraciones de base de datos
- Pydantic v2 para schemas de entrada/salida
- python-jose para JWT
- passlib[bcrypt] para hash de contrasenas
- uv como gestor de dependencias y entorno virtual

## Estructura de carpetas

```
backend/
├── app/
│   ├── api/
│   │   ├── deps.py         # Dependencias comunes: get_db, get_current_user, require_admin
│   │   ├── auth.py         # Endpoints de autenticacion
│   │   ├── users.py        # Endpoints de usuarios
│   │   ├── products.py     # Endpoints de productos
│   │   ├── cart.py         # Endpoints de carrito
│   │   └── orders.py       # Endpoints de pedidos
│   ├── core/
│   │   ├── config.py       # Settings desde variables de entorno (pydantic-settings)
│   │   └── security.py     # Funciones JWT y hash de contrasena
│   ├── db/
│   │   └── session.py      # AsyncEngine y AsyncSessionLocal
│   ├── models/
│   │   ├── user.py
│   │   ├── product.py
│   │   ├── cart_item.py
│   │   ├── order.py
│   │   └── order_item.py
│   ├── schemas/
│   │   ├── auth.py
│   │   ├── user.py
│   │   ├── product.py
│   │   ├── cart.py
│   │   └── order.py
│   ├── services/
│   │   ├── auth.py
│   │   ├── user.py
│   │   ├── product.py
│   │   ├── cart.py
│   │   └── order.py
│   ├── seed.py             # Seed idempotente
│   └── main.py             # Instancia FastAPI, CORS, registro de routers
├── alembic/
│   ├── env.py
│   └── versions/
├── alembic.ini
├── tests/
├── Dockerfile
├── pyproject.toml
└── .env.example
```

## Convenciones de codigo

### Modelos SQLAlchemy

- Usar `DeclarativeBase` de SQLAlchemy 2.0.
- Todos los modelos heredan de una clase `Base` definida en `app/db/session.py` o similar.
- IDs de tipo UUID generados por la base de datos (`server_default=text("gen_random_uuid()")`).
- `created_at` y `updated_at` con `server_default` y `onupdate` gestionados por la BD.
- Campos monetarios: `Numeric(10, 2)` en la BD; serializados como string en la API.

### Schemas Pydantic

- Separar schemas de creacion (`Create`), actualizacion (`Update`) y respuesta (`Response`).
- Usar `model_config = ConfigDict(from_attributes=True)` para schemas de respuesta.
- El campo `price` y `unit_price` se representan como `Decimal` internamente y como `str` en la respuesta JSON.

### Routers FastAPI

- Un router por modulo registrado en `main.py`.
- Prefijos de ruta: `/auth`, `/users`, `/products`, `/cart`, `/orders`.
- Dependencias de autenticacion en `app/api/deps.py`:
  - `get_current_user`: valida el JWT y devuelve el usuario activo.
  - `require_admin`: llama a `get_current_user` y verifica que el rol sea `admin`.
  - `require_client`: llama a `get_current_user` y verifica que el rol sea `client`.

### Servicios

- Toda la logica de negocio va en `app/services/`; los routers no contienen logica de dominio.
- Los servicios reciben la sesion de base de datos como primer parametro.
- Las operaciones que modifican stock o carrito deben ejecutarse en una transaccion unica.

## Autenticacion y seguridad

### JWT

- Algoritmo: HS256.
- `SECRET_KEY` leida desde variables de entorno; nunca hardcodeada.
- Expiracion: `ACCESS_TOKEN_EXPIRE_MINUTES` (default 120).
- Payload del token incluye: `sub` (user_id como string), `role`, `exp`.
- El token se envia en el header `Authorization: Bearer {token}`.

### Contrasenas

- Hash con bcrypt via `passlib`.
- Nunca almacenar ni loguear contrasenas en texto plano.
- La verificacion de credenciales debe tomar tiempo constante (usar `verify_password` de passlib).

### CORS

- Configurado en `main.py` con `CORSMiddleware`.
- Origenes permitidos leidos desde `CORS_ORIGINS` en variables de entorno.
- Metodos permitidos: GET, POST, PUT, PATCH, DELETE, OPTIONS.
- Headers permitidos: `Authorization`, `Content-Type`.

## Migraciones Alembic

- Las migraciones se generan con `alembic revision --autogenerate -m "descripcion"`.
- Se ejecutan automaticamente al arrancar el contenedor: `alembic upgrade head`.
- Nunca editar una migracion ya aplicada en produccion; crear una nueva.
- El archivo `alembic/env.py` usa la URL de base de datos de las variables de entorno.

## Seed

El seed debe ser idempotente: ejecutarlo multiples veces no crea duplicados.

Estrategia: verificar si ya existe algun usuario antes de insertar; si la tabla no esta vacia, salir sin hacer nada.

Datos que crea el seed:

| Tipo         | Email                        | Password       | Rol    |
|--------------|------------------------------|----------------|--------|
| Administrador | admin@quickshop.com         | Admin1234!     | admin  |
| Cliente 1    | cliente1@quickshop.com       | Cliente1234!   | client |
| Cliente 2    | cliente2@quickshop.com       | Cliente1234!   | client |

20 productos con nombres, descripciones realistas e imagenes de `https://picsum.photos/seed/quickshop-{n}/400/300` (n del 1 al 20).

## Dockerfile del backend

```dockerfile
FROM python:3.11-slim

WORKDIR /app

RUN pip install uv

COPY pyproject.toml uv.lock ./
RUN uv sync --frozen --no-dev

COPY . .

CMD ["sh", "-c", "uv run alembic upgrade head && uv run python -m app.seed && uv run uvicorn app.main:app --host 0.0.0.0 --port 8000"]
```

## Variables de entorno

| Variable                      | Descripcion                                           |
|-------------------------------|-------------------------------------------------------|
| `DATABASE_URL`                | URL async de PostgreSQL (asyncpg)                     |
| `SECRET_KEY`                  | Clave secreta para JWT                                |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | Duracion del token en minutos                         |
| `CORS_ORIGINS`                | Origenes CORS permitidos separados por coma           |

Todas las variables se leen mediante `pydantic-settings` desde `.env` o el entorno del sistema.

## Gestion de errores

- Usar `HTTPException` de FastAPI con el codigo HTTP correcto.
- No exponer detalles de implementacion en mensajes de error de produccion.
- Los errores de validacion Pydantic devuelven 422 automaticamente.

## Tests

- Framework: pytest + httpx (cliente async para FastAPI).
- Base de datos de test: PostgreSQL separada o SQLite en memoria si el driver lo permite.
- Cada test debe limpiar su estado; no depender del orden de ejecucion.
