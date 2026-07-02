"""baseline_exiting_tables

Revision ID: cd8260a6b876
Revises:
Create Date: 2026-07-02 02:01:55.685751

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = "cd8260a6b876"
down_revision: Union[str, Sequence[str], None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.create_table(
        "users",
        sa.Column(
            "user_id", sa.UUID(), server_default=sa.text("(uuidv4())"), nullable=False
        ),
        sa.Column("name", sa.String(), nullable=False),
        sa.Column("email", sa.String(), nullable=False),
        sa.Column("password_hash", sa.String(), nullable=False),
        sa.Column(
            "created_at",
            sa.TIMESTAMP(timezone=True),
            server_default=sa.text("(now())"),
            nullable=False,
        ),
        sa.PrimaryKeyConstraint("user_id"),
    )
    op.create_index(op.f("ix_users_email"), "users", ["email"], unique=True)
    op.create_index(op.f("ix_users_name"), "users", ["name"], unique=False)
    op.create_index(op.f("ix_users_user_id"), "users", ["user_id"], unique=True)

    op.create_table(
        "blogs",
        sa.Column(
            "blog_id", sa.UUID(), server_default=sa.text("(uuidv4())"), nullable=False
        ),
        sa.Column("title", sa.String(length=70), nullable=False),
        sa.Column("tagline", sa.String(length=120), nullable=True),
        sa.Column("about", sa.String(length=350), nullable=True),
        sa.Column("author_id", sa.UUID(), nullable=False),
        sa.Column(
            "created_at",
            sa.TIMESTAMP(timezone=True),
            server_default=sa.text("(now())"),
            nullable=False,
        ),
        sa.Column(
            "updated_at",
            sa.TIMESTAMP(timezone=True),
            server_default=sa.text("(now())"),
            nullable=False,
        ),
        sa.ForeignKeyConstraint(["author_id"], ["users.user_id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("blog_id"),
    )
    op.create_index(op.f("ix_blogs_blog_id"), "blogs", ["blog_id"], unique=True)
    op.create_index(op.f("ix_blogs_title"), "blogs", ["title"], unique=False)

    op.create_table(
        "posts",
        sa.Column(
            "post_id", sa.UUID(), server_default=sa.text("(uuidv4())"), nullable=False
        ),
        sa.Column("title", sa.String(), nullable=False),
        sa.Column("content", sa.String(), nullable=False),
        sa.Column("published", sa.Boolean(), nullable=False),
        sa.Column("author_id", sa.UUID(), nullable=False),
        sa.Column("blog_id", sa.UUID(), nullable=False),
        sa.Column(
            "created_at",
            sa.TIMESTAMP(timezone=True),
            server_default=sa.text("(now())"),
            nullable=False,
        ),
        sa.Column(
            "updated_at",
            sa.TIMESTAMP(timezone=True),
            server_default=sa.text("(now())"),
            nullable=False,
        ),
        sa.ForeignKeyConstraint(["author_id"], ["users.user_id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["blog_id"], ["blogs.blog_id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("post_id"),
    )
    op.create_index(op.f("ix_posts_post_id"), "posts", ["post_id"], unique=True)
    op.create_index(op.f("ix_posts_title"), "posts", ["title"], unique=False)
    # ### end Alembic commands ###


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_index(op.f("ix_posts_title"), table_name="posts")
    op.drop_index(op.f("ix_posts_post_id"), table_name="posts")
    op.drop_table("posts")
    op.drop_index(op.f("ix_blogs_title"), table_name="blogs")
    op.drop_index(op.f("ix_blogs_blog_id"), table_name="blogs")
    op.drop_table("blogs")
    op.drop_index(op.f("ix_users_user_id"), table_name="users")
    op.drop_index(op.f("ix_users_name"), table_name="users")
    op.drop_index(op.f("ix_users_email"), table_name="users")
    op.drop_table("users")
    # ### end Alembic commands ###
