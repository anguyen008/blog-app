from fastapi import Depends, HTTPException, status, Response, APIRouter
from .. import models, schemas, oauth2
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import update, delete
from ..database import get_db
import uuid
from typing import List, Optional

# Router groups blog endpoints with /blogs prefix
router = APIRouter(prefix="/blogs", tags=["Blogs"])


@router.get("/public", response_model=List[schemas.BlogResponse])
def get_public_blogs(
    db: Session = Depends(get_db),
    user_id: Optional[uuid.UUID] = None,
):
    """Retrieve all blogs. Demonstrates: ORM query, response model serialization"""
    query = (
        db.query(models.Blog)
        .options(joinedload(models.Blog.author))
        .filter(models.Blog.is_published == True)
    )

    if user_id is not None:
        query = query.filter(models.Blog.author_id == user_id)
        if query is None:
            raise HTTPException(
                status_code=404, detail=f"User with uuid {user_id} not found"
            )

    blogs = query.all()
    return blogs


@router.get("/public/{blog_id}", response_model=schemas.BlogResponse)
def get_a_public_blog(
    blog_id: uuid.UUID,
    db: Session = Depends(get_db),
):
    """Retrieve a single blog by ID. Demonstrates: ORM query, response model serialization"""
    blog = (
        db.query(models.Blog)
        .options(joinedload(models.Blog.author))
        .filter(models.Blog.blog_id == blog_id, models.Blog.is_published == True)
        .first()
    )
    if blog is None:
        raise HTTPException(
            status_code=404, detail=f"Blog with uuid {blog_id} not found"
        )
    return blog


@router.get("/private", response_model=List[schemas.BlogResponse])
def get_user_blogs(
    db: Session = Depends(get_db),
    current_user: schemas.TokenData = Depends(oauth2.get_current_user),
):
    """Retrieve all private blogs for the authenticated user."""
    query = (
        db.query(models.Blog)
        .options(joinedload(models.Blog.author))
        .filter(
            models.Blog.author_id == current_user.user_id,
        )
    )
    if query is None:
        raise HTTPException(
            status_code=404, detail=f"User with uuid {current_user.user_id} not found"
        )
    blogs = query.all()
    return blogs


@router.get("/private/{blog_id}", response_model=schemas.BlogResponse)
def get_a_private_blog(
    blog_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: schemas.TokenData = Depends(oauth2.get_current_user),
):
    """Retrieve a single private blog by ID."""
    blog = (
        db.query(models.Blog)
        .options(joinedload(models.Blog.author))
        .filter(models.Blog.blog_id == blog_id)
        .first()
    )

    if blog is None:
        raise HTTPException(
            status_code=404, detail=f"Blog with uuid {blog_id} not found"
        )
    print(blog.author_id)
    if str(blog.author_id) != str(current_user.user_id):
        raise HTTPException(status_code=403, detail="Not authorized to view this blog")

    return blog


@router.post(
    "/", response_model=schemas.BlogResponse, status_code=status.HTTP_201_CREATED
)
def create_blog(
    blog: schemas.BlogCreate,
    db: Session = Depends(get_db),
    current_user: schemas.TokenData = Depends(oauth2.get_current_user),
):
    """Create new blog - demonstrates: SQL insert, transaction commit"""
    create_blog_query = models.Blog(**blog.model_dump(), author_id=current_user.user_id)

    if create_blog_query is None:
        raise HTTPException(status_code=400, detail="Failed to create blog")

    if str(create_blog_query.author_id) != str(current_user.user_id):
        raise HTTPException(
            status_code=403, detail=f"Not authorized to create blog for this user"
        )

    # Commit writes changes to database
    db.add(create_blog_query)
    db.commit()
    db.refresh(create_blog_query)

    return create_blog_query


@router.delete("/{blog_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_blog(
    blog_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: schemas.TokenData = Depends(oauth2.get_current_user),
):
    """Delete blog by ID - demonstrates: SQL delete, transaction commit"""

    blog = db.query(models.Blog).filter(models.Blog.blog_id == blog_id).first()

    if blog is None:
        raise HTTPException(
            status_code=404, detail=f"Blog with uuid {blog_id} not found"
        )

    # Only allow deletion if current user is the author
    if str(blog.author_id) != str(current_user.user_id):
        raise HTTPException(
            status_code=403, detail="Not authorized to delete this blog"
        )

    delete_query = delete(models.Blog).where(models.Blog.blog_id == blog_id)
    db.execute(delete_query)
    db.commit()

    return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.put("/{blog_id}", response_model=schemas.BlogResponse)
def update_blog(
    blog_id: uuid.UUID,
    updated_blog: schemas.BlogCreate,
    db: Session = Depends(get_db),
    current_user: schemas.TokenData = Depends(oauth2.get_current_user),
):
    """Update blog by ID - demonstrates: SQL update, transaction commit"""

    blog_query = db.query(models.Blog).filter(models.Blog.blog_id == blog_id)
    blog = blog_query.first()

    if blog is None:
        raise HTTPException(
            status_code=404, detail=f"Blog with uuid {blog_id} not found"
        )

    # Only allow update if current user is the author
    if str(blog.author_id) != str(current_user.user_id):
        raise HTTPException(
            status_code=403, detail="Not authorized to update this blog"
        )

    update_query = (
        update(models.Blog)
        .where(models.Blog.blog_id == blog_id)
        .values(**updated_blog.model_dump())
        .execution_options(synchronize_session=False)
    )
    db.execute(update_query)
    db.commit()

    return blog
