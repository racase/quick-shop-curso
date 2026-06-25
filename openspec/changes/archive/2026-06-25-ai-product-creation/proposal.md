## Why

El formulario de alta de productos requiere que el administrador rellene manualmente todos los campos, lo que es tedioso y propenso a errores. Añadir generación asistida por IA permite que el admin describa brevemente el producto y obtenga un borrador completo de los campos en segundos, reduciendo el tiempo de catalogación y mejorando la consistencia de los datos.

## What Changes

- Nuevo endpoint en el backend `POST /api/v1/products/generate-ai` que recibe un prompt del administrador y llama a OpenRouter con el modelo configurado ("GPT120 OSS"), devolviendo un objeto con los campos del producto precargados.
- El API Key de OpenRouter se almacena exclusivamente en el backend (variable de entorno), nunca expuesto al frontend.
- Nuevo botón "Crear producto con IA" en el formulario de alta de productos (`ProductForm`) del panel de administración.
- Al pulsar el botón, se muestra un campo de texto para que el admin describa el producto; al confirmar, se llama al nuevo endpoint y los campos del formulario se precargan con la respuesta del LLM.
- El admin puede revisar, editar y guardar el producto normalmente tras la generación.
- Solo los usuarios con rol `admin` pueden acceder al endpoint de generación.

## Capabilities

### New Capabilities

- `ai-product-generation`: Endpoint backend y lógica de integración con OpenRouter para generar campos de producto mediante LLM. Incluye prompt engineering, parseo de respuesta y precarga del formulario en el frontend.

### Modified Capabilities

- `product-catalog`: El formulario de alta de productos incorpora el nuevo flujo de generación con IA (cambio de requisitos UX en la pantalla de creación).

## Impact

- **Backend**: Nuevo módulo de integración con OpenRouter en `backend/app/`. Nueva variable de entorno `OPENROUTER_API_KEY` y `OPENROUTER_MODEL`. Nueva dependencia HTTP (httpx o similar).
- **Frontend**: Modificación del componente de formulario de alta de productos en `frontend/src/`. Nuevo hook/servicio para llamar al endpoint de generación.
- **Seguridad**: El endpoint requiere autenticación y rol `admin`. El API Key nunca sale del servidor.
- **Configuración**: Actualización de `.env.example` y `docker-compose.yml` con la nueva variable de entorno.
