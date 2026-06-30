## ADDED Requirements

### Requirement: Admin puede generar campos de producto con IA
El sistema SHALL proporcionar un endpoint `POST /api/v1/products/ai-generate` que reciba una descripcion en lenguaje natural y devuelva los campos `nombre`, `descripcion`, `precio`, `stock` e `imagen_url` generados por un LLM via OpenRouter. El endpoint SHALL estar restringido a usuarios con rol administrador.

#### Scenario: Generacion exitosa
- **WHEN** un administrador autenticado llama a `POST /api/v1/products/ai-generate` con un prompt valido
- **THEN** el sistema responde 200 con un objeto JSON que contiene `nombre` (string), `descripcion` (string), `precio` (number > 0), `stock` (integer >= 0) e `imagen_url` (null)

#### Scenario: Usuario no autenticado
- **WHEN** se llama al endpoint sin token de autorizacion
- **THEN** el sistema responde 401

#### Scenario: Usuario autenticado sin rol admin
- **WHEN** un cliente autenticado llama al endpoint
- **THEN** el sistema responde 403

#### Scenario: Prompt ausente o vacio
- **WHEN** se llama al endpoint con el campo `prompt` ausente o con cadena vacia
- **THEN** el sistema responde 422

---

### Requirement: La API key de OpenRouter nunca se expone al cliente
El sistema SHALL realizar la llamada a OpenRouter exclusivamente desde el backend. La API key SHALL leerse de la variable de entorno `OPENROUTER_API_KEY` y no SHALL transmitirse al navegador en ningun caso.

#### Scenario: API key no configurada
- **WHEN** `OPENROUTER_API_KEY` no esta definida y se llama al endpoint
- **THEN** el sistema responde 500 con el detalle "OpenRouter API key no configurada"

#### Scenario: API key configurada correctamente
- **WHEN** `OPENROUTER_API_KEY` esta definida y el modelo responde
- **THEN** el cliente solo recibe los campos del producto generados, nunca la clave

---

### Requirement: El modelo LLM es configurable via variable de entorno
El sistema SHALL leer el identificador del modelo a usar desde la variable de entorno `OPENROUTER_MODEL`. El valor por defecto SHALL ser el modelo configurado en el entorno de despliegue.

#### Scenario: Modelo configurado
- **WHEN** `OPENROUTER_MODEL` tiene un valor valido y OpenRouter puede resolverlo
- **THEN** el endpoint usa ese modelo para la generacion

#### Scenario: OpenRouter devuelve error de modelo
- **WHEN** el modelo especificado no existe o OpenRouter devuelve error
- **THEN** el endpoint responde 502 con mensaje descriptivo

---

### Requirement: El backend maneja respuestas invalidas del LLM
El sistema SHALL intentar parsear la respuesta del LLM como JSON. Si el JSON es invalido o le faltan los campos obligatorios (`nombre`, `precio`), el sistema SHALL responder 502 con un mensaje claro.

#### Scenario: Respuesta JSON valida
- **WHEN** el LLM devuelve un JSON con al menos `nombre` y `precio` validos
- **THEN** el endpoint responde 200 con los campos normalizados

#### Scenario: Respuesta JSON invalida
- **WHEN** el LLM devuelve texto que no es JSON parseable
- **THEN** el endpoint responde 502 con detalle "Respuesta del modelo no valida"

---

### Requirement: El formulario de alta vuelca los campos generados
El sistema SHALL proporcionar en `AdminProductsPage` un boton "Crear con IA" visible unicamente en el modal de creacion (no en edicion). Al pulsarlo SHALL mostrarse un campo de texto para el prompt y un boton "Generar". Tras una respuesta exitosa SHALL volcarse los campos `nombre`, `descripcion`, `precio` y `stock` en el formulario existente.

#### Scenario: Generacion y volcado exitoso
- **WHEN** el admin introduce un prompt y pulsa "Generar"
- **THEN** el frontend llama al endpoint, espera la respuesta y rellena los campos del formulario con los valores recibidos

#### Scenario: Error en la generacion
- **WHEN** el endpoint responde con error
- **THEN** el frontend muestra el mensaje de error en la zona de errores del formulario sin limpiar los campos ya rellenados

#### Scenario: Estado de carga
- **WHEN** la llamada al endpoint esta en curso
- **THEN** el boton "Generar" muestra el texto "Generando..." y esta deshabilitado

#### Scenario: Boton no visible en modo edicion
- **WHEN** el admin abre el modal en modo edicion de un producto existente
- **THEN** el boton "Crear con IA" no esta visible en el modal
