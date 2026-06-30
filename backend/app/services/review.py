from decimal import Decimal

from fastapi import HTTPException, status
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.product import Product
from app.models.review import Review
from app.schemas.review import ReviewCreate, ReviewListResponse, ReviewResponse


async def _get_active_product(db: AsyncSession, producto_id: int) -> Product:
    result = await db.execute(
        select(Product).where(Product.id == producto_id, Product.is_active == True)
    )
    product = result.scalar_one_or_none()
    if product is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Producto no encontrado o inactivo")
    return product


async def get_product_reviews(db: AsyncSession, producto_id: int, skip: int = 0, limit: int = 50) -> ReviewListResponse:
    await _get_active_product(db, producto_id)

    result = await db.execute(
        select(Review).where(Review.producto_id == producto_id).offset(skip).limit(limit)
    )
    reviews = list(result.scalars().all())

    stats_result = await db.execute(
        select(
            func.coalesce(func.avg(Review.puntuacion), 0).label("media"),
            func.coalesce(func.count(Review.id), 0).label("total"),
        ).where(Review.producto_id == producto_id)
    )
    stats = stats_result.one()

    media_puntuacion = Decimal(str(stats.media)).quantize(Decimal("0.1")) if stats.media else Decimal("0.0")
    total_valoraciones = stats.total or 0

    return ReviewListResponse(
        producto_id=producto_id,
        media_puntuacion=media_puntuacion,
        total_valoraciones=total_valoraciones,
        valoraciones=[ReviewResponse.model_validate(r) for r in reviews],
    )


async def create_review(db: AsyncSession, usuario_id: int, producto_id: int, data: ReviewCreate) -> ReviewResponse:
    await _get_active_product(db, producto_id)

    result = await db.execute(
        select(Review).where(Review.usuario_id == usuario_id, Review.producto_id == producto_id)
    )
    existing = result.scalar_one_or_none()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Ya has valorado este producto. Usa PUT para actualizar.",
        )

    review = Review(usuario_id=usuario_id, producto_id=producto_id, puntuacion=data.puntuacion)
    db.add(review)
    await db.commit()
    await db.refresh(review)
    return ReviewResponse.model_validate(review)


async def update_review(db: AsyncSession, usuario_id: int, producto_id: int, data: ReviewCreate) -> ReviewResponse:
    await _get_active_product(db, producto_id)

    result = await db.execute(
        select(Review).where(Review.usuario_id == usuario_id, Review.producto_id == producto_id)
    )
    review = result.scalar_one_or_none()

    if review:
        review.puntuacion = data.puntuacion
        await db.commit()
        await db.refresh(review)
        return ReviewResponse.model_validate(review)
    else:
        review = Review(usuario_id=usuario_id, producto_id=producto_id, puntuacion=data.puntuacion)
        db.add(review)
        await db.commit()
        await db.refresh(review)
        return ReviewResponse.model_validate(review)


async def delete_review(db: AsyncSession, usuario_id: int, producto_id: int) -> None:
    result = await db.execute(
        select(Review).where(Review.usuario_id == usuario_id, Review.producto_id == producto_id)
    )
    review = result.scalar_one_or_none()
    if review is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No tienes una valoración para este producto",
        )
    await db.delete(review)
    await db.commit()


async def get_product_rating_stats(db: AsyncSession, producto_id: int) -> tuple[Decimal, int]:
    result = await db.execute(
        select(
            func.coalesce(func.avg(Review.puntuacion), 0).label("media"),
            func.coalesce(func.count(Review.id), 0).label("total"),
        ).where(Review.producto_id == producto_id)
    )
    stats = result.one()
    media_puntuacion = Decimal(str(stats.media)).quantize(Decimal("0.1")) if stats.media else Decimal("0.0")
    total_valoraciones = stats.total or 0
    return media_puntuacion, total_valoraciones
