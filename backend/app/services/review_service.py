import uuid
from typing import Optional

from sqlalchemy import case, func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import joinedload

from app.models.order import Order, OrderItem, OrderStatus
from app.models.product import Product
from app.models.review import Review
from app.models.user import User, UserRole
from app.schemas.review import RatingDistribution, RatingResponse, ReviewCreate, ReviewUpdate


async def get_by_id(db: AsyncSession, review_id: str) -> Optional[Review]:
    try:
        rid = uuid.UUID(review_id)
    except ValueError:
        return None
    result = await db.execute(
        select(Review)
        .options(joinedload(Review.user), joinedload(Review.product))
        .where(Review.id == rid)
    )
    return result.unique().scalar_one_or_none()


async def get_user_review_for_product(
    db: AsyncSession, user_id: uuid.UUID, product_id: uuid.UUID
) -> Optional[Review]:
    result = await db.execute(
        select(Review).where(Review.user_id == user_id, Review.product_id == product_id)
    )
    return result.scalar_one_or_none()


async def has_purchased_product(
    db: AsyncSession, user_id: uuid.UUID, product_id: uuid.UUID
) -> bool:
    result = await db.execute(
        select(Order)
        .join(OrderItem, OrderItem.order_id == Order.id)
        .where(
            Order.user_id == user_id,
            Order.status == OrderStatus.delivered,
            OrderItem.product_id == product_id,
        )
        .limit(1)
    )
    return result.scalar_one_or_none() is not None


async def create(
    db: AsyncSession, user_id: uuid.UUID, product_id: str, data: ReviewCreate
) -> Review | str:
    try:
        pid = uuid.UUID(product_id)
    except ValueError:
        return "product_not_found"

    product = await db.execute(
        select(Product).where(Product.id == pid, Product.is_active.is_(True))
    )
    if not product.scalar_one_or_none():
        return "product_not_found"

    existing = await get_user_review_for_product(db, user_id, pid)
    if existing:
        return "already_reviewed"

    if not await has_purchased_product(db, user_id, pid):
        return "not_purchased"

    if data.order_id:
        order_result = await db.execute(
            select(Order).where(
                Order.id == data.order_id,
                Order.user_id == user_id,
            )
        )
        order = order_result.scalar_one_or_none()
        if not order:
            return "invalid_order"

    review = Review(
        user_id=user_id,
        product_id=pid,
        order_id=data.order_id,
        rating=data.rating,
        comment=data.comment,
    )
    db.add(review)
    await db.commit()
    result = await db.execute(
        select(Review)
        .options(joinedload(Review.user), joinedload(Review.product))
        .where(Review.id == review.id)
    )
    return result.unique().scalar_one()


async def list_by_product(
    db: AsyncSession, product_id: str, page: int = 1, size: int = 10
) -> tuple[list[Review], int, float, int] | str:
    try:
        pid = uuid.UUID(product_id)
    except ValueError:
        return "product_not_found"

    count_query = select(func.count()).select_from(Review).where(Review.product_id == pid)
    total = (await db.execute(count_query)).scalar_one()

    avg_query = select(func.coalesce(func.avg(Review.rating), 0.0)).where(
        Review.product_id == pid
    )
    average_rating = float((await db.execute(avg_query)).scalar())

    query = (
        select(Review)
        .options(joinedload(Review.user))
        .where(Review.product_id == pid)
        .order_by(Review.created_at.desc())
    )
    offset = (page - 1) * size
    result = await db.execute(query.offset(offset).limit(size))
    reviews = result.unique().scalars().all()

    return reviews, total, average_rating, total


async def get_rating_stats(
    db: AsyncSession, product_id: str
) -> RatingResponse | str:
    try:
        pid = uuid.UUID(product_id)
    except ValueError:
        return "product_not_found"

    stats_query = select(
        func.coalesce(func.avg(Review.rating), 0.0).label("avg"),
        func.count().label("count"),
    ).where(Review.product_id == pid)

    result = await db.execute(stats_query)
    row = result.one()
    average_rating = float(row.avg)
    rating_count = row.count

    distribution = RatingDistribution()
    for rating_value in range(1, 6):
        rating_count_query = select(func.count()).where(
            Review.product_id == pid, Review.rating == rating_value
        )
        count = (await db.execute(rating_count_query)).scalar()
        setattr(distribution, f"rating_{rating_value}", count)

    return RatingResponse(
        average_rating=average_rating,
        rating_count=rating_count,
        rating_distribution=distribution,
    )


async def update(
    db: AsyncSession, review_id: str, user_id: uuid.UUID, data: ReviewUpdate
) -> Review | str:
    review = await get_by_id(db, review_id)
    if not review:
        return "not_found"

    if review.user_id != user_id:
        return "forbidden"

    update_data = data.model_dump(exclude_none=True)
    for field, value in update_data.items():
        setattr(review, field, value)

    await db.commit()
    result = await db.execute(
        select(Review)
        .options(joinedload(Review.user), joinedload(Review.product))
        .where(Review.id == review.id)
    )
    return result.unique().scalar_one()


async def delete(
    db: AsyncSession, review_id: str, user_id: uuid.UUID, user_role: UserRole
) -> str:
    review = await get_by_id(db, review_id)
    if not review:
        return "not_found"

    if user_role != UserRole.admin and review.user_id != user_id:
        return "forbidden"

    await db.delete(review)
    await db.commit()
    return "deleted"


async def get_product_rating_fields(
    db: AsyncSession, product_id: uuid.UUID
) -> dict:
    avg_query = select(
        func.coalesce(func.avg(Review.rating), 0.0),
        func.count(),
    ).where(Review.product_id == product_id)
    result = await db.execute(avg_query)
    row = result.one()
    return {
        "average_rating": round(float(row[0]), 1),
        "rating_count": row[1],
    }
