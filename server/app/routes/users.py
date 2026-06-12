# User CRUD endpoints
# Demonstrates: routing, dependency injection, database operations, error handling

from fastapi import Depends, HTTPException, status, Response, APIRouter
from sqlalchemy import exc, update
from .. import models, schemas, utils, oauth2
from sqlalchemy.orm import Session
from sqlalchemy import text
from ..database import get_db
import uuid
from typing import List

# Router groups user endpoints with /users prefix
router = APIRouter(prefix="/users", tags=["Users"])


@router.get("/", response_model=List[schemas.UserResponse])
def get_users(db: Session = Depends(get_db)):
    """Retrieve all users. Demonstrates: ORM query, response model serialization"""
    users = db.query(models.User).all()
    return users


@router.get("/{user_id}", response_model=schemas.UserResponse)
def read_user(
    user_id: uuid.UUID,
    db: Session = Depends(get_db),
):
    """Retrieve specific user by ID. Demonstrates ORM query"""

    user = db.query(models.User).filter(models.User.user_id == user_id).first()

    if user is None:
        raise HTTPException(
            status_code=404, detail=f"User with uuid {user_id} not found"
        )
    return user


@router.post(
    "/", response_model=schemas.UserResponse, status_code=status.HTTP_201_CREATED
)
def create_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
    """Create new user - demonstrates: password hashing, SQL insert, transaction commit"""

    # Hash password before storing (critical security practice)
    password_hash = utils.hash_password(user.password)

    try:

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
    except exc.IntegrityError:
        raise HTTPException(
            status_code=409, detail="That email is taken. Sign in to you account."
        )
    new_user = create_user_query.fetchone()
    if new_user is None:
        raise HTTPException(status_code=400, detail="Failed to create user")

    # Commit writes changes to database
    db.commit()
    # Expire refreshes cached instances from database
    db.expire_all()
    return new_user


@router.delete("/{user_id}")
def delete_user(
    user_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: schemas.TokenData = Depends(oauth2.get_current_user),
):
    """Delete user by ID - demonstrates: SQL delete, 204 response (no content)"""

    user = db.execute(
        text("SELECT * FROM users WHERE user_id = :user_id"),
        {"user_id": user_id},
    ).fetchone()
    if user is None:
        raise HTTPException(
            status_code=404, detail=f"User with uuid {user_id} not found"
        )

    if str(user.user_id) != str(current_user.user_id):
        raise HTTPException(
            status_code=403, detail=f"Not authorized to delete this user"
        )

    db.execute(
        text("DELETE FROM users WHERE user_id = :user_id"),
        {"user_id": user_id},
    )

    db.commit()
    # 204 No Content - successful delete with no response body
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.patch("/{user_id}/profile", response_model=schemas.UserResponse)
def update_user_profile(
    user_id: uuid.UUID,
    user_update: schemas.UserUpdateProfile,
    db: Session = Depends(get_db),
    current_user: schemas.TokenData = Depends(oauth2.get_current_user),
):
    user_query = db.query(models.User).filter(models.User.user_id == user_id)
    user = user_query.first()

    if user is None:
        raise HTTPException(
            status_code=404, detail=f"User with uuid {user_id} not found"
        )

    if str(user.user_id) != str(current_user.user_id):
        raise HTTPException(status_code=403, detail="Not authorized to change profile")

    update_query = (
        update(models.User)
        .where(models.User.user_id == user_id)
        .values(**user_update.model_dump())
        .execution_options(synchronize_session=False)
    )
    db.execute(update_query)
    db.commit()

    return user


@router.patch("/{user_id}/password")
def update_password(
    user_id: uuid.UUID,
    update_password: schemas.UserUpdatePassword,
    db: Session = Depends(get_db),
    current_user: schemas.TokenData = Depends(oauth2.get_current_user),
):
    user_query = db.query(models.User).filter(models.User.user_id == user_id)
    user = user_query.first()

    if user is None:
        raise HTTPException(
            status_code=404, detail=f"User with uuid {user_id} not found"
        )

    if str(user.user_id) != str(current_user.user_id):
        raise HTTPException(status_code=403, detail="Not authorized to change password")

    verify_password = utils.verify_password(
        update_password.old_password, str(user.password_hash)
    )

    if not verify_password:
        raise HTTPException(status_code=401, detail="Incorrect old password")

    new_hash_password = utils.hash_password(update_password.new_password)

    update_query = (
        update(models.User)
        .where(models.User.user_id == user_id)
        .values(password_hash=new_hash_password)
        .execution_options(synchronize_session=False)
    )
    db.execute(update_query)
    db.commit()

    return {"message": "Passsword Updated Successfully"}
