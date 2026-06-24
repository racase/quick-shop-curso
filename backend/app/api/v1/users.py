import uuid

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.dependencies import get_current_user, get_db, require_admin
from app.schemas.user import PaginatedUsers, UserResponse, UserUpdate
from app.services import user_service

router = APIRouter()


@router.get("/me", response_model=UserResponse)
async def get_me(current_user=Depends(get_current_user)):
    return current_user


@router.put("/me", response_model=UserResponse)
async def update_me(
    data: UserUpdate,
    current_user=Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    return await user_service.update_me(db, current_user, data)


@router.get("", response_model=PaginatedUsers)
async def list_users(
    page: int = Query(default=1, ge=1),
    size: int = Query(default=20, ge=1, le=100),
    admin=Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    users, total = await user_service.list_users(db, page=page, size=size)
    return PaginatedUsers(items=users, total=total, page=page, size=size)


@router.get("/{user_id}", response_model=UserResponse)
async def get_user(
    user_id: uuid.UUID,
    admin=Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    user = await user_service.get_by_id(db, str(user_id))
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user
