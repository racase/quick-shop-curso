import asyncio
import json
from pathlib import Path

from sqlalchemy import select

from app.core.security import hash_password
from app.db.session import AsyncSessionLocal
from app.models.product import Product
from app.models.user import RolEnum, User

REPO_ROOT = Path(__file__).resolve().parent.parent
PRODUCTS_JSON = REPO_ROOT / "docs" / "products-images.json"


async def seed():
    async with AsyncSessionLocal() as db:
        user_count = (await db.execute(select(User))).scalars().first()
        if user_count is None:
            users = [
                User(email="admin@quickshop.com", hashed_password=hash_password("Admin1234!"), rol=RolEnum.administrador),
                User(email="cliente1@quickshop.com", hashed_password=hash_password("Cliente1234!"), rol=RolEnum.cliente),
                User(email="cliente2@quickshop.com", hashed_password=hash_password("Cliente1234!"), rol=RolEnum.cliente),
            ]
            db.add_all(users)
            await db.commit()
            print("Usuarios creados")
        else:
            print("Usuarios ya existen, omitiendo seed de usuarios")

        product_count = (await db.execute(select(Product))).scalars().first()
        if product_count is None:
            products_data = json.loads(PRODUCTS_JSON.read_text(encoding="utf-8"))
            products = [
                Product(
                    nombre=p["producto"],
                    descripcion=p.get("descripcion"),
                    precio=p["precio"],
                    stock=p["stock"],
                    imagen_url=p.get("imagen"),
                )
                for p in products_data
            ]
            db.add_all(products)
            await db.commit()
            print(f"{len(products)} productos creados")
        else:
            print("Productos ya existen, omitiendo seed de productos")


if __name__ == "__main__":
    asyncio.run(seed())
