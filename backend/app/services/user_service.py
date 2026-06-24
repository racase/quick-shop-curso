import uuid
from typing import Optional

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import hash_password
from app.models.user import User
from app.schemas.user import UserUpdate


async def get_by_id(db: AsyncSession, user_id: str) -> Optional[User]:
    try:
        uid = uuid.UUID(user_id)
    except ValueError:
        return None
    result = await db.execute(select(User).where(User.id == uid))
    return result.scalar_one_or_none()


async def get_by_email(db: AsyncSession, email: str) -> Optional[User]:
    result = await db.execute(select(User).where(User.email == email))
    return result.scalar_one_or_none()


async def update_me(db: AsyncSession, user: User, data: UserUpdate) -> User:
    if data.full_name is not None:
        user.full_name = data.full_name
    if data.password is not None:
        user.hashed_password = hash_password(data.password)
    await db.commit()
    await db.refresh(user)
    return user


async def list_users(
    db: AsyncSession, page: int = 1, size: int = 20
) -> tuple[list[User], int]:
    offset = (page - 1) * size
    count_result = await db.execute(select(func.count()).select_from(User))
    total = count_result.scalar_one()
    result = await db.execute(select(User).offset(offset).limit(size))
    return result.scalars().all(), total
