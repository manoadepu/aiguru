# AI Teacher Backend

## Overview

This is the backend service for the AI Teacher application, a personalized learning platform that allows parents to create tailored educational experiences for their children. The backend provides APIs for user authentication, child profile management, learning sessions, and quiz generation.

## Technology Stack

- **Framework**: FastAPI
- **Database**: PostgreSQL
- **ORM**: SQLAlchemy
- **Migrations**: Alembic
- **Authentication**: JWT tokens
- **API Documentation**: OpenAPI/Swagger
- **AI Integration**: OpenAI GPT-4o/GPT-4 Turbo via LangChain (Phase 2)

## Project Structure

```
backend/
├── app/                      # Application code
│   ├── api/                  # API endpoints
│   │   ├── api_v1/           # API version 1
│   │   │   ├── endpoints/    # API endpoint modules
│   │   │   └── api.py        # API router
│   │   └── deps.py           # API dependencies
│   ├── core/                 # Core modules
│   │   ├── config.py         # Configuration settings
│   │   └── security.py       # Security utilities
│   ├── crud/                 # CRUD operations
│   │   ├── base.py           # Base CRUD class
│   │   ├── crud_user.py      # User operations
│   │   └── crud_child.py     # Child operations
│   ├── db/                   # Database modules
│   │   └── session.py        # Database session
│   ├── models/               # SQLAlchemy models
│   │   ├── base.py           # Base model
│   │   ├── user.py           # User model
│   │   ├── child.py          # Child model
│   │   ├── session.py        # Session model
│   │   └── quiz.py           # Quiz model
│   ├── schemas/              # Pydantic schemas
│   │   ├── base.py           # Base schema
│   │   ├── user.py           # User schemas
│   │   └── child.py          # Child schemas
│   └── main.py               # Application entry point
├── migrations/               # Alembic migrations
├── tests/                    # Test modules
│   ├── api/                  # API tests
│   └── crud/                 # CRUD tests
├── .env                      # Environment variables (local)
├── .env.example              # Example environment variables
├── requirements.txt          # Python dependencies
└── setup.py                  # Package setup
```

## Setup Instructions

### Prerequisites

- Python 3.10 or higher
- PostgreSQL (native or Docker)
- Docker (optional, for PostgreSQL container)

### Environment Setup

1. **Clone the repository**

2. **Create a virtual environment**
   ```bash
   cd /path/to/teacher/backend
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Configure environment variables**
   ```bash
   # Copy the example environment file
   cp .env.example .env
   
   # Edit the .env file with your settings
   # Particularly database connection and security keys
   ```

### Database Setup

#### Option 1: Use PostgreSQL Docker container

```bash
# Run PostgreSQL in Docker
docker run --name postgres-ai-teacher \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_DB=ai_teacher \
  -p 5432:5432 \
  -d postgres:14
```

#### Option 2: Use native PostgreSQL installation

1. Install PostgreSQL following the official documentation for your OS
2. Create a database named `ai_teacher`
3. Update the `.env` file with your database credentials

### Apply Database Migrations

```bash
# Initialize Alembic (if not done yet)
alembic init migrations

# Create initial migration
alembic revision --autogenerate -m "initial schema"

# Apply migrations
alembic upgrade head
```

## Running the Application

### Development Server

```bash
# Start the server with auto-reload
uvicorn app.main:app --reload --port 8080
```

### Production Server

```bash
# Start the server without auto-reload
uvicorn app.main:app --host 0.0.0.0 --port 8080
```

## API Documentation

The API documentation is available via Swagger UI and ReDoc when the application is running:

- Swagger UI: http://localhost:8080/docs
- ReDoc: http://localhost:8080/redoc

### API Endpoints

#### Authentication

- `POST /api/v1/auth/register` - Register a new user
- `POST /api/v1/auth/login` - Login and get access token

#### Users

- `GET /api/v1/users/me` - Get current user profile
- `PUT /api/v1/users/me` - Update current user profile
- `GET /api/v1/users/{user_id}` - Get user by ID (admin only)
- `GET /api/v1/users/` - List all users (admin only)

#### Children

- `GET /api/v1/children/` - List all children profiles for current user
- `POST /api/v1/children/` - Create a new child profile
- `GET /api/v1/children/{child_id}` - Get a specific child profile
- `PUT /api/v1/children/{child_id}` - Update a child profile
- `DELETE /api/v1/children/{child_id}` - Delete a child profile

## Running Tests

```bash
# Run all tests
pytest

# Run tests with coverage
pytest --cov=app tests/

# Run specific test file
pytest tests/api/test_auth.py
```

## Common Issues and Troubleshooting

### Database Connection Issues

- **Error**: "connection refused" - PostgreSQL server might not be running
  - **Solution**: Start the PostgreSQL service or Docker container

- **Error**: "authentication failed" - Wrong credentials
  - **Solution**: Check the database credentials in your `.env` file

### API Server Issues

- **Error**: "Address already in use" - Port is already occupied
  - **Solution**: Use a different port with `--port` option

- **Error**: Missing module dependencies
  - **Solution**: Ensure all packages are installed with `pip install -r requirements.txt`

### Authentication Issues

- **Error**: "Could not validate credentials"
  - **Solution**: Check that you're passing the JWT token correctly in the Authorization header

## Development Workflow

1. Create or update models in `app/models/`
2. Create or update schemas in `app/schemas/`
3. Implement CRUD operations in `app/crud/`
4. Create API endpoints in `app/api/api_v1/endpoints/`
5. Add the endpoint to the router in `app/api/api_v1/api.py`
6. Write tests for your new functionality

## Future Development (Phase 2+)

- OpenAI integration for AI tutoring
- Session management for learning interactions
- Quiz generation and evaluation
- Feedback processing and adaptation

## Contributors

- AI Teacher Development Team

## License

Proprietary - All rights reserved
