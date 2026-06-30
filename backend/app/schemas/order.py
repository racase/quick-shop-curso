import enum
from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel

from app.models.order import OrderStatus


class OrderItemResponse(BaseModel):
    producto_id: int
    nombre: str
    cantidad: int
    precio_unitario: Decimal
    subtotal: Decimal

    model_config = {"from_attributes": True}


class OrderListResponse(BaseModel):
    id: int
    usuario_id: int
    email: str
    estado: OrderStatus
    total: Decimal
    created_at: datetime

    model_config = {"from_attributes": True}


class OrderResponse(BaseModel):
    id: int
    usuario_id: int
    estado: OrderStatus
    items: list[OrderItemResponse]
    total: Decimal
    created_at: datetime

    model_config = {"from_attributes": True}


class AdminOrderStatus(str, enum.Enum):
    confirmado = "confirmado"
    enviado = "enviado"
    cancelado = "cancelado"


class OrderStatusUpdate(BaseModel):
    estado: AdminOrderStatus
