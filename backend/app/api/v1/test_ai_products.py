import pytest
from unittest.mock import AsyncMock, patch
from fastapi.testclient import TestClient
from app.main import app
from app.core.security import create_access_token

client = TestClient(app)


@pytest.mark.asyncio
async def test_ai_generate_success_admin():
    """Test successful AI product generation for admin user"""
    admin_token = create_access_token(subject="admin-user-id", role="admin")
    
    with patch("app.api.v1.products.generate_product_fields") as mock_generate:
        mock_generate.return_value = {
            "name": "Test Product",
            "description": "A test product",
            "price": 29.99,
            "stock": 10,
            "image_url": "https://example.com/image.jpg"
        }
        
        response = client.post(
            "/products/ai-generate",
            json={"prompt": "A wireless headphone"},
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        
        assert response.status_code == 201
        assert response.json()["name"] == "Test Product"


@pytest.mark.asyncio
async def test_ai_generate_forbidden_client():
    """Test that client users cannot access AI generation endpoint"""
    client_token = create_access_token(subject="client-user-id", role="client")
    
    response = client.post(
        "/products/ai-generate",
        json={"prompt": "A wireless headphone"},
        headers={"Authorization": f"Bearer {client_token}"}
    )
    
    assert response.status_code == 403


@pytest.mark.asyncio
async def test_ai_generate_unauthorized():
    """Test that unauthenticated requests are rejected"""
    response = client.post(
        "/products/ai-generate",
        json={"prompt": "A wireless headphone"}
    )
    
    assert response.status_code == 403


@pytest.mark.asyncio
async def test_ai_generate_empty_prompt():
    """Test that empty prompts are rejected with 422"""
    admin_token = create_access_token(subject="admin-user-id", role="admin")
    
    response = client.post(
        "/products/ai-generate",
        json={"prompt": ""},
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    
    assert response.status_code == 422


@pytest.mark.asyncio
async def test_ai_generate_llm_failure():
    """Test that LLM failures return 502"""
    admin_token = create_access_token(subject="admin-user-id", role="admin")
    
    with patch("app.api.v1.products.generate_product_fields") as mock_generate:
        mock_generate.side_effect = ValueError("Invalid JSON from LLM")
        
        response = client.post(
            "/products/ai-generate",
            json={"prompt": "A wireless headphone"},
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        
        assert response.status_code == 502
