from datetime import datetime, timedelta, timezone
from uuid import UUID, uuid4
import jwt
import pytest
from fastapi import HTTPException, status
import pytest
from app import oauth2, schemas
from app.utils import hash_password, verify_password


def test_password_hashes_and_verifies():
    password = "StrongPassword123!"
    hashed = hash_password(password)

    assert isinstance(hashed, str)
    assert hashed != password
    assert verify_password(password, hashed) is True
    assert verify_password("WrongPassword123!", hashed) is False


def test_access_token_includes_correct_payload():
    user_id = str(uuid4())
    token = oauth2.create_access_token({"user_id": user_id})
    payload = jwt.decode(token, oauth2.SECRET_KEY, algorithms=[oauth2.ALGORITHM])
    assert payload["user_id"] == user_id
    assert payload["type"] == "access"
    assert payload["exp"] > int(datetime.now(timezone.utc).timestamp())


def test_refresh_token_includes_correct_payload():
    user_id = str(uuid4())
    token = oauth2.create_refresh_token({"user_id": user_id}, expires_delta=1)
    payload = jwt.decode(token, oauth2.SECRET_KEY, algorithms=[oauth2.ALGORITHM])

    assert payload["user_id"] == user_id
    assert payload["type"] == "refresh"
    assert payload["exp"] > int(datetime.now(timezone.utc).timestamp())


def test_get_current_user_returns_valid_access_token_data():
    user_id = str(uuid4())
    token = oauth2.create_access_token({"user_id": user_id})

    current_user = oauth2.get_current_user(token=token)

    assert isinstance(current_user, schemas.TokenData)
    assert current_user.user_id == UUID(user_id)


def test_get_current_user_rejects_invalid_token():
    user_id = str(uuid4())
    refresh_token = oauth2.create_refresh_token({"user_id": user_id})
    access_token = oauth2.create_access_token({"user_id": user_id})
    token_without_user = oauth2.create_access_token({"sub": "not-user-id"})

    with pytest.raises(HTTPException):
        oauth2.get_current_user(token=token_without_user)
    with pytest.raises(HTTPException):
        oauth2.get_current_user(token=refresh_token)
    with pytest.raises(HTTPException):
        oauth2.get_current_user(token=access_token, expected_type="refresh")


def test_get_current_user_rejects_expired_tokens():
    expired_token = jwt.encode(
        {
            "user_id": str(uuid4()),
            "type": "access",
            "exp": int((datetime.now(timezone.utc) - timedelta(minutes=1)).timestamp()),
        },
        oauth2.SECRET_KEY,
        algorithm=oauth2.ALGORITHM,
    )

    with pytest.raises(HTTPException):
        oauth2.get_current_user(expired_token)
