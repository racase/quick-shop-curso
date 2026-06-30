from decimal import Decimal

from pydantic import BaseModel, Field


class CartItemAdd(BaseModel):
    producto_id: int
    cantidad: int = Field(gt=0)


class CartItemUpdate(BaseModel):
    cantidad: int = Field(gt=0)


class CartItemResponse(BaseModel):
    producto_id: int
    nombre: str
    precio: Decimal
    stock: int
    imagen_url: str | None
    cantidad: int
    subtotal: Decimal

    model_config = {"from_attributes": True}


class CartResponse(BaseModel):
    items: list[CartItemResponse]
    total: Decimal
