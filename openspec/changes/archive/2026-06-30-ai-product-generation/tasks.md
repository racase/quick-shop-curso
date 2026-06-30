## 1. Backend - Configuracion

- [x] 1.1 Añadir `OPENROUTER_API_KEY` y `OPENROUTER_MODEL` a `app/core/config.py` via `pydantic-settings`
- [x] 1.2 Añadir `httpx` como dependencia en `backend/pyproject.toml` si no esta ya presente
- [x] 1.3 Añadir `OPENROUTER_API_KEY` y `OPENROUTER_MODEL` a `backend/.env.example`

## 2. Backend - Endpoint de generacion

- [x] 2.1 Crear schemas Pydantic `AIGenerateRequest` (campo `prompt: str`) y `AIGenerateResponse` (`nombre`, `descripcion`, `precio`, `stock`, `imagen_url`) en `app/schemas/products.py`
- [x] 2.2 Implementar la funcion de servicio `generate_product_with_ai(prompt, settings)` en `app/services/products.py` que llame a OpenRouter via `httpx.AsyncClient` con el system prompt estructurado y parsee la respuesta JSON
- [x] 2.3 Añadir el endpoint `POST /products/ai-generate` en `app/api/v1/products.py` con la dependencia `require_admin`, que llame al servicio y devuelva `AIGenerateResponse`
- [x] 2.4 Manejar los errores: 500 si falta `OPENROUTER_API_KEY`, 502 si la respuesta del LLM no es JSON valido o le faltan campos obligatorios

## 3. Frontend - API client

- [x] 3.1 Añadir la funcion `generateProductWithAI(token, prompt)` en `frontend/src/api/products.js` que llame a `POST /api/v1/products/ai-generate`

## 4. Frontend - UI en AdminProductsPage

- [x] 4.1 Añadir estado `showAIPanel` (boolean) y `aiPrompt` (string) y `generating` (boolean) al componente `AdminProductsPage`
- [x] 4.2 Añadir el boton "Crear con IA" encima del formulario, visible solo cuando el modal esta en modo creacion (`!editing`)
- [x] 4.3 Al pulsar "Crear con IA", mostrar el campo de texto de prompt y el boton "Generar"
- [x] 4.4 Implementar el handler `handleGenerate` que llame a `generateProductWithAI`, vuelque los campos en `form` y gestione errores en `formError`
- [x] 4.5 Durante la generacion, mostrar "Generando..." y deshabilitar el boton "Generar"
- [x] 4.6 Verificar que el boton "Crear con IA" no aparece cuando el modal se abre en modo edicion

## 5. Verificacion

- [x] 5.1 Comprobar que un cliente autenticado recibe 403 al llamar a `/api/v1/products/ai-generate`
- [x] 5.2 Comprobar que un admin recibe los campos generados correctamente y el formulario se rellena
- [x] 5.3 Comprobar que si falta `OPENROUTER_API_KEY` el endpoint responde 500 con mensaje claro
