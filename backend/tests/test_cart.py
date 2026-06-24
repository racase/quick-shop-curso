import pytest


async def _create_product(db):
    from app.models.product import Product
    from decimal import Decimal

    product = Product(
        name="Test Product",
        description="A test product",
        price=Decimal("19.99"),
        stock=10,
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


async def _register_and_login_client(client):
    await client.post("/auth/register", json={
        "email": "client@test.com", "password": "Password1", "full_name": "Client",
    })
    resp = await client.post("/auth/login", json={
        "email": "client@test.com", "password": "Password1",
    })
    return resp.json()["access_token"]


async def _get_client_headers(client, db):
    token = await _register_and_login_client(client)
    return {"Authorization": f"Bearer {token}"}


async def _get_admin_headers(client, db):
    await _create_admin(db)
    token = await _login_admin(client)
    return {"Authorization": f"Bearer {token}"}


@pytest.mark.asyncio
async def test_get_empty_cart(client, db):
    product = await _create_product(db)
    headers = await _get_client_headers(client, db)
    resp = await client.get("/cart", headers=headers)
    assert resp.status_code == 200
    data = resp.json()
    assert data["items"] == []
    assert data["total"] == "0.00"
    assert data["item_count"] == 0


@pytest.mark.asyncio
async def test_add_item_to_cart(client, db):
    product = await _create_product(db)
    headers = await _get_client_headers(client, db)
    resp = await client.post("/cart/items", headers=headers, json={
        "product_id": str(product.id),
        "quantity": 2,
    })
    assert resp.status_code == 201
    data = resp.json()
    assert data["item_count"] == 1
    assert len(data["items"]) == 1
    assert data["items"][0]["quantity"] == 2
    assert data["items"][0]["product"]["name"] == "Test Product"


@pytest.mark.asyncio
async def test_add_existing_item_increments(client, db):
    product = await _create_product(db)
    headers = await _get_client_headers(client, db)
    await client.post("/cart/items", headers=headers, json={
        "product_id": str(product.id), "quantity": 2,
    })
    resp = await client.post("/cart/items", headers=headers, json={
        "product_id": str(product.id), "quantity": 1,
    })
    assert resp.status_code == 201
    data = resp.json()
    assert data["items"][0]["quantity"] == 3


@pytest.mark.asyncio
async def test_add_exceeding_stock(client, db):
    product = await _create_product(db)
    headers = await _get_client_headers(client, db)
    resp = await client.post("/cart/items", headers=headers, json={
        "product_id": str(product.id), "quantity": 99,
    })
    assert resp.status_code == 400
    assert resp.json()["detail"] == "Insufficient stock"


@pytest.mark.asyncio
async def test_add_inactive_product(client, db):
    product = await _create_product(db)
    product.is_active = False
    await db.commit()
    headers = await _get_client_headers(client, db)
    resp = await client.post("/cart/items", headers=headers, json={
        "product_id": str(product.id), "quantity": 1,
    })
    assert resp.status_code == 404


@pytest.mark.asyncio
async def test_update_item_quantity(client, db):
    product = await _create_product(db)
    headers = await _get_client_headers(client, db)
    add_resp = await client.post("/cart/items", headers=headers, json={
        "product_id": str(product.id), "quantity": 2,
    })
    item_id = add_resp.json()["items"][0]["id"]
    resp = await client.put(f"/cart/items/{item_id}", headers=headers, json={
        "quantity": 5,
    })
    assert resp.status_code == 200
    assert resp.json()["items"][0]["quantity"] == 5


@pytest.mark.asyncio
async def test_update_exceeding_stock(client, db):
    product = await _create_product(db)
    headers = await _get_client_headers(client, db)
    add_resp = await client.post("/cart/items", headers=headers, json={
        "product_id": str(product.id), "quantity": 2,
    })
    item_id = add_resp.json()["items"][0]["id"]
    resp = await client.put(f"/cart/items/{item_id}", headers=headers, json={
        "quantity": 99,
    })
    assert resp.status_code == 400


@pytest.mark.asyncio
async def test_remove_item(client, db):
    product = await _create_product(db)
    headers = await _get_client_headers(client, db)
    add_resp = await client.post("/cart/items", headers=headers, json={
        "product_id": str(product.id), "quantity": 2,
    })
    item_id = add_resp.json()["items"][0]["id"]
    resp = await client.delete(f"/cart/items/{item_id}", headers=headers)
    assert resp.status_code == 200
    assert resp.json()["item_count"] == 0


@pytest.mark.asyncio
async def test_clear_cart(client, db):
    product = await _create_product(db)
    headers = await _get_client_headers(client, db)
    await client.post("/cart/items", headers=headers, json={
        "product_id": str(product.id), "quantity": 2,
    })
    resp = await client.delete("/cart", headers=headers)
    assert resp.status_code == 200
    assert resp.json()["items"] == []
    assert resp.json()["total"] == "0.00"


@pytest.mark.asyncio
async def test_admin_forbidden_on_cart(client, db):
    headers = await _get_admin_headers(client, db)
    resp = await client.get("/cart", headers=headers)
    assert resp.status_code == 403


@pytest.mark.asyncio
async def test_unauthenticated_cart(client):
    resp = await client.get("/cart")
    assert resp.status_code in (401, 403)


@pytest.mark.asyncio
async def test_update_item_not_belonging_to_user(client, db):
    product = await _create_product(db)
    headers1 = await _get_client_headers(client, db)
    add_resp = await client.post("/cart/items", headers=headers1, json={
        "product_id": str(product.id), "quantity": 2,
    })
    item_id = add_resp.json()["items"][0]["id"]

    await client.post("/auth/register", json={
        "email": "other@test.com", "password": "Password1", "full_name": "Other",
    })
    login_resp = await client.post("/auth/login", json={
        "email": "other@test.com", "password": "Password1",
    })
    headers2 = {"Authorization": f"Bearer {login_resp.json()['access_token']}"}

    resp = await client.put(f"/cart/items/{item_id}", headers=headers2, json={
        "quantity": 3,
    })
    assert resp.status_code == 403
