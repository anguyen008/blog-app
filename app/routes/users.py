# User CRUD endpoints
# Demonstrates: routing, dependency injection, database operations, error handling

from fastapi import Depends, HTTPException, status, Response, FastAPI, APIRouter
from .. import models, schemas, utils
from sqlalchemy.orm import Session
from sqlalchemy import text
from ..database import get_db
import uuid
from typing import List

# Router groups user endpoints with /users prefix
router = APIRouter(prefix="/users", tags=["Users"])


@router.get("/", response_model=List[schemas.UserResponse])
def get_users(db: Session = Depends(get_db)):
    """Retrieve all users"""
    users = db.execute(text("SELECT * FROM users")).fetchall()
    return users


@router.get("/{user_id}", response_model=schemas.UserResponse)
def read_user(
    user_id: uuid.UUID,
    db: Session = Depends(get_db),
):
    """Retrieve specific user by ID - demonstrates ORM query"""
    user = db.query(models.Users).filter(models.Users.id == user_id).first()
    if user is None:
        raise HTTPException(status_code=404, detail=f"User with uuid {user_id} not found")
    return user


@router.post(
    "/users", response_model=schemas.UserResponse, status_code=status.HTTP_201_CREATED
)
def create_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
    """Create new user - demonstrates: password hashing, SQL insert, transaction commit"""
    # Hash password before storing (critical security practice)
    password_hash = utils.hash_password(user.password)

    create_user_query = db.execute(
        text(
            "INSERT INTO users (name, email, password_hash) VALUES (:name, :email, :password_hash) RETURNING *"
        ),
        {
            "name": user.name,
            "email": user.email,
            "password_hash": password_hash,
        },
    )
    new_user = create_user_query.mappings().fetchone()
    if new_user is None:
        raise HTTPException(status_code=400, detail="Failed to create user")

    # Commit writes changes to database
    db.commit()
    # Expire refreshes cached instances from database
    db.expire_all()
    return new_user


@router.delete("/{user_id}")
def delete_user(user_id: uuid.UUID, db: Session = Depends(get_db)):
    """Delete user by ID - demonstrates: SQL delete, 204 response (no content)"""
    delete_user_query = db.execute(
        text("DELETE FROM users WHERE id = :user_id RETURNING *"),
        {"user_id": user_id},
    )
    deleted_user = delete_user_query.mappings().fetchone()

    if deleted_user is None:
        raise HTTPException(
            status_code=404, detail=f"User with uuid {user_id} not found"
        )
    db.commit()
    # 204 No Content - successful delete with no response body
    return Response(status_code=status.HTTP_204_NO_CONTENT)


# Temporarily put request
@router.put("/{user_id}", response_model=schemas.UserResponse)
def update_user(
    user_id: uuid.UUID, user_update: schemas.UserUpdate, db: Session = Depends(get_db)
):
    """Update user fields - BUG: password not hashed on update! Should use utils.hash_password()"""
    update_user_query = db.execute(
        text(
            "UPDATE users SET name = :name, email = :email, password_hash = :password_hash WHERE id = :user_id RETURNING *"
        ),
        {
            "name": user_update.name,
            "email": user_update.email,
            "password_hash": user_update.password,  # BUG: Storing plain text instead of hash!
            "user_id": user_id,
        },
    )
    updated_user = update_user_query.mappings().fetchone()

    if updated_user is None:
        raise HTTPException(
            status_code=404, detail=f"User with uuid {user_id} not found"
        )
    db.commit()
    db.expire_all()
    return updated_user
