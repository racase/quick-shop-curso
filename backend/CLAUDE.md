# Backend — QuickShop

API REST construida con FastAPI + SQLAlchemy 2.0 async + Alembic sobre PostgreSQL 15. Gestionada con uv.

## Arranque rapido (desarrollo local)

```bash
cd backend
cp .env.example .env
uv sync
uv run alembic upgrade head
uv run python -m app.seed
uv run uvicorn app.main:app --reload
```

## Convenciones y guia de agentes

Las convenciones detalladas de arquitectura, patrones de codigo, seguridad JWT, migraciones y seed se encuentran en @backend/AGENTS.md.
