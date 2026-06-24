import uuid

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.dependencies import get_db, require_client
from app.schemas.cart import AddItemRequest, CartResponse, UpdateItemRequest
from app.services import cart_service

router = APIRouter()


@router.get("/cart", response_model=CartResponse)
async def get_cart(
    current_user=Depends(require_client),
    db: AsyncSession = Depends(get_db),
):
    return await cart_service.get_cart(db, str(current_user.id))


@router.post("/cart/items", response_model=CartResponse, status_code=201)
async def add_item(
    data: AddItemRequest,
    current_user=Depends(require_client),
    db: AsyncSession = Depends(get_db),
):
    result = await cart_service.add_item(
        db, str(current_user.id), str(data.product_id), data.quantity
    )
    if result is None:
        raise HTTPException(status_code=404, detail="Product not found")
    if result == "insufficient_stock":
        raise HTTPException(status_code=400, detail="Insufficient stock")
    return result


@router.put("/cart/items/{item_id}", response_model=CartResponse)
async def update_item(
    item_id: uuid.UUID,
    data: UpdateItemRequest,
    current_user=Depends(require_client),
    db: AsyncSession = Depends(get_db),
):
    result = await cart_service.update_item(
        db, str(current_user.id), str(item_id), data.quantity
    )
    if result == "not_found":
        raise HTTPException(status_code=404, detail="Item not found")
    if result == "forbidden":
        raise HTTPException(status_code=403, detail="Access denied")
    if result == "insufficient_stock":
        raise HTTPException(status_code=400, detail="Insufficient stock")
    return result


@router.delete("/cart/items/{item_id}", response_model=CartResponse)
async def remove_item(
    item_id: uuid.UUID,
    current_user=Depends(require_client),
    db: AsyncSession = Depends(get_db),
):
    result = await cart_service.remove_item(
        db, str(current_user.id), str(item_id)
    )
    if result == "not_found":
        raise HTTPException(status_code=404, detail="Item not found")
    if result == "forbidden":
        raise HTTPException(status_code=403, detail="Access denied")
    return result


@router.delete("/cart", response_model=CartResponse)
async def clear_cart(
    current_user=Depends(require_client),
    db: AsyncSession = Depends(get_db),
):
    return await cart_service.clear_cart(db, str(current_user.id))
