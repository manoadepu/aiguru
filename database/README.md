# PostgreSQL Database Setup with Docker

This guide explains how to set up and use the PostgreSQL database for the AI Teacher application using Docker.

## Prerequisites

- [Docker](https://www.docker.com/get-started) installed on your machine
- [Docker Compose](https://docs.docker.com/compose/install/) installed on your machine

## Database Configuration

The Docker Compose file is configured with the following settings:

- **PostgreSQL Database**:
  - Username: `postgres`
  - Password: `postgres`
  - Database name: `ai_teacher`
  - Port: `5432` (accessible on localhost)

- **pgAdmin** (Database Management UI):
  - URL: `http://localhost:5050`
  - Email: `admin@teacher.com`
  - Password: `admin`

## Starting the Database

1. Navigate to the project root directory:
   ```bash
   cd /path/to/teacher
   ```

2. Start the PostgreSQL database and pgAdmin:
   ```bash
   docker-compose up -d
   ```

3. To stop the services:
   ```bash
   docker-compose down
   ```

## Connecting to the Database

### From the Backend Application

The backend application should use these connection settings:

```python
DATABASE_URL = "postgresql://postgres:postgres@localhost:5432/ai_teacher"
```

### Using pgAdmin

1. Open your browser and navigate to `http://localhost:5050`
2. Log in with:
   - Email: `admin@teacher.com`
   - Password: `admin`
3. Add a new server:
   - Name: `Teacher DB` (or any name you prefer)
   - Host: `postgres` (this is the service name in the Docker network)
   - Port: `5432`
   - Username: `postgres`
   - Password: `postgres`
   - Database: `ai_teacher`

## Data Persistence

The database data is stored in a Docker volume named `postgres_data`, which persists even when containers are stopped or removed.

## Troubleshooting

If you encounter issues:

1. Check if the containers are running:
   ```bash
   docker ps
   ```

2. View container logs:
   ```bash
   docker-compose logs postgres
   ```

3. Reset the database (this will delete all data):
   ```bash
   docker-compose down -v
   docker-compose up -d
   ```
