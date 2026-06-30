from decimal import Decimal

from fastapi import HTTPException, status
from sqlalchemy import delete, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.cart import CartItem
from app.models.order import Order, OrderItem, OrderStatus
from app.models.product import Product
from app.models.user import RolEnum, User
from app.schemas.order import AdminOrderStatus, OrderItemResponse, OrderListResponse, OrderResponse, OrderStatusUpdate


# States from which cancellation restores stock
_STOCK_RESTORE_STATES = {OrderStatus.pendiente, OrderStatus.confirmado, OrderStatus.enviado}

# Valid admin transitions
_VALID_ADMIN_TRANSITIONS = {
    OrderStatus.pendiente: {OrderStatus.confirmado, OrderStatus.enviado, OrderStatus.cancelado},
    OrderStatus.confirmado: {OrderStatus.enviado, OrderStatus.cancelado},
    OrderStatus.enviado: {OrderStatus.cancelado},
    OrderStatus.cancelado: set(),
}


async def _build_order_response(db: AsyncSession, order: Order) -> OrderResponse:
    result = await db.execute(select(OrderItem).where(OrderItem.pedido_id == order.id))
    items = result.scalars().all()

    item_responses: list[OrderItemResponse] = []
    total = Decimal("0.00")
    for item in items:
        product_result = await db.execute(select(Product).where(Product.id == item.producto_id))
        product = product_result.scalar_one_or_none()
        nombre = product.nombre if product else f"Producto #{item.producto_id}"
        subtotal = item.precio_unitario * item.cantidad
        total += subtotal
        item_responses.append(OrderItemResponse(
            producto_id=item.producto_id,
            nombre=nombre,
            cantidad=item.cantidad,
            precio_unitario=item.precio_unitario,
            subtotal=subtotal,
        ))

    return OrderResponse(
        id=order.id,
        usuario_id=order.usuario_id,
        estado=order.estado,
        items=item_responses,
        total=total,
        created_at=order.created_at,
    )


async def _restore_stock(db: AsyncSession, order_id: int) -> None:
    result = await db.execute(select(OrderItem).where(OrderItem.pedido_id == order_id))
    items = result.scalars().all()
    for item in items:
        product_result = await db.execute(select(Product).where(Product.id == item.producto_id))
        product = product_result.scalar_one_or_none()
        if product:
            product.stock += item.cantidad


async def create_order(db: AsyncSession, usuario_id: int) -> OrderResponse:
    cart_result = await db.execute(select(CartItem).where(CartItem.usuario_id == usuario_id))
    cart_items = cart_result.scalars().all()

    if not cart_items:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="El carrito está vacío")

    order = Order(usuario_id=usuario_id, estado=OrderStatus.pendiente)
    db.add(order)
    await db.flush()  # get order.id without committing

    # Single pass with FOR UPDATE: validates stock and decrements atomically
    for cart_item in cart_items:
        product_result = await db.execute(
            select(Product).where(Product.id == cart_item.producto_id).with_for_update()
        )
        product = product_result.scalar_one_or_none()
        if product is None or product.stock < cart_item.cantidad:
            nombre = product.nombre if product else f"producto #{cart_item.producto_id}"
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Stock insuficiente para {nombre}",
            )
        product.stock -= cart_item.cantidad
        order_item = OrderItem(
            pedido_id=order.id,
            producto_id=cart_item.producto_id,
            cantidad=cart_item.cantidad,
            precio_unitario=product.precio,
        )
        db.add(order_item)

    await db.execute(delete(CartItem).where(CartItem.usuario_id == usuario_id))
    await db.commit()
    await db.refresh(order)

    return await _build_order_response(db, order)


async def list_orders(db: AsyncSession, current_user: User) -> list[OrderListResponse]:
    if current_user.rol == RolEnum.administrador:
        result = await db.execute(select(Order))
    else:
        result = await db.execute(select(Order).where(Order.usuario_id == current_user.id))

    orders = result.scalars().all()
    responses = []
    for order in orders:
        # Load the user to get their email
        user_result = await db.execute(select(User).where(User.id == order.usuario_id))
        order_user = user_result.scalar_one_or_none()
        email = order_user.email if order_user else f"usuario_{order.usuario_id}"

        items_result = await db.execute(select(OrderItem).where(OrderItem.pedido_id == order.id))
        items = items_result.scalars().all()
        total = sum(i.precio_unitario * i.cantidad for i in items) if items else Decimal("0.00")
        responses.append(OrderListResponse(
            id=order.id,
            usuario_id=order.usuario_id,
            email=email,
            estado=order.estado,
            total=total,
            created_at=order.created_at,
        ))
    return responses


async def get_order_detail(db: AsyncSession, order_id: int, current_user: User) -> OrderResponse:
    result = await db.execute(select(Order).where(Order.id == order_id))
    order = result.scalar_one_or_none()
    if order is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Pedido no encontrado")

    if current_user.rol != RolEnum.administrador and order.usuario_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="No tienes acceso a este pedido")

    return await _build_order_response(db, order)


async def update_status(db: AsyncSession, order_id: int, data: OrderStatusUpdate) -> OrderResponse:
    result = await db.execute(select(Order).where(Order.id == order_id))
    order = result.scalar_one_or_none()
    if order is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Pedido no encontrado")

    allowed = _VALID_ADMIN_TRANSITIONS.get(order.estado, set())
    if data.estado not in allowed:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Transición de estado no permitida: {order.estado} → {data.estado}",
        )

    if data.estado == AdminOrderStatus.cancelado and order.estado in _STOCK_RESTORE_STATES:
        await _restore_stock(db, order_id)

    order.estado = data.estado
    await db.commit()
    await db.refresh(order)
    return await _build_order_response(db, order)


async def cancel_order(db: AsyncSession, order_id: int, current_user: User) -> OrderResponse:
    result = await db.execute(select(Order).where(Order.id == order_id))
    order = result.scalar_one_or_none()
    if order is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Pedido no encontrado")

    if order.usuario_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="No tienes acceso a este pedido")

    if order.estado != OrderStatus.pendiente:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Solo se pueden cancelar pedidos en estado pendiente",
        )

    await _restore_stock(db, order_id)
    order.estado = OrderStatus.cancelado
    await db.commit()
    await db.refresh(order)
    return await _build_order_response(db, order)
