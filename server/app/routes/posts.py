from ast import stmt

from fastapi import Depends, HTTPException, status, Response, APIRouter
from .. import models, schemas, utils, oauth2
from sqlalchemy.orm import Session
from sqlalchemy import select, text
from ..database import get_db
import uuid
from typing import List

router = APIRouter(prefix="/posts", tags=["Posts"])


@router.get("/{post_id}", response_model=schemas.PostResponse)
def read_post(
    post_id: uuid.UUID,
    db: Session = Depends(get_db),
):
    """Retrieve specific post by ID. Demonstrates ORM query"""

    post = db.query(models.Post).filter(models.Post.post_id == post_id).first()
    if post is None:
        raise HTTPException(
            status_code=404, detail=f"Post with uuid {post_id} not found"
        )
    return post


@router.post(
    "/",
    response_model=schemas.PostResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_post(
    post: schemas.PostCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(oauth2.get_current_user),
):
    """Create new post - demonstrates: SQL insert, transaction commit"""

    blog = db.query(models.Blog).filter(models.Blog.blog_id == post.blog_id).first()
    if not blog:
        raise HTTPException(
            status_code=404, detail=f"Blog with uuid {post.blog_id} not found"
        )
    if str(blog.author_id) != str(current_user.user_id):
        raise HTTPException(
            status_code=403, detail=f"Not authorized to create post for this blog"
        )

    create_post_query = models.Post(**post.model_dump())

    if create_post_query is None:
        raise HTTPException(status_code=400, detail="Failed to create post")

    db.add(create_post_query)
    # Commit writes changes to database
    db.commit()
    db.refresh(create_post_query)

    return create_post_query


@router.delete("/{post_id}")
def delete_post(
    post_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(oauth2.get_current_user),
):
    """Delete post by ID - demonstrates: SQL delete, transaction commit"""

    post = db.query(models.Post).filter(models.Post.post_id == post_id).first()

    if post is None:
        raise HTTPException(
            status_code=404, detail=f"Post with uuid {post_id} not found"
        )

    if str(post.blog.author_id) != str(current_user.user_id):
        raise HTTPException(
            status_code=403, detail=f"Not authorized to delete this post"
        )

    db.delete(post)
    db.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.put("/{post_id}", response_model=schemas.PostResponse)
def update_post(
    post_id: uuid.UUID,
    updated_post: schemas.PostCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(oauth2.get_current_user),
):
    """Update post by ID - demonstrates: SQL update, transaction commit"""

    post = db.query(models.Post).filter(models.Post.post_id == post_id).first()
    if not post or not post.blog:
        raise HTTPException(
            status_code=404, detail=f"Post with uuid {post_id} not found"
        )
    if str(post.blog.author_id) != str(current_user.user_id):
        raise HTTPException(
            status_code=403, detail="Not authorized to update this post"
        )

    # 1. Update the fetched ORM object directly using a dictionary
    update_data = updated_post.model_dump(
        exclude_unset=True
    )  # or updated_post.dict() in Pydantic v1
    for key, value in update_data.items():
        setattr(post, key, value)

    # 2. Save and lock the changes into the database
    db.commit()
    db.refresh(post)

    # 3. Return the actual ORM object
    return post
