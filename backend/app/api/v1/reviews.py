import uuid

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.dependencies import get_current_user, get_db, require_client
from app.models.user import User
from app.schemas.review import (
    PaginatedReviews,
    RatingResponse,
    ReviewCreate,
    ReviewResponse,
    ReviewUpdate,
)
from app.services import review_service

router = APIRouter()


@router.get("/products/{product_id}/reviews", response_model=PaginatedReviews)
async def list_product_reviews(
    product_id: uuid.UUID,
    page: int = Query(default=1, ge=1),
    size: int = Query(default=10, ge=1, le=50),
    db: AsyncSession = Depends(get_db),
):
    result = await review_service.list_by_product(db, str(product_id), page=page, size=size)
    if isinstance(result, str):
        raise HTTPException(status_code=404, detail="Product not found")
    reviews, total, average_rating, rating_count = result
    return PaginatedReviews(
        items=reviews,
        total=total,
        page=page,
        size=size,
        average_rating=round(average_rating, 1),
        rating_count=rating_count,
    )


@router.post("/products/{product_id}/reviews", response_model=ReviewResponse, status_code=201)
async def create_review(
    product_id: uuid.UUID,
    data: ReviewCreate,
    current_user: User = Depends(require_client),
    db: AsyncSession = Depends(get_db),
):
    result = await review_service.create(db, current_user.id, str(product_id), data)
    if isinstance(result, str):
        error_map = {
            "product_not_found": (404, "Product not found"),
            "already_reviewed": (400, "You have already reviewed this product"),
            "not_purchased": (400, "You must purchase this product before reviewing"),
            "invalid_order": (400, "Invalid order for this product"),
        }
        status, detail = error_map.get(result, (400, result))
        raise HTTPException(status_code=status, detail=detail)
    return result


@router.get("/reviews/{review_id}", response_model=ReviewResponse)
async def get_review(review_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    review = await review_service.get_by_id(db, str(review_id))
    if not review:
        raise HTTPException(status_code=404, detail="Review not found")
    return review


@router.put("/reviews/{review_id}", response_model=ReviewResponse)
async def update_review(
    review_id: uuid.UUID,
    data: ReviewUpdate,
    current_user: User = Depends(require_client),
    db: AsyncSession = Depends(get_db),
):
    result = await review_service.update(db, str(review_id), current_user.id, data)
    if isinstance(result, str):
        error_map = {
            "not_found": (404, "Review not found"),
            "forbidden": (403, "You can only edit your own reviews"),
        }
        status, detail = error_map.get(result, (400, result))
        raise HTTPException(status_code=status, detail=detail)
    return result


@router.delete("/reviews/{review_id}", status_code=204)
async def delete_review(
    review_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await review_service.delete(db, str(review_id), current_user.id, current_user.role)
    if result == "deleted":
        return
    if isinstance(result, str):
        error_map = {
            "not_found": (404, "Review not found"),
            "forbidden": (403, "You can only delete your own reviews"),
        }
        status, detail = error_map.get(result, (400, result))
        raise HTTPException(status_code=status, detail=detail)


@router.get("/products/{product_id}/rating", response_model=RatingResponse)
async def get_product_rating(product_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    result = await review_service.get_rating_stats(db, str(product_id))
    if isinstance(result, str):
        raise HTTPException(status_code=404, detail="Product not found")
    return result
