# backend/AGENTS.md - Instrucciones de backend

## Stack y herramientas

- Python 3.11
- FastAPI
- SQLAlchemy 2.0 (ORM con soporte async)
- Alembic (migraciones)
- PostgreSQL 15
- uv (gestor de dependencias, reemplaza a pip/poetry)
- bcrypt directo (sin passlib) para hashing de passwords
- email-validator>=2.1.0 para habilitar Pydantic EmailStr
- pydantic-settings para leer variables de entorno

## Estructura del proyecto

```
backend/
├── app/
│   ├── api/
│   │   └── v1/
│   │       ├── auth.py
│   │       ├── users.py
│   │       ├── products.py
│   │       ├── cart.py
│   │       └── orders.py
│   ├── core/
│   │   ├── config.py          # Settings con pydantic-settings
│   │   ├── security.py        # JWT y hashing con bcrypt directo
│   │   └── dependencies.py    # get_current_user, require_admin
│   ├── db/
│   │   ├── base.py            # Base declarativa SQLAlchemy
│   │   └── session.py         # Motor async y sesion
│   ├── models/                # Un fichero por modulo
│   ├── schemas/               # Un fichero por modulo
│   ├── services/              # Logica de negocio separada de los routers
│   └── main.py                # Punto de entrada FastAPI
├── alembic/
├── alembic.ini
├── seed.py
├── pyproject.toml
├── .dockerignore
└── Dockerfile
```

## Convenciones de backend

### Hashing de passwords

Usar bcrypt directamente sin passlib. Ejemplo:

```python
import bcrypt

def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()

def verify_password(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password.encode(), hashed.encode())
```

### JWT

- Access token con expiracion de 2 horas (ACCESS_TOKEN_EXPIRE_MINUTES=120)
- Libreria: python-jose[cryptography] o PyJWT
- Clave secreta en variable de entorno SECRET_KEY; nunca hardcodeada

### Migraciones Alembic

- Las migraciones se ejecutan automaticamente al arrancar el backend (antes de iniciar uvicorn)
- Nunca modificar migraciones ya aplicadas; siempre crear nuevas revisiones
- Usar tipos de SQLAlchemy nativos (Enum, Numeric, Boolean, etc.)

### Seed

- El seed verifica si ya existen usuarios antes de insertar; si la tabla no esta vacia, no hace nada
- Crea: 1 administrador (admin@quickshop.com / Admin1234!), 2 clientes y 20 productos
- Los productos se cargan desde `docs/products-images.json` (la ruta debe resolverse relativa a la raiz del repositorio)

### CORS

- Configurado en FastAPI para aceptar el origen del frontend definido en la variable CORS_ORIGINS
- No usar "*" como origen permitido

### Validacion de datos

- Precio: Numeric(10,2), valor > 0; validar en el schema Pydantic con validator o Field(gt=0)
- Stock: Integer, valor >= 0; validar con Field(ge=0)
- Email: usar EmailStr de Pydantic (requiere email-validator>=2.1.0 instalado)

### Codigos de respuesta HTTP

| Situacion                              | Codigo |
|----------------------------------------|--------|
| Creacion exitosa                       | 201    |
| Recurso no encontrado                  | 404    |
| Sin token o token invalido             | 401    |
| Token valido pero sin permisos         | 403    |
| Datos de entrada invalidos             | 422    |
| Regla de negocio violada               | 400    |

### Routers

Registrar todos los routers en main.py con prefijo `/api/v1`. Ejemplo: `/api/v1/auth/login`.

## Variables de entorno requeridas

```
DATABASE_URL=postgresql+asyncpg://user:password@db:5432/quickshop_db
SECRET_KEY=clave-aleatoria-larga
ACCESS_TOKEN_EXPIRE_MINUTES=120
CORS_ORIGINS=http://localhost:5173
```

## Dockerfile

- Imagen base: python:3.11-slim
- Gestor de dependencias: uv
- Copiar pyproject.toml antes del codigo fuente para aprovechar la cache de capas Docker
- Comando de arranque: ejecutar migraciones Alembic + seed + uvicorn en ese orden

```dockerfile
FROM python:3.11-slim
WORKDIR /app
COPY --from=ghcr.io/astral-sh/uv:latest /uv /uvx /usr/local/bin/
COPY pyproject.toml .
RUN uv sync --frozen --no-dev
COPY . .
CMD ["sh", "-c", "uv run alembic upgrade head && uv run python seed.py && uv run uvicorn app.main:app --host 0.0.0.0 --port 8000"]
```

## .dockerignore del backend

```
__pycache__
*.pyc
*.pyo
.env
.venv
.pytest_cache
```
