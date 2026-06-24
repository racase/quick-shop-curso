import uuid
from decimal import Decimal
from typing import Optional

from pydantic import BaseModel, field_serializer, field_validator


class AddItemRequest(BaseModel):
    product_id: uuid.UUID
    quantity: int

    @field_validator("quantity")
    @classmethod
    def quantity_positive(cls, v: int) -> int:
        if v < 1:
            raise ValueError("quantity must be >= 1")
        return v


class UpdateItemRequest(BaseModel):
    quantity: int

    @field_validator("quantity")
    @classmethod
    def quantity_positive(cls, v: int) -> int:
        if v < 1:
            raise ValueError("quantity must be >= 1")
        return v


class CartProductResponse(BaseModel):
    id: uuid.UUID
    name: str
    price: Decimal
    stock: int
    image_url: str

    model_config = {"from_attributes": True}

    @field_serializer("price")
    def serialize_price(self, v: Decimal) -> str:
        return f"{v:.2f}"


class CartItemResponse(BaseModel):
    id: uuid.UUID
    product: CartProductResponse
    quantity: int
    subtotal: str

    model_config = {"from_attributes": True}


class CartResponse(BaseModel):
    id: Optional[uuid.UUID] = None
    items: list[CartItemResponse] = []
    total: str = "0.00"
    item_count: int = 0
