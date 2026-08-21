from fastapi import Depends, HTTPException, status, Response, APIRouter
from .. import models, schemas, oauth2
from sqlalchemy.orm import Session, joinedload
from ..database import get_db
import uuid
from typing import List, Optional

router = APIRouter(prefix="/posts", tags=["Posts"])


@router.get("/public", response_model=List[schemas.PostResponse])
def get_visible_posts(
    blog_id: Optional[uuid.UUID] = None,
    db: Session = Depends(get_db),
):
    # This single query enforces your exact rules:
    # 1. PostModel.is_published == True -> Anyone can see these
    # 2. PostModel.owner_id == current_user.id -> Only the creator can see these if unpublished
    posts = (
        db.query(models.Post)
        .options(joinedload(models.Post.blog), joinedload(models.Post.author))
        .filter(models.Post.published == True)
    )
    if blog_id:
        posts = posts.filter(models.Post.blog_id == blog_id)

    return posts.all()


@router.get("/{post_id}/public", response_model=schemas.PostResponse)
def get_public_post(
    post_id: uuid.UUID,
    db: Session = Depends(get_db),
):
    """Retrieve specific public post by ID. Demonstrates ORM query"""

    post = (
        db.query(models.Post)
        .options(joinedload(models.Post.blog), joinedload(models.Post.author))
        .filter(models.Post.post_id == post_id, models.Post.published == True)
        .first()
    )
    if post is None:
        raise HTTPException(
            status_code=404, detail=f"Post with uuid {post_id} not found"
        )

    return post


@router.get("/{post_id}", response_model=schemas.PostResponse)
def get_my_post(
    post_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(oauth2.get_current_user),
):
    """Retrieve specific public/private post by ID. Demonstrates ORM query"""

    post = (
        db.query(models.Post)
        .options(joinedload(models.Post.blog), joinedload(models.Post.author))
        .filter(models.Post.post_id == post_id)
        .first()
    )
    if post is None:
        raise HTTPException(
            status_code=404, detail=f"Post with uuid {post_id} not found"
        )

    if str(post.blog.author_id) != str(current_user.user_id):
        raise HTTPException(
            status_code=403, detail=f"Not authorized to view post for this blog"
        )
    return post


@router.get("/{blog_id}/blog", response_model=List[schemas.PostResponse])
def get_my_blog_posts(
    blog_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(oauth2.get_current_user),
):
    """Retrieve all posts of a blog both published and unpublished. Demonstrates: ORM query, response model serialization"""
    blog = (
        db.query(models.Blog)
        .filter(
            models.Blog.blog_id == blog_id,
            models.Blog.author_id == current_user.user_id,
        )
        .first()
    )
    if not blog:
        raise HTTPException(
            status_code=401,
            detail=f"Blog with id {blog_id} you don't have access",
        )

    posts = (
        db.query(models.Post)
        .filter(models.Post.blog_id == blog_id)
        .options(
            joinedload(models.Post.author),
            joinedload(models.Post.blog),
        )
        .all()
    )
    return posts


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

    create_post_query = models.Post(**post.model_dump(), author_id=current_user.user_id)

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
