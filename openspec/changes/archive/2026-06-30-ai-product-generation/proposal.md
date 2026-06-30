## Why

Rellenar el formulario de alta de productos es una tarea repetitiva para el administrador: nombre, descripcion, precio y stock deben inventarse o buscarse manualmente cada vez. Añadir un boton "Crear con IA" que genere esos campos via LLM reduce friccion, acelera la carga de catalogo y sirve como demostracion practica de integracion de IA en una aplicacion de e-commerce.

## What Changes

- Nuevo endpoint `POST /api/v1/products/ai-generate` en el backend (solo administradores).
- El backend llama a OpenRouter con el modelo configurado y devuelve los campos del producto como JSON estructurado.
- La API key de OpenRouter reside exclusivamente en el backend (variable de entorno); el cliente nunca la ve.
- El modal de creacion de producto en `AdminProductsPage` incorpora el boton "Crear con IA", un campo de prompt y vuelca los campos generados en el formulario existente.
- Dos nuevas variables de entorno en el backend: `OPENROUTER_API_KEY` y `OPENROUTER_MODEL`.

## Capabilities

### New Capabilities

- `ai-product-generation`: Generacion automatica de campos de producto (nombre, descripcion, precio, stock) a partir de una descripcion en lenguaje natural, llamando a un LLM via OpenRouter desde el backend y volcando el resultado en el formulario de alta del admin.

### Modified Capabilities

<!-- No se modifican requisitos de capacidades existentes -->

## Impact

- **Backend**: nuevo endpoint en `app/api/v1/products.py`, nuevo schema de request/response, llamada HTTP asincrona a OpenRouter. Posible nueva dependencia `httpx` si no esta ya en pyproject.toml.
- **Frontend**: cambios en `AdminProductsPage.jsx` y nueva funcion en `src/api/products.js`.
- **Configuracion**: `backend/.env`, `backend/.env.example` y `docker-compose.yml` necesitan las variables `OPENROUTER_API_KEY` y `OPENROUTER_MODEL`.
- **Sin cambios en base de datos**: no se añaden tablas ni columnas; no se genera migracion.
