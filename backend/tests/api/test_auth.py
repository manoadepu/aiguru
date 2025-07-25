"""
Integration tests for authentication API endpoints.
"""
import pytest
from fastapi.testclient import TestClient

from app.core.config import settings
from app.main import app


def test_register_user(client: TestClient) -> None:
    """Test user registration endpoint."""
    # Create test data with unique email
    import uuid
    unique_id = str(uuid.uuid4())[:8]
    email = f"test-register-{unique_id}@example.com"
    password = "test-password123"
    name = "Test Register User"
    
    data = {
        "email": email,
        "password": password,
        "name": name,
        "is_active": True,
    }
    
    # Send registration request
    response = client.post(
        f"{settings.API_V1_PREFIX}/auth/register",
        json=data,
    )
    
    # Verify response
    assert response.status_code == 201
    content = response.json()
    assert content["email"] == email
    assert content["name"] == name
    assert "id" in content
    assert "password" not in content
    assert "hashed_password" not in content
    
    # Verify duplicate registration fails
    response2 = client.post(
        f"{settings.API_V1_PREFIX}/auth/register",
        json=data,
    )
    assert response2.status_code == 400
    assert "already exists" in response2.json()["detail"]


def test_login_user(client: TestClient) -> None:
    """Test user login endpoint."""
    # Create test user first
    email = "test-login@example.com"
    password = "test-password123"
    name = "Test Login User"
    
    # Register user
    register_data = {
        "email": email,
        "password": password,
        "name": name,
        "is_active": True,
    }
    client.post(f"{settings.API_V1_PREFIX}/auth/register", json=register_data)
    
    # Test login with correct credentials
    login_data = {
        "username": email,  # Note: OAuth2 form uses username field for email
        "password": password,
    }
    response = client.post(
        f"{settings.API_V1_PREFIX}/auth/login",
        data=login_data,  # Note: Using form data, not JSON
    )
    
    # Verify successful login
    assert response.status_code == 200
    content = response.json()
    assert "access_token" in content
    assert content["token_type"] == "bearer"
    # Note: In our implementation, user info is not included in token response
    # If we want to test user info, we'd need to make a separate /users/me call
    
    # Test login with incorrect password
    wrong_login_data = {
        "username": email,
        "password": "wrong-password",
    }
    response2 = client.post(
        f"{settings.API_V1_PREFIX}/auth/login",
        data=wrong_login_data,
    )
    
    # Verify failed login
    assert response2.status_code == 401
    assert "Incorrect email or password" in response2.json()["detail"]
    
    # Test login with non-existent user
    nonexistent_login = {
        "username": "nonexistent@example.com",
        "password": password,
    }
    response3 = client.post(
        f"{settings.API_V1_PREFIX}/auth/login",
        data=nonexistent_login,
    )
    
    # Verify failed login
    assert response3.status_code == 401
