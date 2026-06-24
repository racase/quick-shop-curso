import uuid
from decimal import Decimal
from typing import Optional

from pydantic import BaseModel, field_serializer, field_validator


class ProductCreate(BaseModel):
    name: str
    description: str
    price: Decimal
    stock: int
    image_url: str

    @field_validator("price")
    @classmethod
    def price_positive(cls, v: Decimal) -> Decimal:
        if v <= 0:
            raise ValueError("price must be greater than 0")
        return v

    @field_validator("stock")
    @classmethod
    def stock_non_negative(cls, v: int) -> int:
        if v < 0:
            raise ValueError("stock must be >= 0")
        return v


class ProductUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    price: Optional[Decimal] = None
    stock: Optional[int] = None
    image_url: Optional[str] = None

    @field_validator("price")
    @classmethod
    def price_positive(cls, v: Optional[Decimal]) -> Optional[Decimal]:
        if v is not None and v <= 0:
            raise ValueError("price must be greater than 0")
        return v

    @field_validator("stock")
    @classmethod
    def stock_non_negative(cls, v: Optional[int]) -> Optional[int]:
        if v is not None and v < 0:
            raise ValueError("stock must be >= 0")
        return v


class ProductResponse(BaseModel):
    id: uuid.UUID
    name: str
    description: str
    price: Decimal
    stock: int
    image_url: str
    is_active: bool
    average_rating: float = 0.0
    rating_count: int = 0

    model_config = {"from_attributes": True}

    @field_serializer("price")
    def serialize_price(self, v: Decimal) -> str:
        return f"{v:.2f}"


class PaginatedProducts(BaseModel):
    items: list[ProductResponse]
    total: int
    page: int
    size: int
