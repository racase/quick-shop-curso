from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.product import Product
from app.schemas.product import ProductCreate, ProductUpdate


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
