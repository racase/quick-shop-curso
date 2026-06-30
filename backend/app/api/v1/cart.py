from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.dependencies import get_current_user
from app.db.session import get_db
from app.models.product import Product
from app.models.user import RolEnum, User
from app.schemas.cart import CartItemAdd, CartItemResponse, CartItemUpdate, CartResponse
from app.services import cart as cart_service

router = APIRouter(prefix="/cart", tags=["cart"])


def _require_client(current_user: User = Depends(get_current_user)) -> User:
    if current_user.rol != RolEnum.cliente:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Solo los clientes tienen carrito")
    return current_user


@router.get("/", response_model=CartResponse)
async def get_cart(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(_require_client),
):
    return await cart_service.get_cart(db, current_user.id)


@router.post("/items", response_model=CartItemResponse, status_code=status.HTTP_201_CREATED)
async def add_item(
    payload: CartItemAdd,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(_require_client),
):
    item = await cart_service.add_item(db, current_user.id, payload)
    product_result = await db.execute(select(Product).where(Product.id == item.producto_id))
    product = product_result.scalar_one()
    return CartItemResponse(
        producto_id=item.producto_id,
        nombre=product.nombre,
        precio=product.precio,
        stock=product.stock,
        imagen_url=product.imagen_url,
        cantidad=item.cantidad,
        subtotal=product.precio * item.cantidad,
    )


@router.put("/items/{producto_id}", response_model=CartItemResponse)
async def update_item(
    producto_id: int,
    payload: CartItemUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(_require_client),
):
    item = await cart_service.update_item(db, current_user.id, producto_id, payload)
    product_result = await db.execute(select(Product).where(Product.id == item.producto_id))
    product = product_result.scalar_one()
    return CartItemResponse(
        producto_id=item.producto_id,
        nombre=product.nombre,
        precio=product.precio,
        stock=product.stock,
        imagen_url=product.imagen_url,
        cantidad=item.cantidad,
        subtotal=product.precio * item.cantidad,
    )


@router.delete("/items/{producto_id}")
async def remove_item(
    producto_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(_require_client),
):
    await cart_service.remove_item(db, current_user.id, producto_id)
    return {"detail": "Item eliminado del carrito"}


@router.delete("/")
async def clear_cart(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(_require_client),
):
    await cart_service.clear_cart(db, current_user.id)
    return {"detail": "Carrito vaciado"}
