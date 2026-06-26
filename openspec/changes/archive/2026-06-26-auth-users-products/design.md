## Context

QuickShop es un mini e-commerce con FastAPI (backend async) y React + Vite (frontend). La base de datos es PostgreSQL 15 y el ORM es SQLAlchemy 2.0 async. Este diseño cubre los tres módulos fundacionales del sistema: autenticación, usuarios y productos. Sin ellos ningún otro módulo (carrito, pedidos) puede funcionar.

## Goals / Non-Goals

**Goals:**

- Definir la estructura de ficheros y responsabilidades para los módulos `auth`, `users` y `products`.
- Establecer el flujo de autenticación JWT de extremo a extremo (backend → frontend).
- Especificar las decisiones de seguridad: hashing, expiración de token, almacenamiento en memoria.
- Definir la estrategia de migraciones y seed idempotente.

**Non-Goals:**

- Refresh tokens o sesiones persistentes (fuera de alcance en esta iteración).
- Paginación avanzada del catálogo (skip/limit básico es suficiente).
- Módulos de carrito y pedidos (se abordarán en cambios posteriores).
- Tests automatizados (el curso los tratará por separado).

## Decisions

### D1: JWT con PyJWT en lugar de python-jose

PyJWT es la librería más activa y mantenida. `python-jose` lleva tiempo sin releases. Ambas cumplen el requisito, pero PyJWT tiene mejor soporte para Python 3.11.

**Alternativa descartada:** `python-jose[cryptography]` — funcional pero con mantenimiento dudoso.

### D2: bcrypt directo (sin passlib)

`passlib` añade una capa de abstracción innecesaria y tiene dependencias que generan warnings en Python 3.11+. Usar `bcrypt` directamente es más explícito y sin overhead.

```python
import bcrypt
def hash_password(p: str) -> str:
    return bcrypt.hashpw(p.encode(), bcrypt.gensalt()).decode()
def verify_password(p: str, hashed: str) -> bool:
    return bcrypt.checkpw(p.encode(), hashed.encode())
```

### D3: Token almacenado en memoria (React Context), no en localStorage

Evita ataques XSS que puedan robar el token. La contrapartida es que al recargar la página el usuario pierde la sesión. Es el comportamiento esperado según la spec.

### D4: Servicios separados de routers

Cada módulo tiene un fichero `services/<modulo>.py` con la lógica de negocio. Los routers solo validan entrada, llaman al servicio y devuelven la respuesta. Esto facilita los tests y el mantenimiento.

### D5: Soft-delete para productos

`DELETE /products/{id}` pone `is_active = False` en lugar de borrar el registro. Esto preserva la integridad referencial cuando los pedidos referencien productos (módulo futuro).

### D6: Migración única inicial con todas las tablas

Se crea una migración Alembic que define las tablas `usuarios` y `productos` juntas, ya que ambas son necesarias desde el inicio y no tienen dependencias circulares entre sí.

### D7: Rol como Enum SQLAlchemy nativo

```python
import enum
class RolEnum(str, enum.Enum):
    cliente = "cliente"
    administrador = "administrador"
```

Usar `Enum` nativo de SQLAlchemy garantiza que la base de datos valida el valor. Alternativa descartada: columna `VARCHAR` con validación solo en Pydantic (menos seguro).

## Risks / Trade-offs

- **Token en memoria → pérdida de sesión al recargar** → Aceptado por diseño; el curso no requiere refresh tokens.
- **Migración única grande** → Si se añaden columnas en iteraciones futuras, siempre se crean nuevas revisiones Alembic; nunca se modifica la inicial.
- **Sin rate-limiting en login** → Aceptable para el contexto de curso; en producción habría que añadirlo.
- **Seed no transaccional por módulo** → El seed verifica si la tabla está vacía antes de insertar; si falla a mitad, la próxima ejecución lo reintenta limpiamente.

## Migration Plan

1. `alembic upgrade head` crea las tablas `usuarios` y `productos`.
2. `python seed.py` inserta admin, 2 clientes y 20 productos (idempotente).
3. `uvicorn app.main:app` arranca el servidor.

Los tres pasos están encadenados en el CMD del Dockerfile. En desarrollo local se pueden ejecutar manualmente con `uv run`.
