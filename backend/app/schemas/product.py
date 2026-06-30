from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel, Field, field_validator


class ProductCreate(BaseModel):
    nombre: str
    descripcion: str | None = None
    precio: Decimal = Field(gt=0)
    stock: int = Field(ge=0, default=0)
    imagen_url: str | None = None


class ProductUpdate(BaseModel):
    nombre: str | None = None
    descripcion: str | None = None
    precio: Decimal | None = Field(default=None, gt=0)
    stock: int | None = Field(default=None, ge=0)
    imagen_url: str | None = None
    is_active: bool | None = None


class ProductListOut(BaseModel):
    id: int
    nombre: str
    descripcion: str | None
    precio: Decimal
    stock: int
    imagen_url: str | None
    is_active: bool
    media_puntuacion: Decimal = Decimal("0.0")
    total_valoraciones: int = 0

    model_config = {"from_attributes": True}


class ProductOut(ProductListOut):
    created_at: datetime
    updated_at: datetime


class AIGenerateRequest(BaseModel):
    prompt: str = Field(min_length=1)


class AIGenerateResponse(BaseModel):
    nombre: str
    descripcion: str | None = None
    precio: float
    stock: int
    imagen_url: str | None = None

    @field_validator("precio")
    @classmethod
    def precio_must_be_positive(cls, v: float) -> float:
        if v <= 0:
            raise ValueError("precio debe ser mayor que 0")
        return round(v, 2)

    @field_validator("stock")
    @classmethod
    def stock_must_be_non_negative(cls, v: int) -> int:
        if v < 0:
            raise ValueError("stock debe ser mayor o igual a 0")
        return v
