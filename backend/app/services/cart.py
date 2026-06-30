from decimal import Decimal

from fastapi import HTTPException, status
from sqlalchemy import delete, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.cart import CartItem
from app.models.product import Product
from app.schemas.cart import CartItemAdd, CartItemUpdate, CartItemResponse, CartResponse


async def _get_active_product(db: AsyncSession, producto_id: int) -> Product:
    result = await db.execute(
        select(Product).where(Product.id == producto_id, Product.is_active == True)
    )
    product = result.scalar_one_or_none()
    if product is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Producto no encontrado o inactivo")
    return product


async def get_cart(db: AsyncSession, usuario_id: int) -> CartResponse:
    result = await db.execute(
        select(CartItem).where(CartItem.usuario_id == usuario_id)
    )
    items = result.scalars().all()

    item_responses: list[CartItemResponse] = []
    for item in items:
        product_result = await db.execute(select(Product).where(Product.id == item.producto_id))
        product = product_result.scalar_one_or_none()
        if product is None:
            continue
        subtotal = product.precio * item.cantidad
        item_responses.append(CartItemResponse(
            producto_id=item.producto_id,
            nombre=product.nombre,
            precio=product.precio,
            stock=product.stock,
            imagen_url=product.imagen_url,
            cantidad=item.cantidad,
            subtotal=subtotal,
        ))

    total = sum(i.subtotal for i in item_responses) if item_responses else Decimal("0.00")
    return CartResponse(items=item_responses, total=total)


async def add_item(db: AsyncSession, usuario_id: int, data: CartItemAdd) -> CartItem:
    product = await _get_active_product(db, data.producto_id)

    result = await db.execute(
        select(CartItem).where(
            CartItem.usuario_id == usuario_id,
            CartItem.producto_id == data.producto_id,
        )
    )
    existing = result.scalar_one_or_none()

    if existing:
        new_qty = existing.cantidad + data.cantidad
        if new_qty > product.stock:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="La cantidad solicitada excede el stock disponible",
            )
        existing.cantidad = new_qty
        await db.commit()
        await db.refresh(existing)
        return existing
    else:
        if data.cantidad > product.stock:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="La cantidad solicitada excede el stock disponible",
            )
        cart_item = CartItem(usuario_id=usuario_id, producto_id=data.producto_id, cantidad=data.cantidad)
        db.add(cart_item)
        await db.commit()
        await db.refresh(cart_item)
        return cart_item


async def update_item(db: AsyncSession, usuario_id: int, producto_id: int, data: CartItemUpdate) -> CartItem:
    result = await db.execute(
        select(CartItem).where(
            CartItem.usuario_id == usuario_id,
            CartItem.producto_id == producto_id,
        )
    )
    item = result.scalar_one_or_none()
    if item is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="El producto no está en el carrito")

    product_result = await db.execute(select(Product).where(Product.id == producto_id, Product.is_active == True))
    product = product_result.scalar_one_or_none()
    if product and data.cantidad > product.stock:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="La cantidad solicitada excede el stock disponible",
        )

    item.cantidad = data.cantidad
    await db.commit()
    await db.refresh(item)
    return item


async def remove_item(db: AsyncSession, usuario_id: int, producto_id: int) -> None:
    result = await db.execute(
        select(CartItem).where(
            CartItem.usuario_id == usuario_id,
            CartItem.producto_id == producto_id,
        )
    )
    item = result.scalar_one_or_none()
    if item is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="El producto no está en el carrito")
    await db.delete(item)
    await db.commit()


async def clear_cart(db: AsyncSession, usuario_id: int) -> None:
    await db.execute(delete(CartItem).where(CartItem.usuario_id == usuario_id))
    await db.commit()
