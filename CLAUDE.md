# QuickShop - Guia para agentes de codigo

QuickShop es una plataforma mini de e-commerce construida con FastAPI (backend) y React + Vite (frontend), usando PostgreSQL como base de datos y Docker para el despliegue.

Los detalles completos de convenciones, estructura de carpetas, flujo de trabajo y configuraciones especiales estan en @AGENTS.md.

## Modulos del sistema

El sistema tiene cinco modulos: autenticacion, usuarios, productos, carrito y pedidos.
Las especificaciones de cada modulo estan en `docs/specs-prds/`.

## Orden de desarrollo

Backend primero, frontend despues. Dentro de cada capa, el orden de modulos es: autenticacion > usuarios > productos > carrito > pedidos.

## Instrucciones especificas por capa

- Backend (FastAPI + SQLAlchemy + Alembic): @backend/AGENTS.md
- Frontend (React + Vite + Tailwind): @frontend/AGENTS.md
