import uuid
from decimal import Decimal

from sqlalchemy import delete, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.cart import Cart, CartItem
from app.models.product import Product


async def get_or_create_cart(db: AsyncSession, user_id: str) -> Cart:
    uid = uuid.UUID(user_id)
    result = await db.execute(select(Cart).where(Cart.user_id == uid))
    cart = result.scalar_one_or_none()
    if not cart:
        cart = Cart(user_id=uid)
        db.add(cart)
        await db.commit()
        await db.refresh(cart)
    return cart


async def get_cart(db: AsyncSession, user_id: str) -> dict:
    uid = uuid.UUID(user_id)
    result = await db.execute(
        select(Cart)
        .where(Cart.user_id == uid)
        .options(selectinload(Cart.items).selectinload(CartItem.product))
    )
    cart = result.scalar_one_or_none()

    if not cart or not cart.items:
        return {"id": None, "items": [], "total": "0.00", "item_count": 0}

    items_response = []
    total = Decimal("0.00")
    for item in cart.items:
        product = item.product
        subtotal = product.price * item.quantity
        total += subtotal
        items_response.append(
            {
                "id": item.id,
                "product": {
                    "id": product.id,
                    "name": product.name,
                    "price": product.price,
                    "stock": product.stock,
                    "image_url": product.image_url,
                },
                "quantity": item.quantity,
                "subtotal": f"{subtotal:.2f}",
            }
        )

    return {
        "id": cart.id,
        "items": items_response,
        "total": f"{total:.2f}",
        "item_count": len(items_response),
    }


async def add_item(
    db: AsyncSession, user_id: str, product_id: str, quantity: int
) -> dict:
    uid = uuid.UUID(user_id)
    pid = uuid.UUID(product_id)

    product_result = await db.execute(
        select(Product).where(Product.id == pid, Product.is_active.is_(True))
    )
    product = product_result.scalar_one_or_none()
    if not product:
        return None

    cart = await get_or_create_cart(db, user_id)

    existing_result = await db.execute(
        select(CartItem).where(
            CartItem.cart_id == cart.id, CartItem.product_id == pid
        )
    )
    existing_item = existing_result.scalar_one_or_none()

    if existing_item:
        new_total = existing_item.quantity + quantity
    else:
        new_total = quantity

    if new_total > product.stock:
        return "insufficient_stock"

    if existing_item:
        existing_item.quantity = new_total
    else:
        cart_item = CartItem(cart_id=cart.id, product_id=pid, quantity=quantity)
        db.add(cart_item)

    await db.commit()
    return await get_cart(db, user_id)


async def update_item(
    db: AsyncSession, user_id: str, item_id: str, quantity: int
) -> dict:
    uid = uuid.UUID(user_id)
    iid = uuid.UUID(item_id)

    item_result = await db.execute(
        select(CartItem)
        .where(CartItem.id == iid)
        .options(selectinload(CartItem.product))
    )
    item = item_result.scalar_one_or_none()
    if not item:
        return "not_found"

    cart_result = await db.execute(
        select(Cart).where(Cart.id == item.cart_id, Cart.user_id == uid)
    )
    if not cart_result.scalar_one_or_none():
        return "forbidden"

    if quantity > item.product.stock:
        return "insufficient_stock"

    item.quantity = quantity
    await db.commit()
    return await get_cart(db, user_id)


async def remove_item(db: AsyncSession, user_id: str, item_id: str) -> dict:
    uid = uuid.UUID(user_id)
    iid = uuid.UUID(item_id)

    item_result = await db.execute(
        select(CartItem)
        .where(CartItem.id == iid)
        .options(selectinload(CartItem.cart))
    )
    item = item_result.scalar_one_or_none()
    if not item:
        return "not_found"

    if item.cart is None or str(item.cart.user_id) != user_id:
        return "forbidden"

    await db.delete(item)
    await db.commit()
    return await get_cart(db, user_id)


async def clear_cart(db: AsyncSession, user_id: str) -> dict:
    uid = uuid.UUID(user_id)

    cart_result = await db.execute(
        select(Cart).where(Cart.user_id == uid)
    )
    cart = cart_result.scalar_one_or_none()
    if not cart:
        return {"id": None, "items": [], "total": "0.00", "item_count": 0}

    await db.execute(delete(CartItem).where(CartItem.cart_id == cart.id))
    await db.commit()
    return {"id": cart.id, "items": [], "total": "0.00", "item_count": 0}
