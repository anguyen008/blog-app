from fastapi.testclient import TestClient
import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app import models
from app.main import app
from app.config import settings
from app.database import Base, get_db
from app.oauth2 import create_access_token

# Creating Testing Database
SQLALCHEMY_DATABASE_URL = f"postgresql+psycopg://{settings.database_user}:{settings.database_password}@{settings.database_host}:{settings.database_port}/{settings.database_name}_test"

# Engine manages connection pooling and SQL execution
engine = create_engine(SQLALCHEMY_DATABASE_URL)

# Session factory creates DB sessions for each request
TestingSessionLocal = sessionmaker(autoflush=False, bind=engine, autocommit=False)


@pytest.fixture()
def session():
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()


@pytest.fixture()
def client(session):
    def override_get_db():

        try:
            yield session
        finally:
            session.close()

    app.dependency_overrides[get_db] = override_get_db
    yield TestClient(app)


@pytest.fixture()
def test_user(client):
    user_info = {"name": "string", "email": "test@gmail.com", "password": "test123"}
    res = client.post("/users/", json=user_info)
    assert res.status_code == 201
    new_user = res.json()
    new_user["password"] = user_info["password"]
    return new_user


@pytest.fixture()
def other_test_user(client):
    response = client.post(
        "/users/",
        json={
            "name": "Other user",
            "email": "other@example.com",
            "password": "test123",
        },
    )
    assert response.status_code == 201
    user = response.json()
    user["password"] = "test123"
    return user


@pytest.fixture()
def token(test_user):
    return create_access_token({"user_id": test_user["user_id"]})


@pytest.fixture()
def authorized_client(client, token):
    client.headers = {**client.headers, "Authorization": f"Bearer {token}"}

    return client


@pytest.fixture()
def test_blogs(session, test_user):
    blogs_data = [
        {
            "title": "Complete blog",
            "tagline": "A complete tagline",
            "about": "A complete about section",
            "author_id": test_user["user_id"],
        },
        {
            "title": "No tagline blog",
            "about": "This blog has no tagline",
            "author_id": test_user["user_id"],
        },
        {
            "title": "No about blog",
            "tagline": "This blog has no about section",
            "author_id": test_user["user_id"],
        },
        {"title": "Title only blog", "author_id": test_user["user_id"]},
        {
            "title": "Empty tagline blog",
            "tagline": None,
            "about": "About content",
            "author_id": test_user["user_id"],
        },
        {
            "title": "Empty about blog",
            "tagline": "Tagline content",
            "about": None,
            "author_id": test_user["user_id"],
        },
    ]

    blogs = [models.Blog(**blog) for blog in blogs_data]

    session.add_all(blogs)
    session.commit()
    return blogs


@pytest.fixture()
def test_posts(session, test_user, test_blogs):
    posts_data = [
        {
            "title": "Published post",
            "content": "Published content",
            "published": True,
            "blog_id": test_blogs[0].blog_id,
        },
        {
            "title": "Draft post",
            "content": "Draft content",
            "published": False,
            "blog_id": test_blogs[0].blog_id,
        },
        {
            "title": "Second blog post",
            "content": "Second blog content",
            "published": True,
            "blog_id": test_blogs[1].blog_id,
        },
    ]

    posts = [models.Post(**post, author_id=test_user["user_id"]) for post in posts_data]

    session.add_all(posts)
    session.commit()
    return posts
