"""add reviews table

Revision ID: 0003
Revises: 0002
Create Date: 2026-06-24

"""
from typing import Sequence, Union

from alembic import op

revision: str = "0003"
down_revision: Union[str, None] = "0002"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.execute("""
        CREATE TABLE IF NOT EXISTS reviews (
            id UUID PRIMARY KEY,
            user_id UUID NOT NULL REFERENCES users(id),
            product_id UUID NOT NULL REFERENCES products(id),
            order_id UUID REFERENCES orders(id),
            rating INTEGER NOT NULL,
            comment TEXT,
            created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
            updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
            CONSTRAINT ck_reviews_rating_range CHECK (rating >= 1 AND rating <= 5),
            CONSTRAINT uq_reviews_user_product UNIQUE (user_id, product_id)
        )
    """)


def downgrade() -> None:
    op.execute("DROP TABLE IF EXISTS reviews")
