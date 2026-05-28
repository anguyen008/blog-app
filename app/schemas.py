# Pydantic models for request/response validation and serialization
# Inherit base models to reduce duplication across operations

from pydantic import BaseModel, EmailStr, ConfigDict
from datetime import datetime
import uuid
from typing import Optional


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
    id: uuid.UUID
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

    user_id: Optional[str] = None
