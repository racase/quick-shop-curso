from datetime import datetime

from pydantic import BaseModel, EmailStr

from app.models.user import RolEnum


class UserCreate(BaseModel):
    email: EmailStr
    password: str


class UserOut(BaseModel):
    id: int
    email: EmailStr
    rol: RolEnum
    is_active: bool
    created_at: datetime

    model_config = {"from_attributes": True}


class UserUpdate(BaseModel):
    is_active: bool
