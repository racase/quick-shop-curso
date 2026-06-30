import json

import httpx
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.models.product import Product
from app.schemas.product import AIGenerateResponse, ProductCreate, ProductUpdate

_AI_SYSTEM_PROMPT = (
    "Eres un asistente de comercio electronico. El usuario te da una descripcion de un producto. "
    "Devuelve EXCLUSIVAMENTE un objeto JSON (sin markdown, sin texto adicional) con estos campos:\n"
    "- nombre: string, maximo 100 caracteres\n"
    "- descripcion: string, entre 20 y 300 caracteres\n"
    "- precio: number, mayor que 0, con maximo 2 decimales, en euros\n"
    "- stock: integer, mayor o igual a 0, valor razonable para un comercio medio (entre 10 y 200)\n"
    "- imagen_url: null (siempre null, el admin la anadira manualmente)"
)


async def list_products(db: AsyncSession, skip: int = 0, limit: int = 100) -> list[Product]:
    result = await db.execute(
        select(Product).where(Product.is_active == True).offset(skip).limit(limit)
    )
    return list(result.scalars().all())


async def get_product(db: AsyncSession, product_id: int) -> Product | None:
    result = await db.execute(select(Product).where(Product.id == product_id))
    return result.scalar_one_or_none()


async def create_product(db: AsyncSession, data: ProductCreate) -> Product:
    product = Product(**data.model_dump())
    db.add(product)
    await db.commit()
    await db.refresh(product)
    return product


async def update_product(db: AsyncSession, product: Product, data: ProductUpdate) -> Product:
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(product, field, value)
    await db.commit()
    await db.refresh(product)
    return product


async def deactivate_product(db: AsyncSession, product: Product) -> Product:
    product.is_active = False
    await db.commit()
    await db.refresh(product)
    return product


async def generate_product_with_ai(prompt: str) -> AIGenerateResponse:
    if not settings.OPENROUTER_API_KEY:
        raise ValueError("OpenRouter API key no configurada")

    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            resp = await client.post(
                "https://openrouter.ai/api/v1/chat/completions",
                headers={
                    "Authorization": f"Bearer {settings.OPENROUTER_API_KEY}",
                    "Content-Type": "application/json",
                },
                json={
                    "model": settings.OPENROUTER_MODEL,
                    "messages": [
                        {"role": "system", "content": _AI_SYSTEM_PROMPT},
                        {"role": "user", "content": prompt},
                    ],
                },
            )
            resp.raise_for_status()
    except httpx.HTTPStatusError as exc:
        raise RuntimeError(f"OpenRouter error {exc.response.status_code}") from exc
    except httpx.RequestError as exc:
        raise RuntimeError("Error de red al contactar OpenRouter") from exc

    raw = resp.json()["choices"][0]["message"]["content"].strip()

    # Strip possible markdown code fences
    if raw.startswith("```"):
        raw = raw.split("```")[1]
        if raw.startswith("json"):
            raw = raw[4:]

    try:
        data = json.loads(raw)
    except json.JSONDecodeError as exc:
        raise ValueError("Respuesta del modelo no valida") from exc

    if "nombre" not in data or "precio" not in data:
        raise ValueError("Respuesta del modelo no valida")

    return AIGenerateResponse(
        nombre=data.get("nombre", ""),
        descripcion=data.get("descripcion"),
        precio=float(data.get("precio", 0)),
        stock=int(data.get("stock", 0)),
        imagen_url=None,
    )
