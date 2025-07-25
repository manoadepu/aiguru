"""
Integration tests for user API endpoints.
"""
import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app import crud
from app.core.config import settings
from app.schemas.user import UserCreate


def create_test_user(client: TestClient) -> dict:
    """Helper function to create a test user through the API."""
    # Use a unique email to prevent conflicts
    import uuid
    unique_id = str(uuid.uuid4())[:8]
    email = f"test-user-api-{unique_id}@example.com"
    password = "test-password123"
    name = "Test User API"
    
    # Register the user through the API
    user_data = {
        "email": email,
        "password": password,
        "name": name,
        "is_active": True,
    }
    
    response = client.post(
        f"{settings.API_V1_PREFIX}/auth/register",
        json=user_data,
    )
    
    # Verify registration was successful
    assert response.status_code == 201
    user = response.json()
    
    return {
        "user": user,
        "email": email,
        "password": password,
        "name": name,
        "id": str(user["id"]),
    }


def get_auth_headers(client: TestClient, email: str, password: str) -> dict:
    """Helper function to get auth headers for a user."""
    login_data = {
        "username": email,
        "password": password,
    }
    response = client.post(
        f"{settings.API_V1_PREFIX}/auth/login",
        data=login_data,
    )
    
    # Verify the response was successful
    assert response.status_code == 200, f"Login failed: {response.text}"
    
    tokens = response.json()
    assert "access_token" in tokens, f"No access_token in response: {tokens}"
    
    return {"Authorization": f"Bearer {tokens['access_token']}"}


def test_get_user_me(client: TestClient, db: Session) -> None:
    """Test getting own user profile endpoint."""
    # Create test user through the API
    user_data = create_test_user(client)
    
    # Get auth headers
    headers = get_auth_headers(client, user_data["email"], user_data["password"])
    
    # Test getting own profile
    response = client.get(
        f"{settings.API_V1_PREFIX}/users/me",
        headers=headers,
    )
    
    # Verify response
    assert response.status_code == 200
    content = response.json()
    assert content["email"] == user_data["email"]
    assert content["name"] == user_data["name"]
    assert content["id"] == user_data["id"]
    assert "password" not in content
    assert "hashed_password" not in content
    
    # Test without auth headers (should fail)
    response2 = client.get(f"{settings.API_V1_PREFIX}/users/me")
    assert response2.status_code == 401


def test_update_user_me(client: TestClient, db: Session) -> None:
    """Test updating own user profile endpoint."""
    # Create test user through the API
    user_data = create_test_user(client)
    
    # Get auth headers
    headers = get_auth_headers(client, user_data["email"], user_data["password"])
    
    # Update user name only
    new_name = "Updated User Name"
    data = {"name": new_name}
    
    response = client.put(
        f"{settings.API_V1_PREFIX}/users/me",
        headers=headers,
        json=data,
    )
    
    # Verify response
    assert response.status_code == 200
    content = response.json()
    assert content["name"] == new_name
    
    # Update password only - we must include the original name as our API doesn't support true partial updates
    new_password = "new-password456"
    data = {
        "password": new_password,
        "name": new_name  # Include the name we set previously to avoid NULL constraint violation
    }
    
    response2 = client.put(
        f"{settings.API_V1_PREFIX}/users/me",
        headers=headers,
        json=data,
    )
    
    # Verify response
    assert response2.status_code == 200
    content2 = response2.json()
    assert content2["name"] == new_name  # Name should still be the updated name
    
    # Verify login with new password works
    new_headers = get_auth_headers(client, user_data["email"], new_password)
    response3 = client.get(
        f"{settings.API_V1_PREFIX}/users/me",
        headers=new_headers,
    )
    assert response3.status_code == 200


def test_get_user_by_id(client: TestClient, db: Session) -> None:
    """Test getting a user by ID endpoint."""
    # Create test user through the API
    user_data = create_test_user(client)
    
    # Get auth headers
    headers = get_auth_headers(client, user_data["email"], user_data["password"])
    
    # Test getting own profile by ID
    response = client.get(
        f"{settings.API_V1_PREFIX}/users/{user_data['id']}",
        headers=headers,
    )
    
    # Verify response
    assert response.status_code == 200
    content = response.json()
    assert content["email"] == user_data["email"]
    assert content["id"] == user_data["id"]
    
    # Test getting another user's profile (should fail for regular users)
    # Create another user through the API
    other_user = create_test_user(client)
    
    response2 = client.get(
        f"{settings.API_V1_PREFIX}/users/{other_user['id']}",
        headers=headers,
    )
    
    # Verify access denied
    assert response2.status_code == 403


def test_read_users_superuser_only(client: TestClient, db: Session) -> None:
    """Test getting all users endpoint (superuser only)."""
    # Create regular user through the API
    user_data = create_test_user(client)
    
    # Get auth headers
    headers = get_auth_headers(client, user_data["email"], user_data["password"])
    
    # Try to get all users (should fail for regular user)
    response = client.get(
        f"{settings.API_V1_PREFIX}/users/",
        headers=headers,
    )
    
    # Verify access denied
    assert response.status_code == 403
    
    # Note: We can't easily test the superuser path without
    # mocking the authentication or having a setup superuser
