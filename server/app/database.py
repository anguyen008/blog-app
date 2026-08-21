# Database connection and session management using SQLAlchemy ORM

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from .config import settings

# Database URL format: dialect+driver://user:password@host:port/database
# Load credentials from environment variables in production
SQLALCHEMY_DATABASE_URL = f"postgresql+psycopg://{settings.database_user}:{settings.database_password}@{settings.database_host}:{settings.database_port}/{settings.database_name}"

# Engine manages connection pooling and SQL execution
engine = create_engine(SQLALCHEMY_DATABASE_URL, pool_pre_ping=True, pool_recycle=3600)

# Session factory creates DB sessions for each request
SessionLocal = sessionmaker(autoflush=False, bind=engine, autocommit=False)


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
