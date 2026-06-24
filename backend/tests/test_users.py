import pytest


async def _register_and_login(client, email, password="Password1", full_name="Test User"):
    await client.post("/auth/register", json={
        "email": email, "password": password, "full_name": full_name,
    })
    resp = await client.post("/auth/login", json={"email": email, "password": password})
    return resp.json()["access_token"]


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


@pytest.mark.asyncio
async def test_get_me(client):
    token = await _register_and_login(client, "getme@test.com")
    resp = await client.get("/users/me", headers={"Authorization": f"Bearer {token}"})
    assert resp.status_code == 200
    assert resp.json()["email"] == "getme@test.com"


@pytest.mark.asyncio
async def test_update_me_name(client):
    token = await _register_and_login(client, "updateme@test.com")
    resp = await client.put(
        "/users/me",
        json={"full_name": "New Name"},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert resp.status_code == 200
    assert resp.json()["full_name"] == "New Name"


@pytest.mark.asyncio
async def test_update_me_password(client):
    token = await _register_and_login(client, "updatepw@test.com")
    resp = await client.put(
        "/users/me",
        json={"password": "NewPass1!"},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert resp.status_code == 200
    login = await client.post("/auth/login", json={
        "email": "updatepw@test.com", "password": "NewPass1!",
    })
    assert login.status_code == 200


@pytest.mark.asyncio
async def test_list_users_as_admin(client, db):
    await _create_admin(db)
    token = await _login_admin(client)
    resp = await client.get("/users", headers={"Authorization": f"Bearer {token}"})
    assert resp.status_code == 200
    assert "items" in resp.json()


@pytest.mark.asyncio
async def test_list_users_as_client_forbidden(client):
    token = await _register_and_login(client, "client@test.com")
    resp = await client.get("/users", headers={"Authorization": f"Bearer {token}"})
    assert resp.status_code == 403


@pytest.mark.asyncio
async def test_get_user_by_id_admin(client, db):
    await _create_admin(db)
    token = await _login_admin(client)
    resp = await client.get("/users", headers={"Authorization": f"Bearer {token}"})
    user_id = resp.json()["items"][0]["id"]
    resp2 = await client.get(f"/users/{user_id}", headers={"Authorization": f"Bearer {token}"})
    assert resp2.status_code == 200


@pytest.mark.asyncio
async def test_get_user_by_id_not_found(client, db):
    await _create_admin(db)
    token = await _login_admin(client)
    resp = await client.get(
        "/users/00000000-0000-0000-0000-000000000000",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert resp.status_code == 404
