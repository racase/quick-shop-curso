# AGENTS.md - QuickShop

Guia completa de convenciones, estructura de carpetas, flujo de trabajo y configuracion del proyecto QuickShop.

## Descripcion del proyecto

QuickShop es una plataforma mini de e-commerce con dos roles de usuario (cliente y administrador), gestion de catalogo de productos, carrito de compra y pedidos. El sistema se despliega mediante Docker Compose.

## Convenciones generales

### Idioma
- Documentacion (CLAUDE.md, AGENTS.md, specs, README, comentarios): castellano
- Codigo (nombres de variables, funciones, clases, endpoints): ingles
- Mensajes de commit: ingles

### Estilo de codigo
- Sin comentarios en el codigo salvo cuando el motivo no sea obvio para un lector futuro
- Sin emojis en ningun fichero del proyecto
- Preferir editar ficheros existentes antes de crear nuevos
- No introducir abstracciones ni funcionalidad mas alla de lo que la tarea requiere

### Variables de entorno
- Toda variable sensible (passwords, secrets, URLs de base de datos) en ficheros .env
- El fichero .env esta en .gitignore y nunca se versiona
- El fichero .env.example esta versionado con valores de ejemplo
- Ningun secreto, password ni URL hardcodeados en el codigo fuente

## Estructura de carpetas

```
quick-shop-curso/
├── backend/                   # API FastAPI
│   ├── app/
│   │   ├── api/               # Routers FastAPI (auth, users, products, cart, orders)
│   │   ├── core/              # Configuracion, seguridad, dependencias
│   │   ├── db/                # Sesion de base de datos, base declarativa
│   │   ├── models/            # Modelos SQLAlchemy (un fichero por modulo)
│   │   ├── schemas/           # Esquemas Pydantic (un fichero por modulo)
│   │   ├── services/          # Logica de negocio separada de los routers
│   │   └── main.py            # Punto de entrada FastAPI
│   ├── alembic/               # Migraciones de base de datos
│   ├── alembic.ini
│   ├── seed.py                # Seed idempotente
│   ├── pyproject.toml         # Dependencias gestionadas con uv
│   ├── .dockerignore
│   └── Dockerfile
├── frontend/                  # Aplicacion React + Vite
│   ├── src/
│   │   ├── api/               # Clientes HTTP por modulo (auth.js, products.js, etc.)
│   │   ├── components/        # Componentes reutilizables
│   │   ├── pages/             # Paginas (una por ruta)
│   │   ├── context/           # Contextos React (AuthContext, CartContext)
│   │   ├── hooks/             # Hooks personalizados
│   │   └── main.jsx           # Punto de entrada
│   ├── package.json
│   ├── pnpm-workspace.yaml    # Configuracion pnpm (incluye allowBuilds)
│   ├── pnpm-lock.yaml
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── .dockerignore
│   └── Dockerfile
├── docs/
│   ├── specs-prds/            # Especificaciones por modulo
│   └── products-images.json   # Datos de seed de productos
├── docker-compose.yml
├── .env.example
├── .env                       # No versionado
├── CLAUDE.md
└── AGENTS.md
```

## Orden de desarrollo

1. **Backend primero:** modelos SQLAlchemy, migraciones Alembic, schemas Pydantic, servicios, routers.
2. **Frontend despues:** contextos de autenticacion y carrito, paginas, componentes, integracion con la API.
3. Orden de modulos: autenticacion > usuarios > productos > carrito > pedidos.

## Modulos del sistema

Los cinco modulos del sistema tienen sus especificaciones completas en `docs/specs-prds/`:

| Modulo         | Fichero de spec                         |
|----------------|-----------------------------------------|
| Autenticacion  | docs/specs-prds/autenticacion.md        |
| Usuarios       | docs/specs-prds/usuarios.md             |
| Productos      | docs/specs-prds/productos.md            |
| Carrito        | docs/specs-prds/carrito.md              |
| Pedidos        | docs/specs-prds/pedidos.md              |

## Docker y docker-compose

- El proyecto se ejecuta completo con `docker-compose up --build`.
- Los servicios definidos son: db (PostgreSQL 15), backend (FastAPI), frontend (React/Vite).
- El backend ejecuta las migraciones Alembic automaticamente al arrancar antes de iniciar el servidor.
- El seed es idempotente: solo inserta datos si la base de datos esta vacia.
- El backend depende de db con condicion de health check para garantizar que PostgreSQL este listo.

## Configuracion critica de pnpm 11

En pnpm 11, las aprobaciones de build scripts se guardan en pnpm-workspace.yaml bajo la clave `allowBuilds`, no en el lockfile. El Dockerfile del frontend debe copiar pnpm-workspace.yaml antes de ejecutar pnpm install o fallara con ERR_PNPM_IGNORED_BUILDS.

Node.js debe ser >= 22.13 para compatibilidad con pnpm 11. Usar la imagen node:22-alpine en el Dockerfile del frontend.

Ejemplo de pnpm-workspace.yaml:
```yaml
allowBuilds:
  - esbuild
  - lightningcss
  - tailwindcss
```

## Seed

El seed crea los siguientes datos si la base de datos esta vacia:

| Rol            | Email                       | Password      |
|----------------|-----------------------------|---------------|
| administrador  | admin@quickshop.com         | Admin1234!    |
| cliente        | cliente1@quickshop.com      | Cliente1234!  |
| cliente        | cliente2@quickshop.com      | Cliente1234!  |

Ademas crea 20 productos a partir del fichero `docs/products-images.json`.
