## Context

QuickShop tiene un panel de administración donde los admins crean productos manualmente rellenando todos los campos (nombre, descripción, precio, stock, imagen). El formulario actual no tiene ningún apoyo de IA. Se introduce un flujo asistido: el admin describe brevemente el producto en lenguaje natural y el backend genera un borrador de los campos vía LLM (OpenRouter, modelo "GPT120 OSS").

El API Key de OpenRouter es un secreto del servidor; exponer credenciales de terceros al frontend sería un riesgo de seguridad inaceptable. Por eso toda la integración con OpenRouter reside en el backend.

## Goals / Non-Goals

**Goals:**
- Endpoint autenticado `POST /api/v1/products/ai-generate` accesible solo para admins que recibe un `prompt` y devuelve campos de producto estructurados.
- Integración backend con OpenRouter via HTTP (httpx async) usando el modelo configurado por variable de entorno.
- Botón "Crear producto con IA" en el formulario de alta de productos del panel admin.
- Modal de prompt → llamada al endpoint → precarga del formulario con la respuesta.
- Variables de entorno `OPENROUTER_API_KEY` y `OPENROUTER_MODEL` en el backend.

**Non-Goals:**
- Generación de imágenes de producto (solo campos de texto/precio/stock).
- Guardado automático sin revisión del admin.
- Exposición del API Key al frontend en ningún caso.
- Soporte multimodal (imágenes como input del LLM).
- Caché o persistencia de respuestas del LLM.

## Decisions

### D1: El endpoint del backend hace la llamada a OpenRouter, no el frontend

**Decisión**: `POST /api/v1/products/ai-generate` en el backend actúa como proxy hacia OpenRouter.

**Alternativa descartada**: Llamada directa desde el frontend con el API Key embebido o pasado como header.

**Razón**: El API Key nunca debe salir del servidor. Un frontend puede ser inspeccionado por el usuario; cualquier credencial embebida sería accesible públicamente. La arquitectura de proxy backend es el patrón estándar para integrar servicios de terceros con claves secretas.

---

### D2: httpx (async) como cliente HTTP para OpenRouter

**Decisión**: Usar `httpx` con cliente async para llamar a la API de OpenRouter desde FastAPI.

**Alternativa descartada**: `requests` (bloqueante, incompatible con async FastAPI), `aiohttp` (más verboso, sin ventaja clara).

**Razón**: `httpx` tiene API compatible con `requests`, soporte nativo async/await, y es la elección habitual en proyectos FastAPI modernos. No añade peso innecesario al proyecto.

---

### D3: Prompt engineering en el backend con salida JSON estructurada

**Decisión**: El backend construye un system prompt que instruye al LLM a devolver un JSON con los campos `name`, `description`, `price`, `stock`, `image_url`. El backend parsea y valida la respuesta antes de devolverla al frontend.

**Alternativa descartada**: Devolver texto libre y parsear en el frontend.

**Razón**: Centralizar el prompt y el parseo en el backend facilita el mantenimiento, evita lógica duplicada y garantiza que el frontend siempre reciba datos tipados y validados.

---

### D4: Autorización mediante rol `admin` existente

**Decisión**: El endpoint reutiliza el decorador/dependencia `require_admin` ya existente en el proyecto.

**Razón**: No hay motivo para introducir un nuevo mecanismo de autorización. El rol admin ya cubre este caso de uso.

---

### D5: Variables de entorno para configurar el modelo

**Decisión**: `OPENROUTER_API_KEY` y `OPENROUTER_MODEL` (default: `"openai/gpt-4o-mini"` como placeholder hasta que se defina el modelo exacto "GPT120 OSS") en el fichero `.env` del backend.

**Razón**: Permite cambiar el modelo sin tocar código y mantiene la flexibilidad para distintos entornos (desarrollo, producción).

## Risks / Trade-offs

- **Latencia del LLM** → El frontend debe mostrar un estado de carga mientras espera la respuesta (el LLM puede tardar 2-10 segundos). Mitigación: spinner/loading en el botón, timeout configurable en el cliente httpx (default 30s).
- **Respuesta mal formada del LLM** → El backend puede recibir JSON inválido o con campos faltantes. Mitigación: parseo defensivo en el backend con valores por defecto; se devuelve HTTP 502 si el LLM no produce un JSON válido.
- **Coste de la API** → Cada clic genera una llamada de pago a OpenRouter. Mitigación: el endpoint es solo-admin (superficie limitada), no hay uso anónimo posible.
- **Modelo "GPT120 OSS" no identificado en OpenRouter** → El nombre exacto del modelo debe confirmarse en la documentación de OpenRouter antes del despliegue. Mitigación: configuración via variable de entorno, fácil de cambiar sin redespliegue completo.
