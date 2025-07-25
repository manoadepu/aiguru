# AI Teacher Backend Quick Start Guide

This guide provides step-by-step instructions to quickly get the AI Teacher backend running for development purposes.

## Prerequisites

- Python 3.10+ installed
- Docker installed (for PostgreSQL container)
- Git (for source code management)

## 1. Clone the Repository (if not done already)

```bash
git clone <repository-url>
cd teacher
```

## 2. Set Up Database with Docker

```bash
# Start PostgreSQL container
docker run --name postgres-ai-teacher \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_DB=ai_teacher \
  -p 5432:5432 \
  -d postgres:14
```

## 3. Set Up Python Environment

```bash
# Navigate to backend directory
cd backend

# Create and activate virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
```

## 4. Configure Environment Variables

```bash
# Copy example environment file
cp .env.example .env

# Open .env file and verify settings
# Particularly database connection details
```

## 5. Apply Database Migrations

```bash
# Run Alembic migrations to create schema
alembic upgrade head
```

## 6. Start the Development Server

```bash
# Start the server on port 8080
uvicorn app.main:app --reload --port 8080
```

## 7. Access API Documentation

Open your browser and navigate to:
- Swagger UI: http://localhost:8080/docs
- ReDoc: http://localhost:8080/redoc

## 8. Testing the Application

```bash
# Run all tests
pytest

# Run with coverage
pytest --cov=app

# Run specific tests
pytest tests/api/test_auth.py
```

## Common Issues

### Port Already in Use

If port 8080 is already in use, start the server on a different port:

```bash
uvicorn app.main:app --reload --port 8088
```

### Database Connection Issues

If you encounter database connection errors:

```bash
# Check if PostgreSQL container is running
docker ps

# If not running, start it
docker start postgres-ai-teacher

# Check database logs for errors
docker logs postgres-ai-teacher
```

### Package Import Errors

If you get import errors:

```bash
# Make sure you're in the right directory
cd /path/to/teacher/backend

# Make sure virtual environment is activated
source venv/bin/activate

# Reinstall packages
pip install -r requirements.txt
```

## Next Steps

1. Create a test user using the `/api/v1/auth/register` endpoint
2. Log in with the test user at `/api/v1/auth/login` to get a token
3. Use the token to access protected endpoints
4. Create and manage child profiles using the `/api/v1/children` endpoints

## Development Workflow

1. Make code changes
2. Write tests for your changes
3. Run the tests to verify functionality
4. Update API documentation if needed
5. Commit your changes with descriptive messages

For more detailed information, refer to:
- [README.md](./README.md) - Complete project documentation
- [DATABASE.md](./DATABASE.md) - Database structure and management
- [API_TESTING.md](./API_TESTING.md) - Comprehensive API testing guide
