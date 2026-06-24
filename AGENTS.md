# QuickShop - Convenciones generales

## Descripcion del proyecto

QuickShop es una plataforma de e-commerce minimalista con catalogo de productos, carrito de compra, gestion de pedidos y autenticacion por roles. Sirve como proyecto de aprendizaje de un stack moderno: FastAPI + React + PostgreSQL desplegado con Docker.

## Modulos del sistema

| Modulo        | Descripcion breve                                                     |
|---------------|-----------------------------------------------------------------------|
| autenticacion | Registro, login JWT, proteccion de rutas                             |
| usuarios      | Perfil propio, listado de usuarios (admin)                           |
| productos     | Catalogo publico, CRUD de productos (admin), gestion de stock        |
| carrito       | Acumulacion de productos por cliente antes de confirmar pedido       |
| pedidos       | Ciclo de vida del pedido, descuento y restitucion de stock           |

Las especificaciones detalladas de cada modulo se encuentran en docs/specs-prds/.

## Estructura de carpetas

```
quick-shop-curso/
  backend/
    app/
      api/
        v1/
          auth.py
          users.py
          products.py
          cart.py
          orders.py
      core/
        config.py         # Configuracion con Pydantic Settings
        security.py       # JWT y bcrypt
        dependencies.py   # get_db, get_current_user, require_admin
      db/
        base.py           # DeclarativeBase
        session.py        # AsyncSession factory
      models/
        user.py
        product.py
        cart.py
        order.py
      schemas/
        auth.py
        user.py
        product.py
        cart.py
        order.py
      services/
        auth_service.py
        user_service.py
        product_service.py
        cart_service.py
        order_service.py
      seed/
        seed.py           # Seed idempotente
      main.py
    alembic/
      versions/
      env.py
    alembic.ini
    tests/
    Dockerfile
    pyproject.toml
    .env.example
  frontend/
    src/
      components/
        layout/           # Header, Layout principal
        ui/               # Componentes reutilizables
      contexts/
        AuthContext.jsx
      pages/
        auth/             # LoginPage, RegisterPage
        catalog/          # ProductListPage, ProductDetailPage
        cart/             # CartPage
        orders/           # OrderHistoryPage, OrderDetailPage
        admin/            # ProductManagementPage, OrderManagementPage, UserListPage
        NotFoundPage.jsx
      routes/
        AppRouter.jsx
        ProtectedRoute.jsx
        AdminRoute.jsx
      services/
        api.js
        authService.js
        productService.js
        cartService.js
        orderService.js
    public/
    Dockerfile
    vite.config.js
    tailwind.config.js
    package.json
    pnpm-workspace.yaml
    .env.example
  docs/
    specs-prds/
      autenticacion.md
      usuarios.md
      productos.md
      carrito.md
      pedidos.md
  docker-compose.yml
  .env.example
  CLAUDE.md
  AGENTS.md
```

## Orden de desarrollo

Desarrollar siempre en este orden estricto:

1. Modelos SQLAlchemy y migracion Alembic correspondiente.
2. Schemas Pydantic de request y response.
3. Logica de negocio en el service correspondiente.
4. Router FastAPI que delega en el service.
5. Tests de integracion de los endpoints.
6. Componentes React que consumen los endpoints verificados.
7. Estilos Tailwind y adaptacion responsiva.

No comenzar el frontend de un modulo hasta que el backend correspondiente este funcionando y probado.

## Convenciones generales

### Idioma

- Documentacion (CLAUDE.md, AGENTS.md, specs, README): castellano.
- Codigo fuente (variables, funciones, clases, comentarios inline): ingles.
- Mensajes de commit: ingles.
- Mensajes de error devueltos por la API: ingles.

### Estilo de codigo

- Sin emojis en ningun archivo del proyecto.
- Lineas de hasta 100 caracteres.
- Python: formato Black, imports ordenados con isort.
- JavaScript/JSX: formato Prettier, comillas simples.

### Seguridad

- Ningun secreto, contrasena ni URL de base de datos hardcodeado en el codigo fuente.
- Todas las variables sensibles en archivos .env.
- Los archivos .env estan excluidos por .gitignore; los .env.example estan versionados.
- El JWT no se almacena en localStorage; usar cookie HttpOnly o memoria de la aplicacion React.

## Variables de entorno

### Nivel raiz (.env.example)

```
POSTGRES_DB=quickshop
POSTGRES_USER=quickshop
POSTGRES_PASSWORD=change_me_strong_password
```

### Backend (backend/.env.example)

```
DATABASE_URL=postgresql+asyncpg://quickshop:change_me_strong_password@db:5432/quickshop
SECRET_KEY=change_me_generate_with_openssl_rand_hex_32
ACCESS_TOKEN_EXPIRE_MINUTES=120
CORS_ORIGINS=http://localhost:5173
```

### Frontend (frontend/.env.example)

```
VITE_API_URL=http://localhost:8000
```

## Ejecucion con Docker Compose

```bash
# 1. Copiar los archivos de entorno y ajustar valores
cp .env.example .env
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env

# 2. Construir e iniciar todos los servicios
docker compose up --build

# 3. Solo backend y base de datos
docker compose up db backend

# 4. Ver logs de un servicio
docker compose logs -f backend
```

El backend ejecuta automaticamente las migraciones Alembic y el seed al arrancar.

## Credenciales de seed

| Rol           | Email                   | Password     |
|---------------|-------------------------|--------------|
| Administrador | admin@quickshop.com     | Admin1234!   |
| Cliente 1     | cliente1@quickshop.com  | Cliente1234! |
| Cliente 2     | cliente2@quickshop.com  | Cliente1234! |
