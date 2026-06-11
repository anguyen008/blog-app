# Pydantic models for request/response validation and serialization
# Inherit base models to reduce duplication across operations

from pydantic import BaseModel, EmailStr, ConfigDict
from datetime import datetime
import uuid


class UserBase(BaseModel):
    """Shared fields between Create/Update/Response models"""

    name: str
    email: EmailStr  # Built-in validation for valid email format


class UserCreate(UserBase):
    """Schema for POST /users endpoint"""

    password: str


class UserUpdate(UserBase):
    """Schema for PUT /users/{id} endpoint"""

    password: str


class UserResponse(UserBase):
    """Schema for GET endpoints - includes DB-generated fields, excludes password"""

    model_config = ConfigDict(from_attributes=True)
    user_id: uuid.UUID
    created_at: datetime


class UserLogin(BaseModel):
    """Schema for POST /login endpoint"""

    email: EmailStr
    password: str


class Token(BaseModel):
    """Schema for login response - contains JWT token"""

    access_token: str
    token_type: str


class TokenData(BaseModel):
    """Decoded token data from verified JWT"""

    user_id: uuid.UUID


class BlogBase(BaseModel):
    """Shared fields between Create/Response models"""

    title: str
    tagline: str | None = None
    about: str | None = None


class BlogCreate(BlogBase):
    """Schema for POST /blogs endpoint"""

    pass


class BlogResponse(BlogBase):
    """Schema for GET endpoints - includes DB-generated fields"""

    model_config = ConfigDict(from_attributes=True)
    blog_id: uuid.UUID
    created_at: datetime
    number_of_posts: int
    author: UserResponse


class PostBase(BaseModel):
    """Shared fields between Create/Response models"""

    blog_id: uuid.UUID | None = None
    title: str
    content: str
    published: bool = False


class PostCreate(PostBase):
    """Schema for POST /posts endpoint"""

    pass


class PostResponse(PostBase):
    """Schema for GET endpoints - includes DB-generated fields"""

    model_config = ConfigDict(from_attributes=True)
    post_id: uuid.UUID
    created_at: datetime
    blog: BlogResponse
    author: UserResponse
