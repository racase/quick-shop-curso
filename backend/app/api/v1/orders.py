from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.dependencies import get_current_user, require_admin
from app.db.session import get_db
from app.models.user import RolEnum, User
from app.schemas.order import OrderListResponse, OrderResponse, OrderStatusUpdate
from app.services import order as order_service

router = APIRouter(prefix="/orders", tags=["orders"])


def _require_client(current_user: User = Depends(get_current_user)) -> User:
    if current_user.rol != RolEnum.cliente:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Solo los clientes pueden realizar esta acción")
    return current_user


@router.post("/", response_model=OrderResponse, status_code=status.HTTP_201_CREATED)
async def create_order(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(_require_client),
):
    return await order_service.create_order(db, current_user.id)


@router.get("/", response_model=list[OrderListResponse])
async def list_orders(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return await order_service.list_orders(db, current_user)


@router.get("/{order_id}", response_model=OrderResponse)
async def get_order(
    order_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return await order_service.get_order_detail(db, order_id, current_user)


@router.patch("/{order_id}/status", response_model=OrderResponse)
async def update_order_status(
    order_id: int,
    payload: OrderStatusUpdate,
    db: AsyncSession = Depends(get_db),
    _admin: User = Depends(require_admin),
):
    return await order_service.update_status(db, order_id, payload)


@router.patch("/{order_id}/cancel", response_model=OrderResponse)
async def cancel_order(
    order_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(_require_client),
):
    return await order_service.cancel_order(db, order_id, current_user)
