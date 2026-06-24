import pytest
from decimal import Decimal


async def _create_product(db, name="Test Product", stock=10):
    from app.models.product import Product

    product = Product(
        name=name,
        description=f"A {name.lower()}",
        price=Decimal("19.99"),
        stock=stock,
        image_url="https://picsum.photos/seed/test/400/300",
    )
    db.add(product)
    await db.commit()
    await db.refresh(product)
    return product


async def _create_admin(db):
    from app.core.security import hash_password
    from app.models.user import User, UserRole

    admin = User(
        email="admin@test.com",
        hashed_password=hash_password("Admin1234!"),
        full_name="Admin",
        role=UserRole.admin,
    )
    db.add(admin)
    await db.commit()
    await db.refresh(admin)
    return admin


async def _login_admin(client):
    resp = await client.post("/auth/login", json={
        "email": "admin@test.com", "password": "Admin1234!",
    })
    return resp.json()["access_token"]


async def _register_and_login_client(client, email="client@test.com"):
    await client.post("/auth/register", json={
        "email": email, "password": "Password1", "full_name": "Client",
    })
    resp = await client.post("/auth/login", json={
        "email": email, "password": "Password1",
    })
    return resp.json()["access_token"]


async def _get_client_headers(client, db):
    token = await _register_and_login_client(client)
    return {"Authorization": f"Bearer {token}"}


async def _get_admin_headers(client, db):
    await _create_admin(db)
    token = await _login_admin(client)
    return {"Authorization": f"Bearer {token}"}


async def _add_to_cart(client, product_id, quantity, headers):
    await client.post("/cart/items", headers=headers, json={
        "product_id": product_id, "quantity": quantity,
    })


@pytest.mark.asyncio
async def test_create_order_success(client, db):
    product = await _create_product(db, stock=10)
    headers = await _get_client_headers(client, db)
    await _add_to_cart(client, str(product.id), 3, headers)

    resp = await client.post("/orders", headers=headers)
    assert resp.status_code == 201
    data = resp.json()
    assert data["status"] == "pending"
    assert len(data["items"]) == 1
    assert data["items"][0]["quantity"] == 3
    assert data["items"][0]["unit_price"] == "19.99"

    from sqlalchemy import select
    from app.models.product import Product
    await db.refresh(product)
    result = await db.execute(select(Product).where(Product.id == product.id))
    updated_product = result.scalar_one()
    assert updated_product.stock == 7


@pytest.mark.asyncio
async def test_create_order_clears_cart(client, db):
    product = await _create_product(db, stock=10)
    headers = await _get_client_headers(client, db)
    await _add_to_cart(client, str(product.id), 3, headers)

    await client.post("/orders", headers=headers)
    cart_resp = await client.get("/cart", headers=headers)
    assert cart_resp.json()["item_count"] == 0


@pytest.mark.asyncio
async def test_create_order_empty_cart(client, db):
    await _create_product(db)
    headers = await _get_client_headers(client, db)
    resp = await client.post("/orders", headers=headers)
    assert resp.status_code == 400
    assert resp.json()["detail"] == "Cart is empty"


@pytest.mark.asyncio
async def test_create_order_insufficient_stock(client, db):
    product = await _create_product(db, stock=2)
    headers = await _get_client_headers(client, db)
    await _add_to_cart(client, str(product.id), 5, headers)

    resp = await client.post("/orders", headers=headers)
    assert resp.status_code == 400


@pytest.mark.asyncio
async def test_admin_cannot_create_order(client, db):
    product = await _create_product(db)
    admin_headers = await _get_admin_headers(client, db)
    resp = await client.post("/orders", headers=admin_headers)
    assert resp.status_code == 403


@pytest.mark.asyncio
async def test_client_lists_own_orders(client, db):
    product = await _create_product(db, stock=10)
    headers = await _get_client_headers(client, db)
    await _add_to_cart(client, str(product.id), 2, headers)
    await client.post("/orders", headers=headers)

    resp = await client.get("/orders", headers=headers)
    assert resp.status_code == 200
    data = resp.json()
    assert data["total"] == 1
    assert len(data["items"]) == 1


@pytest.mark.asyncio
async def test_admin_lists_all_orders(client, db):
    product = await _create_product(db, stock=10)
    headers = await _get_client_headers(client, db)
    await _add_to_cart(client, str(product.id), 2, headers)
    await client.post("/orders", headers=headers)

    admin_headers = await _get_admin_headers(client, db)
    resp = await client.get("/orders", headers=admin_headers)
    assert resp.status_code == 200
    data = resp.json()
    assert data["total"] >= 1


@pytest.mark.asyncio
async def test_filter_orders_by_status(client, db):
    product = await _create_product(db, stock=10)
    headers = await _get_client_headers(client, db)
    await _add_to_cart(client, str(product.id), 2, headers)
    await client.post("/orders", headers=headers)

    resp = await client.get("/orders?status=pending", headers=headers)
    assert resp.status_code == 200
    assert resp.json()["total"] == 1

    resp = await client.get("/orders?status=shipped", headers=headers)
    assert resp.status_code == 200
    assert resp.json()["total"] == 0


@pytest.mark.asyncio
async def test_get_order_detail(client, db):
    product = await _create_product(db, stock=10)
    headers = await _get_client_headers(client, db)
    await _add_to_cart(client, str(product.id), 2, headers)
    create_resp = await client.post("/orders", headers=headers)
    order_id = create_resp.json()["id"]

    resp = await client.get(f"/orders/{order_id}", headers=headers)
    assert resp.status_code == 200
    assert resp.json()["id"] == order_id


@pytest.mark.asyncio
async def test_client_cannot_see_other_order(client, db):
    product = await _create_product(db, stock=10)
    headers1 = await _get_client_headers(client, db)
    await _add_to_cart(client, str(product.id), 2, headers1)
    create_resp = await client.post("/orders", headers=headers1)
    order_id = create_resp.json()["id"]

    token2 = await _register_and_login_client(client, "other@test.com")
    headers2 = {"Authorization": f"Bearer {token2}"}
    resp = await client.get(f"/orders/{order_id}", headers=headers2)
    assert resp.status_code == 403


@pytest.mark.asyncio
async def test_admin_can_see_any_order(client, db):
    product = await _create_product(db, stock=10)
    headers = await _get_client_headers(client, db)
    await _add_to_cart(client, str(product.id), 2, headers)
    create_resp = await client.post("/orders", headers=headers)
    order_id = create_resp.json()["id"]

    admin_headers = await _get_admin_headers(client, db)
    resp = await client.get(f"/orders/{order_id}", headers=admin_headers)
    assert resp.status_code == 200


@pytest.mark.asyncio
async def test_admin_confirms_order(client, db):
    product = await _create_product(db, stock=10)
    headers = await _get_client_headers(client, db)
    await _add_to_cart(client, str(product.id), 2, headers)
    create_resp = await client.post("/orders", headers=headers)
    order_id = create_resp.json()["id"]

    admin_headers = await _get_admin_headers(client, db)
    resp = await client.patch(
        f"/orders/{order_id}/status",
        headers=admin_headers,
        json={"status": "confirmed"},
    )
    assert resp.status_code == 200
    assert resp.json()["status"] == "confirmed"


@pytest.mark.asyncio
async def test_invalid_transition_rejected(client, db):
    product = await _create_product(db, stock=10)
    headers = await _get_client_headers(client, db)
    await _add_to_cart(client, str(product.id), 2, headers)
    create_resp = await client.post("/orders", headers=headers)
    order_id = create_resp.json()["id"]

    admin_headers = await _get_admin_headers(client, db)
    resp = await client.patch(
        f"/orders/{order_id}/status",
        headers=admin_headers,
        json={"status": "delivered"},
    )
    assert resp.status_code == 400


@pytest.mark.asyncio
async def test_admin_cancel_restores_stock(client, db):
    product = await _create_product(db, stock=10)
    headers = await _get_client_headers(client, db)
    await _add_to_cart(client, str(product.id), 3, headers)
    create_resp = await client.post("/orders", headers=headers)
    order_id = create_resp.json()["id"]

    admin_headers = await _get_admin_headers(client, db)
    resp = await client.patch(
        f"/orders/{order_id}/status",
        headers=admin_headers,
        json={"status": "cancelled"},
    )
    assert resp.status_code == 200
    assert resp.json()["status"] == "cancelled"

    from sqlalchemy import select
    from app.models.product import Product
    await db.refresh(product)
    result = await db.execute(select(Product).where(Product.id == product.id))
    updated = result.scalar_one()
    assert updated.stock == 10


@pytest.mark.asyncio
async def test_client_cancel_own_pending_order(client, db):
    product = await _create_product(db, stock=10)
    headers = await _get_client_headers(client, db)
    await _add_to_cart(client, str(product.id), 3, headers)
    create_resp = await client.post("/orders", headers=headers)
    order_id = create_resp.json()["id"]

    resp = await client.delete(f"/orders/{order_id}", headers=headers)
    assert resp.status_code == 200
    assert resp.json()["status"] == "cancelled"

    from sqlalchemy import select
    from app.models.product import Product
    await db.refresh(product)
    result = await db.execute(select(Product).where(Product.id == product.id))
    updated = result.scalar_one()
    assert updated.stock == 10


@pytest.mark.asyncio
async def test_client_cannot_cancel_non_pending(client, db):
    product = await _create_product(db, stock=10)
    headers = await _get_client_headers(client, db)
    await _add_to_cart(client, str(product.id), 2, headers)
    create_resp = await client.post("/orders", headers=headers)
    order_id = create_resp.json()["id"]

    admin_headers = await _get_admin_headers(client, db)
    await client.patch(
        f"/orders/{order_id}/status",
        headers=admin_headers,
        json={"status": "confirmed"},
    )

    resp = await client.delete(f"/orders/{order_id}", headers=headers)
    assert resp.status_code == 400
    assert resp.json()["detail"] == "Only pending orders can be cancelled"


@pytest.mark.asyncio
async def test_delivered_cannot_be_modified(client, db):
    product = await _create_product(db, stock=10)
    headers = await _get_client_headers(client, db)
    await _add_to_cart(client, str(product.id), 2, headers)
    create_resp = await client.post("/orders", headers=headers)
    order_id = create_resp.json()["id"]

    admin_headers = await _get_admin_headers(client, db)
    await client.patch(f"/orders/{order_id}/status", headers=admin_headers, json={"status": "confirmed"})
    await client.patch(f"/orders/{order_id}/status", headers=admin_headers, json={"status": "shipped"})
    await client.patch(f"/orders/{order_id}/status", headers=admin_headers, json={"status": "delivered"})

    resp = await client.patch(f"/orders/{order_id}/status", headers=admin_headers, json={"status": "cancelled"})
    assert resp.status_code == 400


@pytest.mark.asyncio
async def test_order_not_found(client, db):
    headers = await _get_client_headers(client, db)
    resp = await client.get("/orders/00000000-0000-0000-0000-000000000000", headers=headers)
    assert resp.status_code == 404
