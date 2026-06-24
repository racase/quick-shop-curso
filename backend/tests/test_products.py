import pytest

PRODUCT_DATA = {
    "name": "Test Product",
    "description": "A test product",
    "price": "19.99",
    "stock": 10,
    "image_url": "https://picsum.photos/seed/test/400/300",
}


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


@pytest.mark.asyncio
async def test_list_products_public(client):
    resp = await client.get("/products")
    assert resp.status_code == 200
    assert "items" in resp.json()


@pytest.mark.asyncio
async def test_list_products_search(client, db):
    await _create_admin(db)
    token = await _login_admin(client)
    await client.post("/products", json=PRODUCT_DATA, headers={"Authorization": f"Bearer {token}"})
    resp = await client.get("/products?search=Test")
    assert resp.status_code == 200
    assert len(resp.json()["items"]) >= 1


@pytest.mark.asyncio
async def test_get_product_active(client, db):
    await _create_admin(db)
    token = await _login_admin(client)
    created = await client.post(
        "/products", json=PRODUCT_DATA, headers={"Authorization": f"Bearer {token}"}
    )
    pid = created.json()["id"]
    resp = await client.get(f"/products/{pid}")
    assert resp.status_code == 200


@pytest.mark.asyncio
async def test_get_product_inactive_returns_404(client, db):
    await _create_admin(db)
    token = await _login_admin(client)
    created = await client.post(
        "/products", json=PRODUCT_DATA, headers={"Authorization": f"Bearer {token}"}
    )
    pid = created.json()["id"]
    await client.delete(f"/products/{pid}", headers={"Authorization": f"Bearer {token}"})
    resp = await client.get(f"/products/{pid}")
    assert resp.status_code == 404


@pytest.mark.asyncio
async def test_create_product_as_admin(client, db):
    await _create_admin(db)
    token = await _login_admin(client)
    resp = await client.post(
        "/products", json=PRODUCT_DATA, headers={"Authorization": f"Bearer {token}"}
    )
    assert resp.status_code == 201
    assert resp.json()["name"] == "Test Product"


@pytest.mark.asyncio
async def test_create_product_as_client_forbidden(client):
    token = await _register_and_login_client(client)
    resp = await client.post(
        "/products", json=PRODUCT_DATA, headers={"Authorization": f"Bearer {token}"}
    )
    assert resp.status_code == 403


@pytest.mark.asyncio
async def test_update_product(client, db):
    await _create_admin(db)
    token = await _login_admin(client)
    created = await client.post(
        "/products", json=PRODUCT_DATA, headers={"Authorization": f"Bearer {token}"}
    )
    pid = created.json()["id"]
    resp = await client.put(
        f"/products/{pid}",
        json={"name": "Updated Product"},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert resp.status_code == 200
    assert resp.json()["name"] == "Updated Product"


@pytest.mark.asyncio
async def test_delete_product_soft_delete(client, db):
    await _create_admin(db)
    token = await _login_admin(client)
    created = await client.post(
        "/products", json=PRODUCT_DATA, headers={"Authorization": f"Bearer {token}"}
    )
    pid = created.json()["id"]
    resp = await client.delete(f"/products/{pid}", headers={"Authorization": f"Bearer {token}"})
    assert resp.status_code == 204
    public = await client.get(f"/products/{pid}")
    assert public.status_code == 404


@pytest.mark.asyncio
async def test_admin_list_all_products(client, db):
    await _create_admin(db)
    token = await _login_admin(client)
    await client.post("/products", json=PRODUCT_DATA, headers={"Authorization": f"Bearer {token}"})
    resp = await client.get("/admin/products", headers={"Authorization": f"Bearer {token}"})
    assert resp.status_code == 200
    assert resp.json()["total"] >= 1
