import uuid
import pytest

from app import schemas
from app.oauth2 import create_access_token


def test_create_blog(authorized_client):
    res = authorized_client.post(
        "/blogs/",
        json={
            "title": "Test blog",
            "tagline": "A test blog",
            "about": "Testing",
        },
    )
    assert res.status_code == 201
    assert res.json()["title"] == "Test blog"
    assert res.json()["tagline"] == "A test blog"
    assert res.json()["about"] == "Testing"


def test_get_blogs_returns_created_blogs(client, test_blogs):
    res = client.get("/blogs/")
    assert res.status_code == 200
    assert len(test_blogs) == len(res.json())


def test_read_blog_returns_blog(authorized_client, client):
    blog = authorized_client.post(
        "/blogs/",
        json={
            "title": "Test blog",
            "tagline": "A test blog",
            "about": "Testing",
        },
    )
    assert blog.status_code == 201

    res = client.get(f"/blogs/{blog.json()['blog_id']}/public")
    assert res.status_code == 200
    assert res.json()["title"] == "Test blog"
    assert res.json()["tagline"] == "A test blog"
    assert res.json()["about"] == "Testing"


def test_read_blog_returns_404_for_missing_blog(client):
    blog_id = uuid.uuid4()
    response = client.get(f"/blogs/{blog_id}/public")
    assert response.status_code == 404
    assert response.json()["detail"] == f"Blog with uuid {blog_id} not found"  ##


def test_get_user_blogs_returns_requested_users_blogs(client, test_user, test_blogs):
    response = client.get(f"/blogs/{test_user['user_id']}/user")

    assert response.status_code == 200
    assert len(response.json()) == len(test_blogs)
    assert {blog["title"] for blog in response.json()} == {
        "Complete blog",
        "No tagline blog",
        "No about blog",
        "Title only blog",
        "Empty tagline blog",
        "Empty about blog",
    }


def test_get_user_blogs_returns_empty_list_for_user_without_blogs(
    client, other_test_user
):
    response = client.get(f"/blogs/{other_test_user['user_id']}/user")

    assert response.status_code == 200
    assert response.json() == []


def test_create_blog_requires_authentication(client):
    response = client.post(
        "/blogs/",
        json={
            "title": "Complete blog",
            "tagline": "A complete tagline",
            "about": "A complete about section",
        },
    )
    assert response.status_code == 401


def test_update_blog(authorized_client, test_blogs):
    blog_id = str(test_blogs[0].blog_id)

    response = authorized_client.put(
        f"/blogs/{blog_id}",
        json={
            "title": "Updated blog",
            "tagline": None,
            "about": "Updated about",
        },
    )

    assert response.status_code == 200

    updated_blog = response.json()
    assert updated_blog["title"] == "Updated blog"
    assert updated_blog["tagline"] is None
    assert updated_blog["about"] == "Updated about"


def test_update_blog_rejects_non_owner(client, test_blogs):
    blog = test_blogs[0]
    blog_id = str(blog.blog_id)
    res = client.put(
        f"/blogs/{blog_id}",
        json={
            "title": "Updated blog",
            "tagline": None,
            "about": "Updated about",
        },
    )
    assert res.status_code == 401
    assert blog.title is not "Updated blog"
    assert blog.tagline is not None
    assert blog.about is not "Updated about"


def test_delete_blog(authorized_client, client, test_blogs):
    blog_id = str(test_blogs[0].blog_id)

    response = authorized_client.delete(f"/blogs/{blog_id}")

    assert response.status_code == 204

    deleted_blog = client.get(f"/blogs/{blog_id}/public")
    assert deleted_blog.status_code == 404


def test_delete_blog_rejects_non_owner(client, test_blogs):
    blog_id = str(test_blogs[0].blog_id)
    response = client.delete(f"/blogs/{blog_id}")
    assert response.status_code == 401
