"""
Main pytest configuration file for backend tests.
Contains fixtures and configuration shared across all tests.
"""
import asyncio
import os
from typing import Any, Generator

import pytest
from fastapi import FastAPI
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv

# Load test environment variables
load_dotenv('.env.test')

from app.core.config import settings
from app.db.session import Base, get_db
from app.main import app as app_instance
from app.api.deps import get_current_user

# Use the test database URI from .env.test
TEST_SQLALCHEMY_DATABASE_URI = settings.SQLALCHEMY_DATABASE_URI

# Create test database engine
engine = create_engine(TEST_SQLALCHEMY_DATABASE_URI, pool_pre_ping=True)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


@pytest.fixture(scope="session")
def app() -> FastAPI:
    """
    Create a fresh FastAPI app for testing.
    Returns the application instance.
    """
    return app_instance


@pytest.fixture(scope="session")
def db_engine():
    """
    Create a new database engine for testing.
    Used for database setup/teardown.
    """
    # Create test database tables
    Base.metadata.create_all(bind=engine)
    
    yield engine
    
    # Drop all tables after tests are done
    Base.metadata.drop_all(bind=engine)


@pytest.fixture(scope="function")
def db(db_engine):
    """
    Create a new database session for a test.
    Each test gets its own session and transaction that is rolled back at the end.
    """
    connection = db_engine.connect()
    # Start transaction
    transaction = connection.begin()
    
    # Create a session for testing
    session = TestingSessionLocal(bind=connection)
    
    yield session
    
    # Close and roll back transaction
    session.close()
    transaction.rollback()
    connection.close()


@pytest.fixture(scope="function")
def client(app, db) -> Generator:
    """
    Create a FastAPI TestClient with a database session override.
    Allows API tests to use the test database session.
    """
    # Dependency override for database
    def _get_test_db():
        try:
            yield db
        finally:
            pass
    
    app.dependency_overrides[get_db] = _get_test_db
    
    with TestClient(app) as client:
        yield client
    
    # Clear all dependency overrides
    app.dependency_overrides.clear()


@pytest.fixture(scope="function")
def mock_current_user(app):
    """
    Mock an authenticated user for protected API endpoints.
    This allows testing without having to perform authentication.
    """
    def mock_get_current_user():
        from app.models.user import User
        import uuid
        from datetime import datetime
        
        # Create a mock user instance
        user = User(
            id=uuid.uuid4(),
            email="test@example.com",
            name="Test User",
            hashed_password="mock_hashed_password",
            is_active=True,
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow()
        )
        return user
    
    app.dependency_overrides[get_current_user] = mock_get_current_user
    
    yield
    
    # Clear all dependency overrides
    app.dependency_overrides.clear()
