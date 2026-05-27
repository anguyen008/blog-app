# Authentication endpoints - demonstrates: login, password verification, JWT token generation

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import text
from .. import schemas, utils, database, oauth2
from fastapi.security import OAuth2PasswordRequestForm

# Router for auth endpoints
router = APIRouter(tags=["Authentication"])


@router.post("/login", response_model=schemas.Token)
def login(
    users_credientials: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(database.get_db),
):
    """Login endpoint - demonstrates: password verification, JWT token generation"""
    
    # Query user by email (username field from form)
    user = db.execute(
        text("SELECT * FROM users WHERE email == :email"),
        {":email": users_credientials.username},
    ).fetchone()

    if not user:
        raise HTTPException(status_code=403, detail=f"Invalid email or password")

    # Verify provided password matches hash in database
    if not utils.verify_password(users_credientials.password, user.password):
        raise HTTPException(status_code=403, detail=f"Invalid email or password")

    # Create JWT token containing user_id
    access_token = oauth2.create_access_token(data={"user_id": str(user.id)})

    return {"access_token": access_token, "token_type": "bearer"}
