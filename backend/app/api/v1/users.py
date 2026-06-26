from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.dependencies import get_current_user, require_admin
from app.db.session import get_db
from app.schemas.user import UserOut, UserUpdate
from app.services.user import get_all_users, get_user_by_id, update_user_status

router = APIRouter(prefix="/users", tags=["users"])


@router.get("/me", response_model=UserOut)
async def read_me(current_user=Depends(get_current_user)):
    return current_user


@router.get("/", response_model=list[UserOut])
async def list_users(
    db: AsyncSession = Depends(get_db),
    _admin=Depends(require_admin),
):
    return await get_all_users(db)


@router.patch("/{user_id}", response_model=UserOut)
async def patch_user(
    user_id: int,
    payload: UserUpdate,
    db: AsyncSession = Depends(get_db),
    _admin=Depends(require_admin),
):
    user = await get_user_by_id(db, user_id)
    if user is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Usuario no encontrado")
    return await update_user_status(db, user, payload.is_active)
