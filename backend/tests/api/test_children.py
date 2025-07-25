"""
Integration tests for child profile API endpoints.
"""
import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session
from uuid import uuid4

from app import crud
from app.core.config import settings
from app.schemas.user import UserCreate
from app.schemas.child import ChildCreate


def create_test_user(client: TestClient) -> dict:
    """Helper function to create a test user through the API."""
    # Always use a unique email with UUID to prevent conflicts
    email = f"parent-{uuid4()}@example.com"
    password = "test-password123"
    name = "Test Parent API"
    
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


def test_create_child(client: TestClient, db: Session) -> None:
    """Test creating a child profile."""
    # Create parent user through the API
    user_data = create_test_user(client)
    headers = get_auth_headers(client, user_data["email"], user_data["password"])
    
    # Create child profile
    child_data = {
        "name": "Test Child API",
        "grade": "3rd grade",
        "subjects": ["Math", "Science"],
        "learning_style": "Visual",
        "preferences": {
            "response_style": "concise",
            "examples_type": "real-world"
        }
    }
    
    response = client.post(
        f"{settings.API_V1_PREFIX}/children/",
        headers=headers,
        json=child_data,
    )
    
    # Verify response
    assert response.status_code == 201
    content = response.json()
    assert content["name"] == child_data["name"]
    assert content["grade"] == child_data["grade"]
    assert content["subjects"] == child_data["subjects"]
    assert content["learning_style"] == child_data["learning_style"]
    assert content["preferences"] == child_data["preferences"]
    assert content["parent_id"] == user_data["id"]
    assert "id" in content
    
    # Test validation - empty subjects list
    invalid_data = {
        "name": "Invalid Child",
        "grade": "4th grade",
        "subjects": [],
    }
    
    response2 = client.post(
        f"{settings.API_V1_PREFIX}/children/",
        headers=headers,
        json=invalid_data,
    )
    
    # Verify validation error
    assert response2.status_code == 422
    details = response2.json()["detail"]
    # FastAPI validation errors have a specific format with loc, msg and type fields
    validation_messages = [error["msg"] for error in details if "msg" in error]
    assert "At least one subject must be specified" in validation_messages


def test_read_children(client: TestClient, db: Session) -> None:
    """Test getting all children for a parent."""
    # Create parent user through the API
    user_data = create_test_user(client)
    headers = get_auth_headers(client, user_data["email"], user_data["password"])
    
    # Create multiple children
    for i in range(3):
        child_data = {
            "name": f"Child {i}",
            "grade": f"{i+1}st grade",
            "subjects": ["Math", "English"],
        }
        response = client.post(
            f"{settings.API_V1_PREFIX}/children/",
            headers=headers,
            json=child_data,
        )
        assert response.status_code == 201
    
    # Get all children
    response = client.get(
        f"{settings.API_V1_PREFIX}/children/",
        headers=headers,
    )
    
    # Verify response
    assert response.status_code == 200
    content = response.json()
    assert len(content) == 3
    for i, child in enumerate(sorted(content, key=lambda x: x["name"])):
        assert f"Child {i}" in child["name"]
        assert child["parent_id"] == user_data["id"]
    
    # Create another parent with children
    other_user = create_test_user(client)
    other_headers = get_auth_headers(client, other_user["email"], other_user["password"])
    
    other_child = {
        "name": "Other Parent's Child",
        "grade": "5th grade",
        "subjects": ["History"],
    }
    client.post(
        f"{settings.API_V1_PREFIX}/children/",
        headers=other_headers,
        json=other_child,
    )
    
    # Verify first parent still only sees their children
    response2 = client.get(
        f"{settings.API_V1_PREFIX}/children/",
        headers=headers,
    )
    assert response2.status_code == 200
    assert len(response2.json()) == 3


def test_read_child(client: TestClient, db: Session) -> None:
    """Test getting a specific child profile."""
    # Create parent user through the API
    user_data = create_test_user(client)
    headers = get_auth_headers(client, user_data["email"], user_data["password"])
    
    # Create a child
    child_data = {
        "name": "Get Test Child",
        "grade": "3rd grade",
        "subjects": ["Math", "Science"],
    }
    
    response = client.post(
        f"{settings.API_V1_PREFIX}/children/",
        headers=headers,
        json=child_data,
    )
    
    child_id = response.json()["id"]
    
    # Get the child by ID
    response2 = client.get(
        f"{settings.API_V1_PREFIX}/children/{child_id}",
        headers=headers,
    )
    
    # Verify response
    assert response2.status_code == 200
    content = response2.json()
    assert content["name"] == child_data["name"]
    assert content["id"] == child_id
    
    # Test getting another parent's child
    other_user = create_test_user(client)
    other_headers = get_auth_headers(client, other_user["email"], other_user["password"])
    
    other_child = {
        "name": "Other Parent's Child",
        "grade": "5th grade",
        "subjects": ["History"],
    }
    other_response = client.post(
        f"{settings.API_V1_PREFIX}/children/",
        headers=other_headers,
        json=other_child,
    )
    assert other_response.status_code == 201
    other_child_id = other_response.json()["id"]
    
    # Try to access other parent's child (should fail)
    response3 = client.get(
        f"{settings.API_V1_PREFIX}/children/{other_child_id}",
        headers=headers,  # First parent's headers
    )
    
    # Verify access denied
    assert response3.status_code == 404
    assert "not found or you don't have access" in response3.json()["detail"]


def test_update_child(client: TestClient, db: Session) -> None:
    """Test updating a child profile."""
    # Create parent user through the API
    user_data = create_test_user(client)
    headers = get_auth_headers(client, user_data["email"], user_data["password"])
    
    # Create a child
    child_data = {
        "name": "Update Test Child",
        "grade": "3rd grade",
        "subjects": ["Math"],
    }
    
    response = client.post(
        f"{settings.API_V1_PREFIX}/children/",
        headers=headers,
        json=child_data,
    )
    
    child_id = response.json()["id"]
    
    # Update the child
    update_data = {
        "grade": "4th grade",
        "subjects": ["Math", "Science", "Art"],
    }
    
    response2 = client.put(
        f"{settings.API_V1_PREFIX}/children/{child_id}",
        headers=headers,
        json=update_data,
    )
    
    # Verify response
    assert response2.status_code == 200
    content = response2.json()
    assert content["name"] == child_data["name"]  # Unchanged
    assert content["grade"] == update_data["grade"]
    assert content["subjects"] == update_data["subjects"]
    
    # Test validation - empty subjects list
    invalid_update = {
        "subjects": []
    }
    
    response3 = client.put(
        f"{settings.API_V1_PREFIX}/children/{child_id}",
        headers=headers,
        json=invalid_update,
    )
    
    # Verify validation error
    assert response3.status_code == 422


def test_delete_child(client: TestClient, db: Session) -> None:
    """Test deleting a child profile."""
    # Create parent user through the API
    user_data = create_test_user(client)
    headers = get_auth_headers(client, user_data["email"], user_data["password"])
    
    # Create a child
    child_data = {
        "name": "Delete Test Child",
        "grade": "3rd grade",
        "subjects": ["Math"],
    }
    
    response = client.post(
        f"{settings.API_V1_PREFIX}/children/",
        headers=headers,
        json=child_data,
    )
    
    child_id = response.json()["id"]
    
    # Verify child exists
    get_response = client.get(
        f"{settings.API_V1_PREFIX}/children/{child_id}",
        headers=headers,
    )
    assert get_response.status_code == 200
    
    # Delete the child
    delete_response = client.delete(
        f"{settings.API_V1_PREFIX}/children/{child_id}",
        headers=headers,
    )
    
    # Verify deletion response
    assert delete_response.status_code == 200
    assert delete_response.json()["id"] == child_id
    
    # Verify child no longer exists
    get_response2 = client.get(
        f"{settings.API_V1_PREFIX}/children/{child_id}",
        headers=headers,
    )
    assert get_response2.status_code == 404
