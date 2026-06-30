## Context

El formulario de alta de productos en `AdminProductsPage` es manual: el admin rellena nombre, descripcion, precio, stock e imagen_url a mano. No existe ninguna integracion con LLMs ni llamadas a servicios externos desde el backend. La capa de productos ya tiene un router FastAPI con sus esquemas Pydantic y la dependencia `require_admin`.

## Goals / Non-Goals

**Goals:**
- Añadir un endpoint `POST /api/v1/products/ai-generate` que reciba un prompt y devuelva campos de producto generados por un LLM.
- Mantener la API key de OpenRouter en el backend; el navegador nunca la recibe.
- Integrar el boton "Crear con IA" en el modal de creacion de producto sin alterar el flujo de guardado existente.
- Hacer el modelo LLM configurable via variable de entorno.

**Non-Goals:**
- Generacion de imagen (`imagen_url` siempre es `null` en la respuesta).
- Boton de IA en modo edicion de producto.
- Rate limiting o cuota de uso por usuario.
- Persistencia de prompts o respuestas del LLM.
- Streaming de la respuesta del LLM.

## Decisions

### D1: El backend actua como proxy hacia OpenRouter

**Decision**: La peticion a OpenRouter se hace desde el backend, no desde el frontend.

**Alternativas consideradas**:
- Llamar a OpenRouter directamente desde el navegador: expone la API key en el cliente, inaceptable.
- Proxy via serverless function separada: overhead de infraestructura innecesario para un proyecto de curso.

**Razon**: La API key debe permanecer en el servidor. El endpoint es exclusivo para admins, por lo que el control de acceso ya esta resuelto con `require_admin`.

---

### D2: Respuesta JSON estructurada via system prompt

**Decision**: Se instruye al modelo con un system prompt que le exige devolver exclusivamente un objeto JSON con los campos `nombre`, `descripcion`, `precio`, `stock` e `imagen_url`.

**Alternativas consideradas**:
- Function calling / tool use de OpenAI: mas robusto pero introduce mayor complejidad y dependencia de capacidades especificas del modelo.
- Parseo heuristico del texto libre: fragil y propenso a errores.

**Razon**: Un system prompt estricto es suficiente para modelos de calidad media-alta. Si el parseo falla, el backend devuelve 502 con mensaje claro; el admin simplemente vuelve a intentarlo.

---

### D3: `httpx` para la llamada HTTP asincrona

**Decision**: Usar `httpx.AsyncClient` para llamar a la API de OpenRouter.

**Alternativas consideradas**:
- SDK oficial de OpenAI (compatible con OpenRouter): añade una dependencia pesada para una sola llamada.
- `aiohttp`: funcionalmente equivalente, pero `httpx` tiene una API mas ergonomica y es ya habitual en ecosistemas FastAPI.

**Razon**: Minima dependencia nueva, API asincrona nativa, sin overhead de SDK.

---

### D4: Variables de entorno para la configuracion de OpenRouter

**Decision**: `OPENROUTER_API_KEY` y `OPENROUTER_MODEL` se leen desde el entorno via `pydantic-settings` (ya en uso en `app/core/config.py`).

**Razon**: Consistente con el patron existente del proyecto. Si `OPENROUTER_API_KEY` esta ausente, el endpoint devuelve 500 en tiempo de request (no en startup) para no bloquear el arranque del servidor cuando la feature no esta configurada.

## Risks / Trade-offs

- **LLM devuelve JSON invalido o incompleto** → El backend atrapa el error de parseo y responde 502 con detalle. El admin puede reintentar con un prompt mas claro.
- **Latencia alta de OpenRouter** → Las llamadas a LLM pueden tardar 3-10 segundos. El frontend muestra estado "Generando..." para gestionar la espera. No se añade timeout en esta primera version.
- **Modelo `GPT120 OSS` no disponible en OpenRouter** → Si el modelo no existe o da error, OpenRouter devolvera 4xx/5xx que el backend propagara como 502. El admin debe verificar el nombre del modelo en la variable de entorno.
- **Sin persistencia de prompts** → No hay auditoria de lo que se genera. Aceptable para un proyecto de curso; en produccion real se logging.

## Open Questions

- Ninguna. El alcance esta acotado por el spec y el PRD existente.
