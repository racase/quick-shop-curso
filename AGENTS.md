# Guia de agentes — QuickShop (raiz)

## Convenciones generales

### Idioma

- Documentacion (CLAUDE.md, AGENTS.md, specs, README): castellano.
- Codigo fuente (variables, funciones, clases, constantes, nombres de archivo): ingles.
- Mensajes de commit: ingles en imperativo (add, fix, update, remove).
- Comentarios en el codigo: ingles; solo cuando el motivo no es evidente por si solo.

### Estilo

- Sin emojis en ningun archivo del proyecto.
- Sin secretos, passwords ni URLs hardcodeadas en el codigo fuente.
- Variables sensibles en archivos `.env`; nunca en el codigo ni en el historial de git.
- No agregar codigo comentado ni bloques de compatibilidad hacia atras a menos que sea imprescindible.
- No crear comentarios que expliquen que hace el codigo; solo comentar el por que cuando no es obvio.

### Control de versiones

- Ramas: `feature/<nombre>`, `fix/<nombre>`, `docs/<nombre>`.
- Commits atomicos: un cambio logico por commit.
- El archivo `.env` nunca se versiona. El archivo `.env.example` si se versiona con todos los valores en blanco o con valores de ejemplo seguros.

## Estructura de carpetas

```
quick-shop-curso/
├── backend/
│   ├── app/
│   │   ├── api/           # Routers FastAPI (un archivo por modulo)
│   │   ├── core/          # Configuracion, seguridad JWT, dependencias compartidas
│   │   ├── db/            # Sesion async de SQLAlchemy
│   │   ├── models/        # Modelos ORM SQLAlchemy (un archivo por tabla principal)
│   │   ├── schemas/       # Schemas Pydantic de entrada y salida
│   │   ├── services/      # Logica de negocio (un archivo por modulo)
│   │   ├── seed.py        # Seed idempotente de datos iniciales
│   │   └── main.py        # Punto de entrada: instancia FastAPI, registro de routers, CORS
│   ├── alembic/           # Migraciones generadas por Alembic
│   ├── alembic.ini
│   ├── tests/             # Tests (pytest)
│   ├── Dockerfile
│   ├── pyproject.toml     # Dependencias gestionadas por uv
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── api/           # Funciones de llamada HTTP agrupadas por modulo
│   │   ├── components/    # Componentes React reutilizables
│   │   ├── pages/         # Componentes de pagina (uno por ruta principal)
│   │   ├── hooks/         # Custom hooks
│   │   ├── store/         # Estado global (Context API)
│   │   └── main.jsx       # Punto de entrada React
│   ├── Dockerfile
│   ├── nginx.conf         # Configuracion de nginx para produccion
│   ├── package.json
│   ├── pnpm-workspace.yaml
│   ├── pnpm-lock.yaml
│   └── .env.example
├── docs/
│   └── specs-prds/        # Especificaciones funcionales por modulo
├── docker-compose.yml
├── .env.example           # Variables de entorno de la orquestacion completa
├── .gitignore
├── CLAUDE.md
└── AGENTS.md
```

## Orden de desarrollo

Respetar estrictamente este orden:

1. Configuracion de base de datos y migraciones Alembic.
2. Modelos SQLAlchemy.
3. Schemas Pydantic.
4. Servicios (logica de negocio).
5. Routers FastAPI con endpoints.
6. Seed idempotente.
7. Tests de backend.
8. Inicio del frontend modulo a modulo.

No iniciar el frontend de un modulo hasta que sus endpoints de backend esten completos y verificados.

Orden de modulos: autenticacion -> usuarios -> productos -> carrito -> pedidos.

## Variables de entorno

Cada capa dispone de su propio `.env.example`. El archivo `.env.example` de la raiz contiene las variables que consume docker-compose.

### Variables criticas

| Variable                    | Descripcion                                           |
|-----------------------------|-------------------------------------------------------|
| `SECRET_KEY`                | Clave para firmar JWT; minimo 32 caracteres aleatorios |
| `DATABASE_URL`              | URL de conexion async a PostgreSQL                    |
| `POSTGRES_USER`             | Usuario de PostgreSQL                                 |
| `POSTGRES_PASSWORD`         | Password de PostgreSQL                                |
| `POSTGRES_DB`               | Nombre de la base de datos                            |
| `CORS_ORIGINS`              | Lista de origenes permitidos separados por coma       |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | Duracion del JWT en minutos (default: 120)          |
| `VITE_API_URL`              | URL base de la API consumida por el frontend          |

## pnpm 11 — aviso importante

En pnpm 11, las aprobaciones de build scripts se guardan en `pnpm-workspace.yaml` bajo la clave `allowedDeprecatedVersions` / `allowBuilds`, y no en el lockfile como en versiones anteriores. El Dockerfile del frontend debe copiar `pnpm-workspace.yaml` antes de ejecutar `pnpm install`; de lo contrario fallara con `ERR_PNPM_IGNORED_BUILDS`.

Ejemplo de Dockerfile correcto para frontend:

```dockerfile
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile
```

## Docker Compose

La orquestacion tiene tres servicios:

- `db`: PostgreSQL 15; con healthcheck; datos persistidos en volumen named.
- `backend`: FastAPI; depende de `db` con condicion `service_healthy`; ejecuta migraciones y seed al arrancar.
- `frontend`: Nginx sirviendo el build de Vite; depende de `backend`.

Las variables de entorno de cada servicio se inyectan desde el archivo `.env` de la raiz.
