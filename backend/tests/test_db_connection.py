"""
Basic tests to validate database connection and model functionality.
"""
import pytest
from sqlalchemy.exc import SQLAlchemyError

from app.models.user import User


def test_create_user(db):
    """
    Test that we can create a user in the database.
    Tests basic database connectivity and model functionality.
    """
    user = User(
        email="test@example.com",
        name="Test User",
        hashed_password="hashed_password123",
        is_active=True
    )
    
    db.add(user)
    db.commit()
    db.refresh(user)
    
    assert user.id is not None
    assert user.email == "test@example.com"
    assert user.name == "Test User"
    assert user.hashed_password == "hashed_password123"
    assert user.is_active is True


def test_query_user(db):
    """
    Test that we can query a user from the database.
    Tests SQLAlchemy query functionality.
    """
    # Create a test user
    user = User(
        email="query_test@example.com",
        name="Query Test User",
        hashed_password="hashed_password456",
        is_active=True
    )
    
    db.add(user)
    db.commit()
    
    # Query the user back
    queried_user = db.query(User).filter(User.email == "query_test@example.com").first()
    
    assert queried_user is not None
    assert queried_user.email == "query_test@example.com"
    assert queried_user.name == "Query Test User"
