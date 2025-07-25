#!/usr/bin/env python3
"""
Database setup script for AI Teacher application.
Creates and initializes both development and test databases.
Runs initial migrations.

Usage:
    python setup_db.py [--test] [--reset]

Options:
    --test  Set up test database only
    --reset Force reset (drop and recreate) the database
"""

import os
import sys
import argparse
import subprocess
import psycopg2
from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT

# Add parent directory to path so we can import app modules
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app.core.config import settings


def run_alembic_migrations(database_name=None):
    """Run Alembic migrations to set up the database schema."""
    print(f"Running Alembic migrations on {database_name or 'default database'}...")
    
    env = os.environ.copy()
    if database_name:
        # Override database name in connection string for test database
        connection_string = settings.SQLALCHEMY_DATABASE_URI.replace(
            settings.POSTGRES_DB, database_name
        )
        env["SQLALCHEMY_DATABASE_URI"] = connection_string
    
    # Change to backend directory to run alembic
    backend_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
    
    try:
        # Run migrations with alembic
        subprocess.run(
            ["alembic", "upgrade", "head"], 
            cwd=backend_dir,
            env=env, 
            check=True
        )
        print("Database migrations completed successfully.")
    except subprocess.CalledProcessError as e:
        print(f"Error running migrations: {e}")
        sys.exit(1)


def setup_database(db_name, reset=False):
    """Set up a database with the given name."""
    # Connect to PostgreSQL server
    conn = psycopg2.connect(
        user=settings.POSTGRES_USER,
        password=settings.POSTGRES_PASSWORD,
        host=settings.POSTGRES_SERVER,
        port="5432"
    )
    conn.set_isolation_level(ISOLATION_LEVEL_AUTOCOMMIT)
    
    # Create a cursor
    cursor = conn.cursor()
    
    # Check if database exists
    cursor.execute(f"SELECT 1 FROM pg_catalog.pg_database WHERE datname = '{db_name}'")
    exists = cursor.fetchone()
    
    if exists and reset:
        # First close all active connections to the database
        cursor.execute(f"""
            SELECT pg_terminate_backend(pg_stat_activity.pid)
            FROM pg_stat_activity
            WHERE pg_stat_activity.datname = '{db_name}'
            AND pid <> pg_backend_pid()
        """)
        
        # Drop database
        print(f"Dropping existing database: {db_name}")
        cursor.execute(f"DROP DATABASE {db_name}")
        exists = False
    
    if not exists:
        # Create database
        print(f"Creating database: {db_name}")
        cursor.execute(f"CREATE DATABASE {db_name}")
        print(f"Database {db_name} created successfully.")
    else:
        print(f"Database {db_name} already exists.")
    
    # Close connection
    cursor.close()
    conn.close()


def main():
    """Main function to set up databases."""
    parser = argparse.ArgumentParser(description='Set up AI Teacher databases.')
    parser.add_argument('--test', action='store_true', help='Set up test database only')
    parser.add_argument('--reset', action='store_true', help='Reset databases')
    args = parser.parse_args()
    
    if args.test:
        # Set up test database only
        test_db_name = f"{settings.POSTGRES_DB}_test"
        print(f"Setting up test database: {test_db_name}")
        setup_database(test_db_name, reset=args.reset)
        run_alembic_migrations(test_db_name)
    else:
        # Set up both development and test databases
        print(f"Setting up development database: {settings.POSTGRES_DB}")
        setup_database(settings.POSTGRES_DB, reset=args.reset)
        run_alembic_migrations()
        
        # Also set up test database for automated testing
        test_db_name = f"{settings.POSTGRES_DB}_test"
        print(f"Setting up test database: {test_db_name}")
        setup_database(test_db_name, reset=args.reset)
        run_alembic_migrations(test_db_name)


if __name__ == "__main__":
    main()
