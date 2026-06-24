import uuid
from typing import Optional

from sqlalchemy import func, or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.product import Product
from app.schemas.product import ProductCreate, ProductUpdate


async def list_active(
    db: AsyncSession, page: int = 1, size: int = 20, search: Optional[str] = None
) -> tuple[list[Product], int]:
    query = select(Product).where(Product.is_active.is_(True))
    count_query = select(func.count()).select_from(Product).where(Product.is_active.is_(True))
    if search:
        pattern = f"%{search}%"
        condition = or_(Product.name.ilike(pattern), Product.description.ilike(pattern))
        query = query.where(condition)
        count_query = count_query.where(condition)
    total = (await db.execute(count_query)).scalar_one()
    offset = (page - 1) * size
    result = await db.execute(query.offset(offset).limit(size))
    return result.scalars().all(), total


async def get_active_by_id(db: AsyncSession, product_id: str) -> Optional[Product]:
    try:
        pid = uuid.UUID(product_id)
    except ValueError:
        return None
    result = await db.execute(
        select(Product).where(Product.id == pid, Product.is_active.is_(True))
    )
    return result.scalar_one_or_none()


async def list_all(
    db: AsyncSession, page: int = 1, size: int = 20, search: Optional[str] = None
) -> tuple[list[Product], int]:
    query = select(Product)
    count_query = select(func.count()).select_from(Product)
    if search:
        pattern = f"%{search}%"
        condition = or_(Product.name.ilike(pattern), Product.description.ilike(pattern))
        query = query.where(condition)
        count_query = count_query.where(condition)
    total = (await db.execute(count_query)).scalar_one()
    offset = (page - 1) * size
    result = await db.execute(query.offset(offset).limit(size))
    return result.scalars().all(), total


async def get_by_id(db: AsyncSession, product_id: str) -> Optional[Product]:
    try:
        pid = uuid.UUID(product_id)
    except ValueError:
        return None
    result = await db.execute(select(Product).where(Product.id == pid))
    return result.scalar_one_or_none()


async def create(db: AsyncSession, data: ProductCreate) -> Product:
    product = Product(**data.model_dump())
    db.add(product)
    await db.commit()
    await db.refresh(product)
    return product


async def update(
    db: AsyncSession, product_id: str, data: ProductUpdate
) -> Optional[Product]:
    product = await get_by_id(db, product_id)
    if not product:
        return None
    for field, value in data.model_dump(exclude_none=True).items():
        setattr(product, field, value)
    await db.commit()
    await db.refresh(product)
    return product


async def deactivate(db: AsyncSession, product_id: str) -> Optional[Product]:
    product = await get_by_id(db, product_id)
    if not product:
        return None
    product.is_active = False
    await db.commit()
    return product
