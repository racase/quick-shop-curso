import json
from decimal import Decimal

import httpx

from app.core.config import settings


async def generate_product_fields(prompt: str) -> dict:
    """
    Generate product fields (name, description, price, stock, image_url) using OpenRouter LLM.
    
    Args:
        prompt: Natural language description of the product (from admin)
    
    Returns:
        dict with keys: name, description, price, stock, image_url
    
    Raises:
        ValueError: If the LLM response is malformed or missing required fields
        httpx.HTTPError: If the API call fails
    """
    
    system_prompt = """Eres un asistente que genera campos de productos para una tienda online.
    
Cuando el usuario describe un producto, debes devolver UNICAMENTE un objeto JSON valido (sin markdown, sin explicaciones) con estos campos exactos:
- "name": Nombre del producto (max 255 caracteres, conciso)
- "description": Descripcion detallada del producto (max 500 caracteres)
- "price": Precio en euros como numero decimal (ej: 29.99, 150.50)
- "stock": Cantidad inicial en stock (numero entero positivo, ej: 10, 50)
- "image_url": URL de una imagen representativa del producto (ej: https://example.com/image.jpg)

Ejemplo de respuesta correcta:
{"name": "Auriculares Inalambricos", "description": "Auriculares de alta calidad con cancelacion de ruido activa.", "price": 79.99, "stock": 25, "image_url": "https://example.com/headphones.jpg"}

IMPORTANTE: Devuelve SOLO el JSON, sin decoraciones ni explicaciones."""

    user_message = f"Genera los campos de producto para: {prompt}"
    
    async with httpx.AsyncClient(timeout=30.0) as client:
        response = await client.post(
            "https://openrouter.ai/api/v1/chat/completions",
            headers={
                "Authorization": f"Bearer {settings.openrouter_api_key}",
                "HTTP-Referer": "https://quickshop.local",
                "X-Title": "QuickShop Admin",
            },
            json={
                "model": settings.openrouter_model,
                "messages": [
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_message},
                ],
                "temperature": 0.7,
                "max_tokens": 500,
            },
        )
        response.raise_for_status()
    
    data = response.json()
    
    if "choices" not in data or len(data["choices"]) == 0:
        raise ValueError("No response choices from OpenRouter")
    
    content = data["choices"][0]["message"]["content"].strip()
    
    # Remove markdown code blocks if present
    if content.startswith("```"):
        content = content.split("```")[1]
        if content.startswith("json"):
            content = content[4:]
        content = content.strip()
    
    try:
        result = json.loads(content)
    except json.JSONDecodeError as e:
        raise ValueError(f"LLM response is not valid JSON: {e}")
    
    # Validate required fields
    required_fields = {"name", "description", "price", "stock", "image_url"}
    missing_fields = required_fields - set(result.keys())
    if missing_fields:
        raise ValueError(f"Missing required fields in LLM response: {missing_fields}")
    
    # Type conversion and validation
    try:
        return {
            "name": str(result["name"]).strip(),
            "description": str(result["description"]).strip(),
            "price": float(result["price"]),
            "stock": int(result["stock"]),
            "image_url": str(result["image_url"]).strip(),
        }
    except (TypeError, ValueError) as e:
        raise ValueError(f"Invalid field types in LLM response: {e}")
