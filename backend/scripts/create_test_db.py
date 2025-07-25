#!/usr/bin/env python3
"""
Test database initialization script.
Creates a separate PostgreSQL database for testing.
"""

import os
import sys
import psycopg2
from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT

# Add parent directory to path so we can import app modules
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app.core.config import settings


def create_test_database() -> None:
    """
    Create a test database for automated testing.
    """
    test_db_name = f"{settings.POSTGRES_DB}_test"
    
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
    
    # Check if test database exists and drop it if it does
    cursor.execute(f"SELECT 1 FROM pg_catalog.pg_database WHERE datname = '{test_db_name}'")
    exists = cursor.fetchone()
    
    if exists:
        # First close all active connections to the database
        cursor.execute(f"""
            SELECT pg_terminate_backend(pg_stat_activity.pid)
            FROM pg_stat_activity
            WHERE pg_stat_activity.datname = '{test_db_name}'
            AND pid <> pg_backend_pid()
        """)
        
        # Drop database
        print(f"Dropping existing test database: {test_db_name}")
        cursor.execute(f"DROP DATABASE {test_db_name}")
    
    # Create fresh test database
    print(f"Creating test database: {test_db_name}")
    cursor.execute(f"CREATE DATABASE {test_db_name}")
    print(f"Test database {test_db_name} created successfully.")
    
    # Close connection
    cursor.close()
    conn.close()


if __name__ == "__main__":
    try:
        create_test_database()
    except Exception as e:
        print(f"Error: {e}")
        sys.exit(1)
