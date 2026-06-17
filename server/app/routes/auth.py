# Authentication endpoints - demonstrates: login, password verification, JWT token generation

from fastapi import APIRouter, Depends, HTTPException, Response, Cookie
from sqlalchemy.orm import Session
from sqlalchemy import text
from .. import schemas, utils, database, oauth2
from fastapi.security import OAuth2PasswordRequestForm

# Router for auth endpoints
router = APIRouter(tags=["Authentication"])


@router.post("/login", response_model=schemas.Token)
def login(
    response: Response,
    users_credientials: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(database.get_db),
):
    """Login endpoint - demonstrates: password verification, JWT token generation"""

    # Query user by email (username field from form)
    user = db.execute(
        text("SELECT * FROM users WHERE email = :email"),
        {"email": users_credientials.username},
    ).fetchone()
    if not user:
        raise HTTPException(status_code=403, detail=f"Invalid email or password")

    # Verify provided password matches hash in database
    if not utils.verify_password(users_credientials.password, user.password_hash):
        raise HTTPException(status_code=403, detail=f"Invalid email or password")

    # Create JWT token containing user_id
    access_token = oauth2.create_access_token(data={"user_id": str(user.user_id)})
    refresh_token = oauth2.create_refresh_token(data={"user_id": str(user.user_id)})

    response.set_cookie(
        key="refresh_token",
        value=refresh_token,
        httponly=True,
        secure=True,
        samesite="lax",
        max_age=604800,
        path="/",
    )

    response.set_cookie(
        key="is_logged_in",
        value="false",
        httponly=False,
        secure=False,
        samesite="lax",
        max_age=604800,
        path="/",
    )

    return {
        "access_token": access_token,
        "token_type": "bearer",
    }


@router.post("/refresh", response_model=schemas.Token)
def refresh(
    refresh_token: str = Cookie(None),
):
    """Refresh endpoint - demonstrates: Refresh token verfication, JWT token generation"""

    if not refresh_token:
        raise HTTPException(status_code=401, detail="No refresh token found")

    token_data = oauth2.get_current_user(refresh_token)

    new_access_token = oauth2.create_access_token(
        data={"user_id": str(token_data.user_id)}
    )

    return {"access_token": new_access_token, "token_type": "bearer"}


@router.post("/logout")
def logout(response: Response):
    response.delete_cookie("refresh_token")
    response.delete_cookie("is_logged_in")

    return {"message": "Logged out succesfully"}


@router.get("/verify-user")
def verfiy_user(current_user: schemas.TokenData = Depends(oauth2.get_current_user)):
    return current_user
