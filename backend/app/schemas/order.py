import uuid
from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel, field_serializer, field_validator

from app.models.order import OrderStatus


class UpdateOrderStatusRequest(BaseModel):
    status: OrderStatus


class OrderItemResponse(BaseModel):
    product_id: uuid.UUID
    product_name: str
    quantity: int
    unit_price: Decimal
    subtotal: str

    model_config = {"from_attributes": True}

    @field_serializer("unit_price")
    def serialize_unit_price(self, v: Decimal) -> str:
        return f"{v:.2f}"


class OrderResponse(BaseModel):
    id: uuid.UUID
    status: OrderStatus
    total: str
    items: list[OrderItemResponse]
    created_at: datetime
    client_email: str | None = None

    model_config = {"from_attributes": True}


class OrderListResponse(BaseModel):
    items: list[OrderResponse]
    total: int
    page: int
    size: int
