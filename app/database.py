# Database connection and session management using SQLAlchemy ORM

from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
from sqlalchemy.ext.declarative import declarative_base
import os

# Database URL format: dialect+driver://user:password@host:port/database
# Load credentials from environment variables in production
SQLALCHEMY_DATABASE_URL = "DB_URL"

# Engine manages connection pooling and SQL execution
engine = create_engine(SQLALCHEMY_DATABASE_URL)

# Session factory creates DB sessions for each request
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base class for all ORM models
Base = declarative_base()


def get_db():
    """
    Dependency injection for database sessions.
    - Each request gets its own isolated session
    - try/finally ensures proper cleanup (even on exceptions)
    - Use with: db: Session = Depends(get_db) in route handlers
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
