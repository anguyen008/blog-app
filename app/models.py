# SQLAlchemy ORM models representing database tables

from datetime import datetime
from .database import Base
from sqlalchemy import Column, String, UUID, text
import uuid
from sqlalchemy.sql.sqltypes import TIMESTAMP
from sqlalchemy.dialects.postgresql import UUID


class Users(Base):
    """Users table with UUID primary key and authentication fields"""
    __tablename__ = "users"

    # UUID better than auto-increment: doesn't reveal record count, safer for distributed systems
    id = Column(
        UUID(as_uuid=True),
        primary_key=True,
        index=True,
        nullable=False,
        unique=True,
        default=uuid.uuid4,
        server_default=text("uuidv4()"),
    )
    name = Column(String, index=True, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)  # Indexed for login
    password_hash = Column(String, nullable=False)  # Never store plain text - always hash
    created_at = Column(
        TIMESTAMP(timezone=True),
        nullable=False,
        server_default=text("now()"),
    )


class Blogs(Base):
    """Blogs table with UUID primary key, foreign key to Users, and timestamps"""
    __tablename__ = "blogs"

    id = Column(
        UUID,
        primary_key=True,
        index=True,
        nullable=False,
        unique=True,
        default=uuid.uuid4(),
    )
    title = Column(String, index=True, nullable=False)
    content = Column(String, nullable=False)
    author_id = Column(UUID, nullable=False)
    created_at = Column(
        TIMESTAMP(timezone=True), nullable=False, default=datetime.now()
    )
    updated_at = Column(
        TIMESTAMP(timezone=True),
        nullable=False,
        default=datetime.now(),
        onupdate=datetime.now(),
    )


