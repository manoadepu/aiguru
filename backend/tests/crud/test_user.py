"""
Unit tests for user CRUD operations.
"""
import pytest
from uuid import uuid4

from sqlalchemy.orm import Session

from app import crud
from app.schemas.user import UserCreate, UserUpdate
from app.core.security import verify_password


def test_create_user(db: Session) -> None:
    """Test user creation with proper hashing of password."""
    email = "test@example.com"
    password = "securepassword123"
    name = "Test User"
    
    user_in = UserCreate(email=email, password=password, name=name)
    user = crud.user.create(db, obj_in=user_in)
    
    # Verify user was created with correct data
    assert user.email == email
    assert user.name == name
    assert hasattr(user, "hashed_password")
    assert user.hashed_password != password  # Password should be hashed
    assert verify_password(password, user.hashed_password)  # Verify hash is correct
    assert user.is_active is True
    assert user.is_superuser is False


def test_authenticate_user(db: Session) -> None:
    """Test user authentication with correct and incorrect credentials."""
    email = "auth-test@example.com"
    password = "testpass123"
    
    user_in = UserCreate(email=email, password=password, name="Auth Test")
    crud.user.create(db, obj_in=user_in)
    
    # Test authentication with correct credentials
    authenticated_user = crud.user.authenticate(
        db, email=email, password=password
    )
    assert authenticated_user is not None
    assert authenticated_user.email == email
    
    # Test authentication with incorrect email
    wrong_email_user = crud.user.authenticate(
        db, email="wrong@example.com", password=password
    )
    assert wrong_email_user is None
    
    # Test authentication with incorrect password
    wrong_pass_user = crud.user.authenticate(
        db, email=email, password="wrongpass"
    )
    assert wrong_pass_user is None


def test_get_user(db: Session) -> None:
    """Test retrieving a user by ID."""
    email = "get-test@example.com"
    password = "testpass123"
    
    user_in = UserCreate(email=email, password=password, name="Get Test")
    user = crud.user.create(db, obj_in=user_in)
    
    # Get user by ID
    retrieved_user = crud.user.get(db, id=user.id)
    assert retrieved_user
    assert retrieved_user.id == user.id
    assert retrieved_user.email == email
    
    # Test non-existent user
    non_existent = crud.user.get(db, id=uuid4())
    assert non_existent is None


def test_update_user(db: Session) -> None:
    """Test updating user information."""
    email = "update-test@example.com"
    password = "testpass123"
    
    user_in = UserCreate(email=email, password=password, name="Update Test")
    user = crud.user.create(db, obj_in=user_in)
    
    # Update name only
    new_name = "Updated Name"
    user_update = UserUpdate(name=new_name)
    updated_user = crud.user.update(db, db_obj=user, obj_in=user_update)
    assert updated_user.name == new_name
    assert verify_password(password, updated_user.hashed_password)  # Password unchanged
    
    # Update password
    new_password = "newpass456"
    user_update2 = UserUpdate(password=new_password)
    updated_user2 = crud.user.update(db, db_obj=updated_user, obj_in=user_update2)
    assert verify_password(new_password, updated_user2.hashed_password)
    assert not verify_password(password, updated_user2.hashed_password)
    
    # Update using dict
    newest_name = "Newest Name"
    crud.user.update(db, db_obj=updated_user2, obj_in={"name": newest_name})
    db.refresh(updated_user2)
    assert updated_user2.name == newest_name
