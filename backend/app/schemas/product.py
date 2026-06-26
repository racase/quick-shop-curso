from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel, Field


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

    model_config = {"from_attributes": True}


class ProductOut(ProductListOut):
    created_at: datetime
    updated_at: datetime
