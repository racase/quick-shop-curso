# QuickShop

Mini plataforma de e-commerce: catalogo de productos, carrito de compras y gestion de pedidos con roles cliente y administrador.

## Stack

- Frontend: React 18 + Vite + Tailwind CSS + React Router (gestionado con pnpm 11)
- Backend: Python 3.11 + FastAPI + SQLAlchemy 2.0 + Alembic (gestionado con uv)
- Base de datos: PostgreSQL 15
- Despliegue: Docker + docker-compose

## Estructura del repositorio

```
quick-shop-curso/
├── backend/          # API REST en Python
├── frontend/         # SPA en React
├── docs/
│   └── specs-prds/   # Especificaciones funcionales por modulo
├── docker-compose.yml
└── .env.example
```

## Convenciones y guia de agentes

Las convenciones detalladas, la estructura de carpetas completa, el orden de desarrollo y las reglas de estilo se encuentran en @AGENTS.md.

Para instrucciones especificas de cada capa:
- Backend: @backend/CLAUDE.md -> @backend/AGENTS.md
- Frontend: @frontend/CLAUDE.md -> @frontend/AGENTS.md

## Modulos del sistema

1. autenticacion — @docs/specs-prds/autenticacion.md
2. usuarios — @docs/specs-prds/usuarios.md
3. productos — @docs/specs-prds/productos.md
4. carrito — @docs/specs-prds/carrito.md
5. pedidos — @docs/specs-prds/pedidos.md
