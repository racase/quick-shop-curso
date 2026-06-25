import pytest
from unittest.mock import AsyncMock, patch

AI_FIELDS = {
    "name": "Auriculares Gaming",
    "description": "Auriculares inalámbricos con cancelación de ruido activa.",
    "price": 79.99,
    "stock": 25,
    "image_url": "https://picsum.photos/seed/auriculares-gaming/400/300",
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
    resp = await client.post("/auth/login", json={"email": "admin@test.com", "password": "Admin1234!"})
    return resp.json()["access_token"]


async def _register_and_login_client(client):
    await client.post("/auth/register", json={"email": "client@test.com", "password": "Password1", "full_name": "Client"})
    resp = await client.post("/auth/login", json={"email": "client@test.com", "password": "Password1"})
    return resp.json()["access_token"]


@pytest.mark.asyncio
async def test_ai_generate_success(client, db):
    await _create_admin(db)
    token = await _login_admin(client)

    with patch(
        "app.api.v1.products.generate_product_fields",
        new_callable=AsyncMock,
        return_value=AI_FIELDS,
    ):
        resp = await client.post(
            "/products/ai-generate",
            json={"prompt": "Auriculares gaming inalámbricos con cancelación de ruido"},
            headers={"Authorization": f"Bearer {token}"},
        )

    assert resp.status_code == 200
    body = resp.json()
    assert body["name"] == "Auriculares Gaming"
    assert body["stock"] == 25
    assert body["price"] == "79.99"


@pytest.mark.asyncio
async def test_ai_generate_client_forbidden(client, db):
    await _create_admin(db)
    token = await _register_and_login_client(client)

    resp = await client.post(
        "/products/ai-generate",
        json={"prompt": "Auriculares gaming"},
        headers={"Authorization": f"Bearer {token}"},
    )

    assert resp.status_code == 403


@pytest.mark.asyncio
async def test_ai_generate_unauthenticated(client):
    resp = await client.post(
        "/products/ai-generate",
        json={"prompt": "Auriculares gaming"},
    )

    assert resp.status_code == 401


@pytest.mark.asyncio
async def test_ai_generate_empty_prompt(client, db):
    await _create_admin(db)
    token = await _login_admin(client)

    resp = await client.post(
        "/products/ai-generate",
        json={"prompt": ""},
        headers={"Authorization": f"Bearer {token}"},
    )

    assert resp.status_code == 422


@pytest.mark.asyncio
async def test_ai_generate_llm_failure(client, db):
    await _create_admin(db)
    token = await _login_admin(client)

    with patch(
        "app.api.v1.products.generate_product_fields",
        new_callable=AsyncMock,
        side_effect=ValueError("LLM returned invalid JSON"),
    ):
        resp = await client.post(
            "/products/ai-generate",
            json={"prompt": "Auriculares gaming"},
            headers={"Authorization": f"Bearer {token}"},
        )

    assert resp.status_code == 502
    assert "invalid JSON" in resp.json()["detail"]