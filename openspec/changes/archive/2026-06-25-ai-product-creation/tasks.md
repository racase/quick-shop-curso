## 1. Configuración de entorno y dependencias

- [x] 1.1 Añadir `httpx` a `backend/requirements.txt` (cliente HTTP async para OpenRouter)
- [x] 1.2 Añadir variables `OPENROUTER_API_KEY` y `OPENROUTER_MODEL` a `backend/.env.example` y a `docker-compose.yml`
- [x] 1.3 Actualizar la configuración de la aplicación backend (`backend/app/core/config.py` o similar) para leer y validar `OPENROUTER_API_KEY` y `OPENROUTER_MODEL` al arranque

## 2. Backend — Servicio de integración con OpenRouter

- [x] 2.1 Crear `backend/app/services/ai_product_service.py` con función async `generate_product_fields(prompt: str) -> dict` que llama a OpenRouter via httpx
- [x] 2.2 Implementar el system prompt en el servicio para instruir al LLM a devolver JSON con los campos `name`, `description`, `price`, `stock`, `image_url`
- [x] 2.3 Añadir parseo y validación de la respuesta del LLM; levantar excepción si el JSON es inválido o faltan campos
- [x] 2.4 Configurar timeout de 30 segundos en el cliente httpx

## 3. Backend — Endpoint de generación

- [x] 3.1 Crear el schema Pydantic de request (`AIGenerateRequest` con campo `prompt: str`) y de response (`AIGenerateResponse` con `name`, `description`, `price`, `stock`, `image_url`)
- [x] 3.2 Añadir el endpoint `POST /api/v1/products/ai-generate` en el router de productos, protegido con la dependencia `require_admin`
- [x] 3.3 El endpoint llama al servicio de AI, captura errores de parseo y devuelve HTTP 502 si el LLM falla
- [x] 3.4 Escribir tests unitarios para el endpoint (mock del servicio): caso éxito, 403 para cliente, 401 sin token, 422 con prompt vacío, 502 cuando el LLM falla

## 4. Frontend — Servicio API

- [x] 4.1 Crear o extender el servicio de productos en el frontend (`frontend/src/services/productService.ts` o similar) añadiendo la función `generateProductWithAI(prompt: string): Promise<ProductFields>`

## 5. Frontend — Componente de formulario

- [x] 5.1 Añadir el botón "Crear producto con IA" al formulario de alta de producto en el panel admin (`ProductForm` o componente equivalente)
- [x] 5.2 Implementar el diálogo/modal de prompt donde el admin introduce la descripción en lenguaje natural
- [x] 5.3 Al confirmar el diálogo, llamar a `generateProductWithAI` y pre-rellenar los campos del formulario con la respuesta
- [x] 5.4 Mostrar estado de carga (spinner) en el botón mientras la petición está en vuelo y deshabilitar el botón
- [x] 5.5 Mostrar mensaje de error en el formulario si la petición falla, sin borrar los valores actuales del formulario

## 6. Verificación y documentación

- [ ] 6.1 Prueba manual del flujo completo: abrir el formulario de creación de producto → pulsar "Crear producto con IA" → introducir descripción → verificar que los campos se precargan correctamente
- [ ] 6.2 Verificar que un usuario cliente no puede acceder al endpoint (recibe 403)
- [ ] 6.3 Verificar que la API Key no aparece en las DevTools del navegador ni en el bundle de producción
- [ ] 6.4 Actualizar `README.md` o `docs/` con las nuevas variables de entorno requeridas