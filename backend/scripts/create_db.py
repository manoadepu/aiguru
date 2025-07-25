#!/usr/bin/env python3
"""
Database initialization script.
Creates the PostgreSQL database if it doesn't exist.
"""

import os
import sys
import psycopg2
from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT

# Add parent directory to path so we can import app modules
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app.core.config import settings


def create_database() -> None:
    """
    Create the database if it doesn't exist.
    """
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
    cursor.execute(f"SELECT 1 FROM pg_catalog.pg_database WHERE datname = '{settings.POSTGRES_DB}'")
    exists = cursor.fetchone()
    
    if not exists:
        # Create database
        print(f"Creating database: {settings.POSTGRES_DB}")
        cursor.execute(f"CREATE DATABASE {settings.POSTGRES_DB}")
        print(f"Database {settings.POSTGRES_DB} created successfully.")
    else:
        print(f"Database {settings.POSTGRES_DB} already exists.")
    
    # Close connection
    cursor.close()
    conn.close()


if __name__ == "__main__":
    try:
        create_database()
    except Exception as e:
        print(f"Error: {e}")
        sys.exit(1)
