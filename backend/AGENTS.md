# Backend - Convenciones y guia de desarrollo

## Stack

| Componente       | Tecnologia                  | Version  |
|------------------|-----------------------------|----------|
| Lenguaje         | Python                      | 3.11     |
| Framework        | FastAPI                     | 0.115+   |
| ORM              | SQLAlchemy (async)          | 2.0+     |
| Migraciones      | Alembic                     | 1.13+    |
| Base de datos    | PostgreSQL                  | 15       |
| Driver async     | asyncpg                     | 0.29+    |
| Hashing          | bcrypt                      | 4.x      |
| JWT              | python-jose[cryptography]   | 3.x      |
| Validacion       | Pydantic v2 + email-validator | 2.x    |
| Gestor de deps   | uv                          | latest   |

## Gestion de dependencias con uv

```bash
# Instalar dependencias del proyecto
uv sync

# Agregar una dependencia de produccion
uv add fastapi

# Agregar una dependencia de desarrollo
uv add --dev pytest pytest-asyncio httpx

# Ejecutar el servidor en desarrollo
uv run uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Ejecutar los tests
uv run pytest
```

El archivo pyproject.toml es la fuente de verdad para las dependencias. No usar pip directamente.

## Estructura de modulos

```
app/
  api/
    v1/
      auth.py         # POST /auth/register, POST /auth/login, GET /auth/me
      users.py        # GET/PUT /users/me, GET /users, GET /users/{id}
      products.py     # GET /products, GET/POST/PUT/DELETE /products/{id}
      cart.py         # GET/DELETE /cart, POST /cart/items, PUT/DELETE /cart/items/{id}
      orders.py       # POST /orders, GET /orders, GET/PATCH/DELETE /orders/{id}
  core/
    config.py         # Settings con pydantic-settings
    security.py       # create_access_token, verify_token, hash_password, verify_password
    dependencies.py   # get_db, get_current_user, require_admin, require_client
  db/
    base.py           # Base = DeclarativeBase()
    session.py        # async_session_maker, get_db
  models/
    user.py
    product.py
    cart.py
    order.py
  schemas/
    auth.py           # LoginRequest, RegisterRequest, TokenResponse
    user.py           # UserResponse, UserUpdate
    product.py        # ProductCreate, ProductUpdate, ProductResponse, ProductListResponse
    cart.py           # CartResponse, AddItemRequest, UpdateItemRequest
    order.py          # OrderResponse, UpdateOrderStatusRequest
  services/
    auth_service.py
    user_service.py
    product_service.py
    cart_service.py
    order_service.py
  seed/
    seed.py           # Seed idempotente
  main.py             # App FastAPI, routers, middleware CORS, lifespan
```

## Configuracion principal (main.py)

```python
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings

@asynccontextmanager
async def lifespan(app: FastAPI):
    await run_migrations()
    await run_seed()
    yield

app = FastAPI(lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

## Configuracion con pydantic-settings (core/config.py)

```python
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    database_url: str
    secret_key: str
    access_token_expire_minutes: int = 120
    cors_origins: list[str] = ["http://localhost:5173"]

    model_config = {"env_file": ".env"}

settings = Settings()
```

## Dependency de sesion (core/dependencies.py)

```python
from typing import AsyncGenerator
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import async_session_maker

async def get_db() -> AsyncGenerator[AsyncSession, None]:
    async with async_session_maker() as session:
        yield session
```

## Autenticacion: JWT + bcrypt

### Usar bcrypt directamente (sin passlib)

passlib tiene incompatibilidades con versiones recientes del paquete bcrypt. Usar bcrypt directamente:

```python
import bcrypt

def hash_password(plain: str) -> str:
    return bcrypt.hashpw(plain.encode(), bcrypt.gensalt()).decode()

def verify_password(plain: str, hashed: str) -> bool:
    return bcrypt.checkpw(plain.encode(), hashed.encode())
```

### JWT con python-jose

```python
from datetime import datetime, timedelta, timezone
from jose import jwt, JWTError
from app.core.config import settings

ALGORITHM = "HS256"

def create_access_token(subject: str, role: str) -> str:
    expire = datetime.now(timezone.utc) + timedelta(
        minutes=settings.access_token_expire_minutes
    )
    payload = {"sub": subject, "role": role, "exp": expire}
    return jwt.encode(payload, settings.secret_key, algorithm=ALGORITHM)
```

### Dependency de usuario autenticado

```python
from fastapi import Depends, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

bearer = HTTPBearer()

async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(bearer),
    db: AsyncSession = Depends(get_db),
) -> User:
    try:
        payload = jwt.decode(
            credentials.credentials, settings.secret_key, algorithms=[ALGORITHM]
        )
        user_id: str = payload.get("sub")
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")
    user = await user_service.get_by_id(db, user_id)
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    return user
```

## SQLAlchemy 2.0 (async)

### Definicion de modelos

```python
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy import String, Boolean
import uuid

class User(Base):
    __tablename__ = "users"

    id: Mapped[uuid.UUID] = mapped_column(default=uuid.uuid4, primary_key=True)
    email: Mapped[str] = mapped_column(String(255), unique=True, nullable=False)
    hashed_password: Mapped[str] = mapped_column(String(255), nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
```

### Consultas async

```python
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

async def get_by_email(db: AsyncSession, email: str) -> User | None:
    result = await db.execute(select(User).where(User.email == email))
    return result.scalar_one_or_none()
```

## Alembic

### Crear una nueva migracion

```bash
uv run alembic revision --autogenerate -m "descripcion_del_cambio"
uv run alembic upgrade head
```

### Migracion automatica al arrancar

El lifespan de FastAPI ejecuta `alembic upgrade head` antes de aceptar trafico. No modificar este comportamiento.

### Configuracion de env.py

El env.py de Alembic debe importar todos los modelos para que autogenerate los detecte:

```python
from app.db.base import Base
from app.models import user, product, cart, order  # noqa: F401
target_metadata = Base.metadata
```

## Seed idempotente

El seed comprueba si ya existen datos antes de insertar:

```python
from sqlalchemy import select, func

async def run_seed(db: AsyncSession) -> None:
    result = await db.execute(select(func.count()).select_from(User))
    if result.scalar() > 0:
        return
    # Crear admin, clientes y 20 productos
```

Credenciales del seed:
- admin@quickshop.com / Admin1234!
- cliente1@quickshop.com / Cliente1234!
- cliente2@quickshop.com / Cliente1234!

Los 20 productos usan imagenes de Unsplash con IDs verificados, almacenadas en la lista UNSPLASH_IMAGES del seed.

## Email validation

Pydantic EmailStr requiere email-validator >= 2.1.0. Declararlo explicitamente en pyproject.toml:

```toml
[project]
dependencies = [
    "email-validator>=2.1.0",
    # resto de dependencias
]
```

## Dockerfile del backend

```dockerfile
FROM python:3.11-slim AS builder
WORKDIR /app

RUN pip install uv

COPY pyproject.toml uv.lock ./
RUN uv sync --frozen --no-dev

FROM python:3.11-slim
WORKDIR /app

COPY --from=builder /app/.venv /app/.venv
COPY . .

ENV PATH="/app/.venv/bin:$PATH"

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

## Tests

```bash
# Todos los tests
uv run pytest

# Con cobertura
uv run pytest --cov=app

# Un modulo especifico
uv run pytest tests/test_auth.py -v
```

Configuracion en pyproject.toml:

```toml
[tool.pytest.ini_options]
asyncio_mode = "auto"

## Convenciones de Idioma
- **El agente debe comunicarse e interactuar siempre en castellano (español).**
- El código fuente, logs y comentarios deben estar en inglés.

```
