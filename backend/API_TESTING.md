# API Testing Guide for AI Teacher

This document provides guidelines and best practices for testing the AI Teacher API endpoints. It is meant for developers and QA engineers working on the application.

## Testing Tools

The AI Teacher backend uses the following testing tools:

- **pytest**: Main testing framework
- **FastAPI TestClient**: For API integration tests
- **pytest-cov**: For test coverage reporting
- **SQLAlchemy**: For database interaction in tests

## Test Structure

The test suite is organized as follows:

```
tests/
├── conftest.py                # Test fixtures and configuration
├── api/                       # API integration tests
│   ├── test_auth.py           # Authentication endpoints
│   ├── test_users.py          # User management endpoints
│   └── test_children.py       # Child profile endpoints
├── crud/                      # CRUD operation unit tests
│   ├── test_user.py           # User CRUD tests
│   └── test_child.py          # Child CRUD tests
└── test_db_connection.py      # Database connectivity tests
```

## Test Fixtures

Common test fixtures are defined in `conftest.py` and include:

- `db`: Provides a database session for testing
- `client`: Provides a FastAPI TestClient for API testing
- `test_user`: Creates a test user for authentication tests
- `auth_headers`: Provides authentication headers for protected endpoints

## Running Tests

### Run All Tests

```bash
cd backend
pytest
```

### Run with Coverage Report

```bash
pytest --cov=app
```

### Run Specific Test File

```bash
pytest tests/api/test_auth.py
```

### Run Tests with Verbose Output

```bash
pytest -v
```

## Test Database

Tests use a separate database (`ai_teacher_test`) to avoid affecting development data. Each test runs in its own transaction that is rolled back after the test completes, ensuring test isolation.

## Writing Effective API Tests

### 1. Test Authentication

Always test both successful and failed authentication scenarios:

```python
def test_login_valid_credentials(client, test_user):
    # Test successful login
    
def test_login_invalid_password(client, test_user):
    # Test login with wrong password
    
def test_login_nonexistent_user(client):
    # Test login with email not in database
```

### 2. Test Protected Endpoints

Verify that protected endpoints require authentication:

```python
def test_read_users_me_unauthorized(client):
    # Without auth headers, should return 401
    
def test_read_users_me_authorized(client, auth_headers):
    # With auth headers, should return user data
```

### 3. Test Input Validation

Verify that input validation works correctly:

```python
def test_create_child_empty_subjects(client, auth_headers):
    # Should return 422 when subjects array is empty
```

### 4. Test Business Logic

Verify that business logic constraints are enforced:

```python
def test_create_child_with_parent_association(client, auth_headers, db):
    # Verify child is associated with authenticated user
```

### 5. Test Status Codes

Verify that endpoints return correct status codes:

- `200`: Successful GET, PUT, DELETE operations
- `201`: Successful POST operations (resource created)
- `401`: Unauthorized (missing or invalid token)
- `403`: Forbidden (insufficient permissions)
- `404`: Resource not found
- `422`: Validation error

## Test Data Management

### Approach 1: Fixture-based

Use pytest fixtures to set up and tear down test data:

```python
@pytest.fixture
def test_child(db, test_user):
    # Create a test child for the test user
    child_obj = models.Child(
        name="Test Child",
        grade="3rd grade",
        subjects=["Math", "Science"],
        parent_id=test_user["id"]
    )
    db.add(child_obj)
    db.commit()
    db.refresh(child_obj)
    yield child_obj
    # Cleanup happens automatically via transaction rollback
```

### Approach 2: Factory-based

For complex test data scenarios, consider using factory functions:

```python
def create_test_child(db, parent_id, **kwargs):
    child_data = {
        "name": "Test Child",
        "grade": "3rd grade",
        "subjects": ["Math"],
        "parent_id": parent_id
    }
    child_data.update(kwargs)
    child_obj = models.Child(**child_data)
    db.add(child_obj)
    db.commit()
    db.refresh(child_obj)
    return child_obj
```

## Common Test Scenarios

### 1. Authentication Flow Testing

```python
def test_full_auth_flow(client):
    # 1. Register a new user
    # 2. Login with the new user
    # 3. Access a protected endpoint
```

### 2. Child Profile CRUD Testing

```python
def test_child_crud_operations(client, auth_headers):
    # 1. Create a child profile
    # 2. Retrieve the child profile
    # 3. Update the child profile
    # 4. Delete the child profile
    # 5. Verify deletion
```

### 3. Security Testing

```python
def test_user_cannot_access_others_child(client, auth_headers, db):
    # 1. Create a second user
    # 2. Have second user create a child profile
    # 3. First user attempts to access second user's child (should fail)
```

## API Contract Testing

Verify that API responses match the expected schemas:

```python
def test_get_child_schema(client, auth_headers, test_child):
    response = client.get(f"/api/v1/children/{test_child.id}", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    
    # Verify schema fields
    assert "id" in data
    assert "name" in data
    assert "grade" in data
    assert "subjects" in data
    assert isinstance(data["subjects"], list)
```

## Test Mocking (Phase 2+)

For testing AI-related functionality (Phase 2), use mocking to avoid actual OpenAI API calls:

```python
def test_ai_session_response(client, auth_headers, monkeypatch):
    # Mock the OpenAI client response
    def mock_completion(*args, **kwargs):
        return {"choices": [{"message": {"content": "Mocked AI response"}}]}
    
    monkeypatch.setattr("app.services.ai.openai_client.chat.completions.create", 
                      mock_completion)
    
    # Test AI response endpoint
```

## Continuous Integration

The test suite is designed to run in CI environments:

1. Set up test database in CI
2. Run migrations
3. Execute test suite
4. Generate coverage report
5. Fail build if coverage threshold not met

## Best Practices

1. **Isolation**: Tests should not depend on each other
2. **Deterministic**: Tests should produce the same result each time
3. **Fast**: Tests should run quickly to enable frequent execution
4. **Comprehensive**: Cover both happy paths and edge cases
5. **Maintainable**: Use fixtures and helper functions to reduce duplication

## Troubleshooting Tests

### Tests Failing Due to Database Issues

1. Verify test database exists
2. Check migrations are up to date
3. Ensure transaction rollback is working properly

### Inconsistent Test Results

1. Look for shared state between tests
2. Check for non-deterministic code (e.g., random values)
3. Verify test order independence

### Authentication Test Failures

1. Verify JWT token configuration in test environment
2. Check token expiration settings
3. Ensure proper authentication headers are being sent
