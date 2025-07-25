# Database Setup and Management Guide

This document outlines the database structure and management procedures for the AI Teacher application.

## Database Model Overview

The AI Teacher application uses PostgreSQL for data storage with the following key models:

- **User**: Parent accounts with authentication details
- **Child**: Student profiles with grade, subjects, and learning preferences
- **Session**: Learning sessions between a child and the AI teacher
- **Message**: Individual messages within a session
- **Quiz**: Test/quiz entities generated for a child
- **Question**: Individual questions in a quiz
- **QuizAttempt**: A child's attempt at completing a quiz
- **Answer**: A child's answer to a specific question

## Entity-Relationship Diagram (ERD)

```
User 1──────┐
 │          │
 │          │
 ▼          │
Child 1─────┼─────┐
 │          │     │
 │          │     │
 │          │     │
 ├──────────┘     │
 │                │
 ▼                ▼
Session 1───► Quiz 1
 │               │
 │               ▼
 ▼           Question 1
Message 1        │
 │               │
 │               ▼
 ▼           QuizAttempt 1
Feedback 1       │
                 │
                 ▼
                Answer 1
```

## Database Setup

### Prerequisites

- PostgreSQL 14+ installed and running
- Python 3.9+ with pip

### Initial Setup

1. Create a virtual environment and install dependencies:

```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

2. Create and set up the databases (both development and test):

```bash
python scripts/setup_db.py
```

This script will:
- Create the main development database
- Create a separate test database for automated testing
- Run all migrations to set up the schema

### Reset Databases

To reset (drop and recreate) the databases:

```bash
python scripts/setup_db.py --reset
```

### Set Up Only Test Database

For CI/CD pipelines or when you only need to reset the test database:

```bash
python scripts/setup_db.py --test [--reset]
```

## Database Migrations

We use Alembic for database migrations to track schema changes over time.

### Create a New Migration

After modifying the SQLAlchemy models, create a new migration:

```bash
cd backend
alembic revision --autogenerate -m "description of changes"
```

### Apply Migrations

To apply pending migrations:

```bash
alembic upgrade head
```

### Roll Back Migrations

To roll back to a previous version:

```bash
alembic downgrade <revision_id>
```

## Testing with the Database

The test suite automatically uses a separate test database (`ai_teacher_test`) and each test runs in its own transaction that is rolled back after the test completes.

To run the database tests:

```bash
cd backend
pytest tests/test_db_connection.py -v
```

## Common Issues and Troubleshooting

### Connection Issues

If you encounter connection errors, verify:
1. PostgreSQL service is running
2. Credentials in `.env` file are correct
3. Database exists (run `scripts/setup_db.py` if needed)

### Migration Issues

If migrations fail:
1. Check that all model imports are correctly included in `app/models/__init__.py`
2. Ensure no conflicting migrations exist
3. Manually resolve any migration conflicts

## Database Maintenance Best Practices

1. Always create migrations for schema changes
2. Back up the database before major changes
3. Run tests before applying migrations to production
4. Document complex schema changes in the migration file
