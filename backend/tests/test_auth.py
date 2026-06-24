import pytest


@pytest.mark.asyncio
async def test_register_success(client):
    resp = await client.post("/auth/register", json={
        "email": "user@test.com",
        "password": "Password1",
        "full_name": "Test User",
    })
    assert resp.status_code == 201
    data = resp.json()
    assert data["email"] == "user@test.com"
    assert data["role"] == "client"


@pytest.mark.asyncio
async def test_register_duplicate_email(client):
    payload = {"email": "dup@test.com", "password": "Password1", "full_name": "Dup User"}
    await client.post("/auth/register", json=payload)
    resp = await client.post("/auth/register", json=payload)
    assert resp.status_code == 409


@pytest.mark.asyncio
async def test_register_invalid_password(client):
    resp = await client.post("/auth/register", json={
        "email": "bad@test.com",
        "password": "short",
        "full_name": "Bad User",
    })
    assert resp.status_code == 422


@pytest.mark.asyncio
async def test_login_success(client):
    await client.post("/auth/register", json={
        "email": "login@test.com",
        "password": "Password1",
        "full_name": "Login User",
    })
    resp = await client.post("/auth/login", json={
        "email": "login@test.com",
        "password": "Password1",
    })
    assert resp.status_code == 200
    assert "access_token" in resp.json()


@pytest.mark.asyncio
async def test_login_wrong_password(client):
    await client.post("/auth/register", json={
        "email": "wrong@test.com",
        "password": "Password1",
        "full_name": "Wrong User",
    })
    resp = await client.post("/auth/login", json={
        "email": "wrong@test.com",
        "password": "BadPassword1",
    })
    assert resp.status_code == 401


@pytest.mark.asyncio
async def test_me_valid_token(client):
    await client.post("/auth/register", json={
        "email": "me@test.com",
        "password": "Password1",
        "full_name": "Me User",
    })
    login = await client.post("/auth/login", json={
        "email": "me@test.com",
        "password": "Password1",
    })
    token = login.json()["access_token"]
    resp = await client.get("/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert resp.status_code == 200
    assert resp.json()["email"] == "me@test.com"


@pytest.mark.asyncio
async def test_me_missing_token(client):
    resp = await client.get("/auth/me")
    assert resp.status_code in (401, 403)
