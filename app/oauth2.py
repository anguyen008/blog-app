# JWT token-based authentication with OAuth2
# Provides stateless auth: server verifies token signature instead of storing sessions

import jwt
from datetime import datetime, timedelta, timezone
from typing import Optional
from . import schemas
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer

# OAuth2 scheme with token URL - tells FastAPI to expect "Authorization: Bearer <token>"
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")

# JWT configuration (use environment variables in production)
SECRET_KEY = "your_secret_key_here"  # Replace with a secure random key in production
ALGORITHM = "Algorithm"  # Symmetric algorithm: same key signs and verifies
ACCESS_TOKEN_EXPIRE_MINUTES = 10  # Token expiration time (e.g., 30 minutes)


def create_access_token(data: dict, expires_delta: int = ACCESS_TOKEN_EXPIRE_MINUTES):
    """
    Create JWT token. JWT structure: header.payload.signature
    - Signature proves token hasn't been tampered with
    - Contains user_id and expiration (exp) claim
    """
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(minutes=expires_delta)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

    return encoded_jwt


def verify_access_token(token: str, credentials_exception):
    """
    Verify JWT token validity.
    jwt.decode automatically checks:
    - Signature hasn't been tampered with
    - Token hasn't expired
    """
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: Optional[str] = payload.get("user_id")

        if user_id is None:
            raise credentials_exception

        token_data = schemas.TokenData(user_id=user_id)
    except jwt.ExpiredSignatureError:
        raise credentials_exception
    except jwt.InvalidTokenError:
        raise credentials_exception

    return token_data


def get_current_user(token: str = Depends(oauth2_scheme)):
    """
    Dependency to get authenticated user from Authorization header token.
    Use in protected routes: Depends(get_current_user)
    Returns TokenData with user_id, raises 401 if invalid.
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    return verify_access_token(token, credentials_exception)
