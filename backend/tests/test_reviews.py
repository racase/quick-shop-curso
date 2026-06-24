import pytest
from app.models.order import Order, OrderItem, OrderStatus
from app.models.product import Product
from app.models.review import Review
from app.models.user import User, UserRole
from app.core.security import hash_password
from decimal import Decimal


async def _create_client(db):
    client_user = User(
        email="review_client@test.com",
        hashed_password=hash_password("Password1"),
        full_name="Review Client",
        role=UserRole.client,
    )
    db.add(client_user)
    await db.commit()
    await db.refresh(client_user)
    return client_user


async def _create_admin(db):
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


async def _create_product(db):
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


async def _create_delivered_order(db, user_id, product_id):
    order = Order(
        user_id=user_id,
        status=OrderStatus.delivered,
        total=Decimal("19.99"),
    )
    db.add(order)
    await db.flush()
    item = OrderItem(
        order_id=order.id,
        product_id=product_id,
        quantity=1,
        unit_price=Decimal("19.99"),
    )
    db.add(item)
    await db.commit()
    await db.refresh(order)
    return order


async def _login_client(client):
    resp = await client.post("/auth/login", json={
        "email": "review_client@test.com", "password": "Password1",
    })
    return resp.json()["access_token"]


async def _login_admin(client):
    resp = await client.post("/auth/login", json={
        "email": "admin@test.com", "password": "Admin1234!",
    })
    return resp.json()["access_token"]


@pytest.mark.asyncio
async def test_create_review_success(client, db):
    user = await _create_client(db)
    product = await _create_product(db)
    await _create_delivered_order(db, user.id, product.id)
    token = await _login_client(client)

    resp = await client.post(
        f"/products/{product.id}/reviews",
        json={"rating": 5, "comment": "Great product!"},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert resp.status_code == 201
    data = resp.json()
    assert data["rating"] == 5
    assert data["comment"] == "Great product!"


@pytest.mark.asyncio
async def test_create_review_without_purchase_fails(client, db):
    user = await _create_client(db)
    product = await _create_product(db)
    token = await _login_client(client)

    resp = await client.post(
        f"/products/{product.id}/reviews",
        json={"rating": 5, "comment": "Great product!"},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert resp.status_code == 400
    assert "purchase" in resp.json()["detail"].lower()


@pytest.mark.asyncio
async def test_create_review_duplicate_fails(client, db):
    user = await _create_client(db)
    product = await _create_product(db)
    await _create_delivered_order(db, user.id, product.id)
    token = await _login_client(client)

    await client.post(
        f"/products/{product.id}/reviews",
        json={"rating": 5, "comment": "First review"},
        headers={"Authorization": f"Bearer {token}"},
    )
    resp = await client.post(
        f"/products/{product.id}/reviews",
        json={"rating": 4, "comment": "Second review"},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert resp.status_code == 400
    assert "already reviewed" in resp.json()["detail"].lower()


@pytest.mark.asyncio
async def test_create_review_invalid_rating_fails(client, db):
    user = await _create_client(db)
    product = await _create_product(db)
    await _create_delivered_order(db, user.id, product.id)
    token = await _login_client(client)

    resp = await client.post(
        f"/products/{product.id}/reviews",
        json={"rating": 6, "comment": "Invalid rating"},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert resp.status_code == 422


@pytest.mark.asyncio
async def test_list_product_reviews(client, db):
    product = await _create_product(db)
    resp = await client.get(f"/products/{product.id}/reviews")
    assert resp.status_code == 200
    data = resp.json()
    assert "items" in data
    assert "average_rating" in data
    assert "rating_count" in data


@pytest.mark.asyncio
async def test_get_review_detail(client, db):
    user = await _create_client(db)
    product = await _create_product(db)
    await _create_delivered_order(db, user.id, product.id)
    token = await _login_client(client)

    create_resp = await client.post(
        f"/products/{product.id}/reviews",
        json={"rating": 5, "comment": "Great product!"},
        headers={"Authorization": f"Bearer {token}"},
    )
    review_id = create_resp.json()["id"]

    resp = await client.get(f"/reviews/{review_id}")
    assert resp.status_code == 200
    assert resp.json()["rating"] == 5


@pytest.mark.asyncio
async def test_update_own_review(client, db):
    user = await _create_client(db)
    product = await _create_product(db)
    await _create_delivered_order(db, user.id, product.id)
    token = await _login_client(client)

    create_resp = await client.post(
        f"/products/{product.id}/reviews",
        json={"rating": 5, "comment": "Great product!"},
        headers={"Authorization": f"Bearer {token}"},
    )
    review_id = create_resp.json()["id"]

    resp = await client.put(
        f"/reviews/{review_id}",
        json={"rating": 4, "comment": "Updated review"},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert resp.status_code == 200
    assert resp.json()["rating"] == 4
    assert resp.json()["comment"] == "Updated review"


@pytest.mark.asyncio
async def test_delete_own_review(client, db):
    user = await _create_client(db)
    product = await _create_product(db)
    await _create_delivered_order(db, user.id, product.id)
    token = await _login_client(client)

    create_resp = await client.post(
        f"/products/{product.id}/reviews",
        json={"rating": 5, "comment": "Great product!"},
        headers={"Authorization": f"Bearer {token}"},
    )
    review_id = create_resp.json()["id"]

    resp = await client.delete(
        f"/reviews/{review_id}",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert resp.status_code == 204


@pytest.mark.asyncio
async def test_admin_delete_any_review(client, db):
    user = await _create_client(db)
    admin = await _create_admin(db)
    product = await _create_product(db)
    await _create_delivered_order(db, user.id, product.id)
    client_token = await _login_client(client)
    admin_token = await _login_admin(client)

    create_resp = await client.post(
        f"/products/{product.id}/reviews",
        json={"rating": 5, "comment": "Great product!"},
        headers={"Authorization": f"Bearer {client_token}"},
    )
    review_id = create_resp.json()["id"]

    resp = await client.delete(
        f"/reviews/{review_id}",
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    assert resp.status_code == 204


@pytest.mark.asyncio
async def test_get_product_rating(client, db):
    product = await _create_product(db)
    resp = await client.get(f"/products/{product.id}/rating")
    assert resp.status_code == 200
    data = resp.json()
    assert "average_rating" in data
    assert "rating_count" in data
    assert "rating_distribution" in data
