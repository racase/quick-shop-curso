import uuid
from datetime import datetime
from typing import Optional

from pydantic import BaseModel, field_validator


class ReviewCreate(BaseModel):
    rating: int
    comment: Optional[str] = None
    order_id: Optional[uuid.UUID] = None

    @field_validator("rating")
    @classmethod
    def rating_valid(cls, v: int) -> int:
        if v < 1 or v > 5:
            raise ValueError("rating must be between 1 and 5")
        return v

    @field_validator("comment")
    @classmethod
    def comment_max_length(cls, v: Optional[str]) -> Optional[str]:
        if v is not None and len(v) > 1000:
            raise ValueError("comment must not exceed 1000 characters")
        return v


class ReviewUpdate(BaseModel):
    rating: Optional[int] = None
    comment: Optional[str] = None

    @field_validator("rating")
    @classmethod
    def rating_valid(cls, v: Optional[int]) -> Optional[int]:
        if v is not None and (v < 1 or v > 5):
            raise ValueError("rating must be between 1 and 5")
        return v

    @field_validator("comment")
    @classmethod
    def comment_max_length(cls, v: Optional[str]) -> Optional[str]:
        if v is not None and len(v) > 1000:
            raise ValueError("comment must not exceed 1000 characters")
        return v


class ReviewUser(BaseModel):
    id: uuid.UUID
    full_name: str

    model_config = {"from_attributes": True}


class ReviewProduct(BaseModel):
    id: uuid.UUID
    name: str

    model_config = {"from_attributes": True}


class ReviewResponse(BaseModel):
    id: uuid.UUID
    user: ReviewUser
    product: ReviewProduct
    rating: int
    comment: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class ReviewListItem(BaseModel):
    id: uuid.UUID
    user: ReviewUser
    rating: int
    comment: Optional[str] = None
    created_at: datetime

    model_config = {"from_attributes": True}


class PaginatedReviews(BaseModel):
    items: list[ReviewListItem]
    total: int
    page: int
    size: int
    average_rating: float
    rating_count: int


class RatingDistribution(BaseModel):
    rating_1: int = 0
    rating_2: int = 0
    rating_3: int = 0
    rating_4: int = 0
    rating_5: int = 0


class RatingResponse(BaseModel):
    average_rating: float
    rating_count: int
    rating_distribution: RatingDistribution
