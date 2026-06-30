from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.dependencies import get_current_user
from app.db.session import get_db
from app.models.user import RolEnum, User
from app.schemas.review import ReviewCreate, ReviewListResponse, ReviewResponse
from app.services import review as review_service

router = APIRouter(prefix="/products/{producto_id}/reviews", tags=["reviews"])


def _require_client(current_user: User = Depends(get_current_user)) -> User:
    if current_user.rol != RolEnum.cliente:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Solo los clientes pueden valorar productos")
    return current_user


@router.get("/", response_model=ReviewListResponse)
async def get_reviews(
    producto_id: int,
    skip: int = 0,
    limit: int = 50,
    db: AsyncSession = Depends(get_db),
):
    return await review_service.get_product_reviews(db, producto_id, skip=skip, limit=limit)


@router.post("/", response_model=ReviewResponse, status_code=status.HTTP_201_CREATED)
async def create_review(
    producto_id: int,
    payload: ReviewCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(_require_client),
):
    return await review_service.create_review(db, current_user.id, producto_id, payload)


@router.put("/", response_model=ReviewResponse, status_code=status.HTTP_200_OK)
async def update_review(
    producto_id: int,
    payload: ReviewCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(_require_client),
):
    return await review_service.update_review(db, current_user.id, producto_id, payload)


@router.delete("/")
async def delete_review(
    producto_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(_require_client),
):
    await review_service.delete_review(db, current_user.id, producto_id)
    return {"detail": "Valoracion eliminada correctamente"}
