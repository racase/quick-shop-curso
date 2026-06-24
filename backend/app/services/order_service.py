import uuid
from decimal import Decimal

from sqlalchemy import delete, func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.cart import Cart, CartItem
from app.models.order import Order, OrderItem, OrderStatus
from app.models.product import Product
from app.models.user import User, UserRole

VALID_TRANSITIONS: dict[OrderStatus, set[OrderStatus]] = {
    OrderStatus.pending: {OrderStatus.confirmed, OrderStatus.cancelled},
    OrderStatus.confirmed: {OrderStatus.shipped, OrderStatus.cancelled},
    OrderStatus.shipped: {OrderStatus.delivered, OrderStatus.cancelled},
    OrderStatus.delivered: set(),
    OrderStatus.cancelled: set(),
}


async def _get_cart_with_items(db: AsyncSession, user_id: str):
    uid = uuid.UUID(user_id)
    result = await db.execute(
        select(Cart)
        .where(Cart.user_id == uid)
        .options(selectinload(Cart.items).selectinload(CartItem.product))
    )
    return result.scalar_one_or_none()


async def create_order(db: AsyncSession, user_id: str) -> dict:
    cart = await _get_cart_with_items(db, user_id)
    if not cart or not cart.items:
        return "empty_cart"

    total = Decimal("0.00")
    order_items_data = []

    for item in cart.items:
        product = item.product
        if item.quantity > product.stock:
            return "insufficient_stock"

        subtotal = product.price * item.quantity
        total += subtotal
        order_items_data.append(
            {
                "product": product,
                "quantity": item.quantity,
                "unit_price": product.price,
                "subtotal": subtotal,
            }
        )

    uid = uuid.UUID(user_id)
    order = Order(user_id=uid, total=total, status=OrderStatus.pending)
    db.add(order)
    await db.flush()

    for oi_data in order_items_data:
        product = oi_data["product"]
        product.stock -= oi_data["quantity"]

        order_item = OrderItem(
            order_id=order.id,
            product_id=product.id,
            quantity=oi_data["quantity"],
            unit_price=oi_data["unit_price"],
        )
        db.add(order_item)

    await db.execute(
        delete(CartItem).where(CartItem.cart_id == cart.id)
    )

    await db.commit()
    await db.refresh(order)

    result = await db.execute(
        select(Order)
        .where(Order.id == order.id)
        .options(selectinload(Order.items).selectinload(OrderItem.product))
    )
    order = result.scalar_one()

    return _format_order_response(order)


async def list_orders(
    db: AsyncSession,
    user_id: str,
    role: str,
    page: int = 1,
    size: int = 20,
    status: str | None = None,
) -> tuple[list[dict], int]:
    uid = uuid.UUID(user_id)

    query = select(Order).options(
        selectinload(Order.items).selectinload(OrderItem.product),
        selectinload(Order.user),
    )
    count_query = select(func.count()).select_from(Order)

    if role != UserRole.admin.value:
        query = query.where(Order.user_id == uid)
        count_query = count_query.where(Order.user_id == uid)

    if status:
        query = query.where(Order.status == status)
        count_query = count_query.where(Order.status == status)

    total = (await db.execute(count_query)).scalar_one()

    offset = (page - 1) * size
    result = await db.execute(query.order_by(Order.created_at.desc()).offset(offset).limit(size))
    orders = result.scalars().all()

    return [_format_order_response(o) for o in orders], total


async def get_order(
    db: AsyncSession, order_id: str, user_id: str, role: str
) -> dict | None:
    oid = uuid.UUID(order_id)
    uid = uuid.UUID(user_id)

    result = await db.execute(
        select(Order)
        .where(Order.id == oid)
        .options(
            selectinload(Order.items).selectinload(OrderItem.product),
            selectinload(Order.user),
        )
    )
    order = result.scalar_one_or_none()
    if not order:
        return None

    if role != UserRole.admin.value and str(order.user_id) != user_id:
        return "forbidden"

    return _format_order_response(order)


async def update_status(db: AsyncSession, order_id: str, new_status: str) -> dict | str:
    oid = uuid.UUID(order_id)
    ns = OrderStatus(new_status)

    result = await db.execute(
        select(Order)
        .where(Order.id == oid)
        .options(
            selectinload(Order.items).selectinload(OrderItem.product),
            selectinload(Order.user),
        )
    )
    order = result.scalar_one_or_none()
    if not order:
        return "not_found"

    allowed = VALID_TRANSITIONS.get(order.status, set())
    if ns not in allowed:
        return "invalid_transition"

    if ns == OrderStatus.cancelled:
        for item in order.items:
            product = item.product
            product.stock += item.quantity

    order.status = ns
    await db.commit()
    await db.refresh(order)

    return _format_order_response(order)


async def cancel_order(db: AsyncSession, order_id: str, user_id: str) -> dict | str:
    oid = uuid.UUID(order_id)
    uid = uuid.UUID(user_id)

    result = await db.execute(
        select(Order)
        .where(Order.id == oid)
        .options(
            selectinload(Order.items).selectinload(OrderItem.product),
            selectinload(Order.user),
        )
    )
    order = result.scalar_one_or_none()
    if not order:
        return "not_found"

    if str(order.user_id) != user_id:
        return "forbidden"

    if order.status != OrderStatus.pending:
        return "not_pending"

    for item in order.items:
        product = item.product
        product.stock += item.quantity

    order.status = OrderStatus.cancelled
    await db.commit()
    await db.refresh(order)

    return _format_order_response(order)


def _format_order_response(order: Order) -> dict:
    items_response = []
    for item in order.items:
        product = item.product
        subtotal = item.unit_price * item.quantity
        items_response.append(
            {
                "product_id": product.id,
                "product_name": product.name,
                "quantity": item.quantity,
                "unit_price": item.unit_price,
                "subtotal": f"{subtotal:.2f}",
            }
        )

    return {
        "id": order.id,
        "status": order.status,
        "total": f"{order.total:.2f}",
        "items": items_response,
        "created_at": order.created_at,
        "client_email": order.user.email if order.user else None,
    }
