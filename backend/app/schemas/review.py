from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel, Field


class ReviewCreate(BaseModel):
    puntuacion: int = Field(ge=1, le=5)


class ReviewResponse(BaseModel):
    id: int
    usuario_id: int
    producto_id: int
    puntuacion: int
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class ReviewListResponse(BaseModel):
    producto_id: int
    media_puntuacion: Decimal
    total_valoraciones: int
    valoraciones: list[ReviewResponse]
