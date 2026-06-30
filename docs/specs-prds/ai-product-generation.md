# Feature: Generacion de productos con IA

## Descripcion

El administrador puede generar automaticamente los campos de un producto nuevo pulsando el boton "Crear con IA" en el formulario de alta. El admin escribe una descripcion libre del producto (nombre, categoria, estilo, etc.) y el sistema llama a un LLM a traves de OpenRouter para devolver los campos precumplimentados. El admin revisa los valores generados, los ajusta si es necesario y guarda el producto de la forma habitual.

La peticion a OpenRouter se realiza siempre desde el backend, nunca desde el navegador, de modo que la API key no se expone al cliente.

## Flujo de usuario

1. El admin pulsa "Nuevo producto" → se abre el modal de creacion.
2. El admin pulsa el boton "Crear con IA" (situado encima del formulario).
3. Aparece un campo de texto para introducir la descripcion del producto (ej. "zapatilla deportiva de running unisex, gama media").
4. El admin pulsa "Generar" → el frontend llama al endpoint `POST /api/v1/products/ai-generate`.
5. El backend llama a OpenRouter con el prompt y el modelo configurado; espera la respuesta JSON estructurada.
6. El frontend recibe los campos generados y los vuelca en el formulario.
7. El admin revisa, modifica si lo desea y pulsa "Guardar" para crear el producto con el flujo existente.

## Backend

### Nuevo endpoint

#### POST /api/v1/products/ai-generate

Genera los campos de un producto a partir de una descripcion en lenguaje natural. Solo accesible para administradores.

**Headers:** `Authorization: Bearer {token}`

**Request body:**
```json
{
  "prompt": "zapatilla deportiva de running unisex, gama media"
}
```

**Response 200:**
```json
{
  "nombre": "Zapatilla Running Pro Unisex",
  "descripcion": "Zapatilla de running diseñada para uso diario, suela amortiguada y transpirable. Ideal para asfalto y pistas.",
  "precio": 79.99,
  "stock": 50,
  "imagen_url": null
}
```

**Errores:**
- 401 Unauthorized: token ausente o invalido
- 403 Forbidden: el usuario no es administrador
- 422 Unprocessable Entity: campo `prompt` ausente o vacio
- 502 Bad Gateway: error en la llamada a OpenRouter (timeout, error de red, respuesta no parseable)

---

### Logica del endpoint

1. Verificar que el usuario es administrador (dependency `require_admin`).
2. Construir el system prompt que instruye al modelo a devolver un objeto JSON con los campos `nombre`, `descripcion`, `precio`, `stock` e `imagen_url`.
3. Llamar a la API de OpenRouter via HTTP (endpoint `https://openrouter.ai/api/v1/chat/completions`) con el modelo configurado en `OPENROUTER_MODEL`.
4. Parsear la respuesta: extraer el contenido del primer `choices[0].message.content` e intentar parsear el JSON embebido.
5. Validar que el JSON contiene al menos `nombre` y `precio` validos; rellenar el resto con valores por defecto si faltan.
6. Devolver el objeto validado.

### System prompt al LLM

```
Eres un asistente de comercio electronico. El usuario te da una descripcion de un producto.
Devuelve EXCLUSIVAMENTE un objeto JSON (sin markdown, sin texto adicional) con estos campos:
- nombre: string, maximo 100 caracteres
- descripcion: string, entre 20 y 300 caracteres
- precio: number, mayor que 0, con maximo 2 decimales, en euros
- stock: integer, mayor o igual a 0, valor razonable para un comercio medio (entre 10 y 200)
- imagen_url: null (siempre null, el admin la añadira manualmente)
```

### Configuracion OpenRouter

| Variable de entorno    | Descripcion                                    | Ejemplo                        |
|------------------------|------------------------------------------------|--------------------------------|
| `OPENROUTER_API_KEY`   | API key de OpenRouter. Obligatoria.            | `sk-or-v1-...`                 |
| `OPENROUTER_MODEL`     | Identificador del modelo a usar.               | `GPT120 OSS`                   |

Ambas variables deben declararse en `backend/.env` y en `docker-compose.yml` (seccion `environment` del servicio `backend`). Si `OPENROUTER_API_KEY` no esta definida, el endpoint devuelve 500 con el detalle "OpenRouter API key no configurada".

### Dependencias Python

Ninguna libreria nueva: usar `httpx` (ya disponible en FastAPI async) o `aiohttp` para la llamada HTTP asincrona a OpenRouter.

Si `httpx` no esta en el pyproject.toml, añadirlo. No usar el SDK oficial de OpenAI para esta integracion.

## Frontend

### Cambios en AdminProductsPage

El modal de creacion de producto incorpora:

1. **Boton "Crear con IA"** — situado entre el titulo del modal y el formulario, solo visible cuando el modal esta en modo creacion (no en edicion).
2. **Campo de prompt** — aparece al pulsar "Crear con IA", campo de texto libre con placeholder "Describe el producto (ej. camiseta de algodon organico, azul, talla unica)".
3. **Boton "Generar"** — ejecuta la llamada al backend; mientras espera muestra el estado "Generando...".
4. **Volcado en formulario** — al recibir la respuesta, los campos `nombre`, `descripcion`, `precio`, `stock` se rellenan en el estado `form`. El campo `imagen_url` no se modifica.
5. **Manejo de errores** — si el backend responde con error, mostrar mensaje de error en el mismo espacio que `formError`.

### Llamada a la API (frontend)

Anadir en `frontend/src/api/products.js`:

```js
export async function generateProductWithAI(token, prompt) {
  const res = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/products/ai-generate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ prompt }),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw err
  }
  return res.json()
}
```

### Diseño del boton "Crear con IA" (pista transaccional)

El boton sigue las reglas del sistema de diseno (pista transaccional):
- Estilo: borde fino, pill, texto pequeño — similar al boton "Cancelar" del modal pero con acento visual distinto.
- Texto: "Crear con IA" en estado normal, "Generando..." cuando la llamada esta en curso (disabled).
- Clases sugeridas: `rounded-pill border border-ink text-ink px-4 py-2 text-sm hover:bg-ink hover:text-on-dark transition-colors`.

## Criterios de aceptacion

- Solo un administrador autenticado puede llamar al endpoint `/api/v1/products/ai-generate`.
- La API key de OpenRouter no es visible en ningun momento en el cliente.
- Si el LLM devuelve un JSON invalido o incompleto, el backend registra el error y responde 502 con un mensaje claro.
- El boton "Crear con IA" solo aparece en el modal de creacion, no en el de edicion.
- Los campos generados se pueden modificar libremente antes de guardar.
- El flujo de guardado (POST /products/) no cambia; el endpoint de IA solo genera los valores, no crea el producto.
- Si `OPENROUTER_API_KEY` no esta definida, el endpoint responde 500 con mensaje claro en lugar de crashear el servidor.

## Fuera de alcance

- Generacion de imagen: `imagen_url` siempre se devuelve como `null`; el admin la introduce a mano.
- Historial de generaciones: no se persiste ninguna traza de los prompts ni respuestas del LLM.
- Uso de IA en edicion de productos: el boton solo esta disponible en creacion.
- Rate limiting o cuota de uso por usuario.
