import uuid
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.dependencies import get_current_user, get_db, require_admin, require_client
from app.models.user import UserRole
from app.schemas.order import OrderListResponse, OrderResponse, UpdateOrderStatusRequest
from app.services import order_service

router = APIRouter()


@router.post("/orders", response_model=OrderResponse, status_code=201)
async def create_order(
    current_user=Depends(require_client),
    db: AsyncSession = Depends(get_db),
):
    result = await order_service.create_order(db, str(current_user.id))
    if result == "empty_cart":
        raise HTTPException(status_code=400, detail="Cart is empty")
    if result == "insufficient_stock":
        raise HTTPException(status_code=400, detail="Insufficient stock")
    return result


@router.get("/orders", response_model=OrderListResponse)
async def list_orders(
    page: int = Query(default=1, ge=1),
    size: int = Query(default=20, ge=1, le=100),
    status: Optional[str] = Query(default=None),
    current_user=Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    orders, total = await order_service.list_orders(
        db, str(current_user.id), current_user.role.value, page=page, size=size, status=status
    )
    return OrderListResponse(items=orders, total=total, page=page, size=size)


@router.get("/orders/{order_id}", response_model=OrderResponse)
async def get_order(
    order_id: uuid.UUID,
    current_user=Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await order_service.get_order(
        db, str(order_id), str(current_user.id), current_user.role.value
    )
    if result is None:
        raise HTTPException(status_code=404, detail="Order not found")
    if result == "forbidden":
        raise HTTPException(status_code=403, detail="Access denied")
    return result


@router.patch("/orders/{order_id}/status", response_model=OrderResponse)
async def update_order_status(
    order_id: uuid.UUID,
    data: UpdateOrderStatusRequest,
    admin=Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    result = await order_service.update_status(db, str(order_id), data.status.value)
    if result == "not_found":
        raise HTTPException(status_code=404, detail="Order not found")
    if result == "invalid_transition":
        raise HTTPException(status_code=400, detail="Invalid status transition")
    return result


@router.delete("/orders/{order_id}", response_model=OrderResponse)
async def cancel_order(
    order_id: uuid.UUID,
    current_user=Depends(require_client),
    db: AsyncSession = Depends(get_db),
):
    result = await order_service.cancel_order(
        db, str(order_id), str(current_user.id)
    )
    if result == "not_found":
        raise HTTPException(status_code=404, detail="Order not found")
    if result == "forbidden":
        raise HTTPException(status_code=403, detail="Access denied")
    if result == "not_pending":
        raise HTTPException(status_code=400, detail="Only pending orders can be cancelled")
    return result
