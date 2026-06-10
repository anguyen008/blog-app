# SQLAlchemy ORM models representing database tables
from sqlalchemy.orm import relationship, column_property
from .database import Base
from sqlalchemy import Column, ForeignKey, String, UUID, text, func, select
import uuid
from sqlalchemy.sql.sqltypes import TIMESTAMP
from sqlalchemy.dialects.postgresql import UUID


class User(Base):
    """Users table with UUID primary key and authentication fields"""

    __tablename__ = "users"

    # UUID better than auto-increment: doesn't reveal record count, safer for distributed systems
    user_id = Column(
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
    password_hash = Column(
        String, nullable=False
    )  # Never store plain text - always hash
    created_at = Column(
        TIMESTAMP(timezone=True),
        nullable=False,
        server_default=text("now()"),
    )


class Blog(Base):
    """Blogs table with UUID primary key, foreign key to Users, and timestamps"""

    __tablename__ = "blogs"

    blog_id = Column(
        UUID(as_uuid=True),
        primary_key=True,
        index=True,
        nullable=False,
        unique=True,
        default=uuid.uuid4,
        server_default=text("uuidv4()"),
    )
    title = Column(String, index=True, nullable=False)
    tagline = Column(String, nullable=True)
    about = Column(String, nullable=True)
    author_id = Column(
        UUID, ForeignKey("users.user_id", ondelete="CASCADE"), nullable=False
    )  # Foreign key to Users
    created_at = Column(
        TIMESTAMP(timezone=True), nullable=False, server_default=text("now()")
    )
    updated_at = Column(
        TIMESTAMP(timezone=True),
        nullable=False,
        server_default=text("now()"),
        onupdate=text("now()"),
    )

    author = relationship("User", backref="blogs")  # ORM relationship to Users


class Post(Base):
    """Posts table with UUID primary key, foreign key to Blogs, and timestamps"""

    __tablename__ = "posts"

    post_id = Column(
        UUID(as_uuid=True),
        primary_key=True,
        index=True,
        nullable=False,
        unique=True,
        default=uuid.uuid4,
        server_default=text("uuidv4()"),
    )
    title = Column(String, index=True, nullable=False)
    content = Column(String, nullable=False)
    published = Column(String, nullable=False, default="false")
    author_id = Column(
        UUID, ForeignKey("users.user_id", ondelete="CASCADE"), nullable=False
    )  # Foreign key to Blogs
    blog_id = Column(
        UUID, ForeignKey("blogs.blog_id", ondelete="CASCADE"), nullable=False
    )  # Foreign key to Blogs
    created_at = Column(
        TIMESTAMP(timezone=True), nullable=False, server_default=text("now()")
    )
    updated_at = Column(
        TIMESTAMP(timezone=True),
        nullable=False,
        server_default=text("now()"),
        onupdate=text("now()"),
    )

    blog = relationship("Blog", backref="posts")  # ORM relationship to Blogs
    author = relationship("User", backref="posts")


Blog.number_of_posts = column_property(
    select(func.count(Post.post_id))
    .where(Post.blog_id == Blog.blog_id)
    .correlate_except(Post)
    .scalar_subquery()
)
