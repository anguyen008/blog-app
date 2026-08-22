import uuid

from app import models


def test_create_post(authorized_client, test_blogs):
    response = authorized_client.post(
        "/posts/",
        json={
            "blog_id": str(test_blogs[0].blog_id),
            "title": "Created post",
            "content": "Created content",
            "published": True,
        },
    )

    assert response.status_code == 201
    assert response.json()["title"] == "Created post"
    assert response.json()["published"] is True


def test_create_post_requires_authentication(client, test_blogs):
    response = client.post(
        "/posts/",
        json={
            "blog_id": str(test_blogs[0].blog_id),
            "title": "Unauthorized post",
            "content": "Unauthorized content",
        },
    )

    assert response.status_code == 401


def test_create_post_rejects_missing_blog(authorized_client):
    blog_id = uuid.uuid4()

    response = authorized_client.post(
        "/posts/",
        json={
            "blog_id": str(blog_id),
            "title": "Missing blog post",
            "content": "Missing blog content",
        },
    )

    assert response.status_code == 404


def test_get_visible_posts_returns_only_published_posts(client, test_posts, session):
    res = client.get("/posts/public")
    assert res.status_code == 200
    assert len(res.json()) == 2
    published_posts = list(
        session.query(models.Post).filter(models.Post.published == True).all()
    )
    for i in range(len(published_posts)):
        assert res.json()[i]["title"] == published_posts[i].title


def test_get_public_post_hides_unpublished_post(client, test_posts):
    draft_id = str(test_posts[1].post_id)

    response = client.get(f"/posts/{draft_id}/public")

    assert response.status_code == 404


def test_get_my_blog_posts_returns_all_posts(authorized_client, test_blogs, test_posts):
    blog_id = str(test_blogs[0].blog_id)

    response = authorized_client.get(f"/posts/{blog_id}/blog")

    assert response.status_code == 200
    assert len(response.json()) == 2

    assert {post["title"] for post in response.json()} == {
        "Published post",
        "Draft post",
    }


def test_read_post_returns_private_post_to_blog_owner(authorized_client, test_posts):
    post_id = str(test_posts[1].post_id)

    response = authorized_client.get(f"/posts/{post_id}")

    assert response.status_code == 200
    assert response.json()["title"] == "Draft post"


def test_read_post_returns_auth_error(client, test_posts):
    post_id = str(test_posts[1].post_id)

    res = client.get(f"/posts/{post_id}")

    assert res.status_code == 401


def test_update_post_updates_owned_post(authorized_client, test_posts):
    post_id = str(test_posts[0].post_id)

    response = authorized_client.put(
        f"/posts/{post_id}",
        json={
            "blog_id": str(test_posts[0].blog_id),
            "title": "Updated post",
            "content": "Updated content",
            "published": False,
        },
    )

    assert response.status_code == 200
    assert response.json()["title"] == "Updated post"
    assert response.json()["content"] == "Updated content"
    assert response.json()["published"] is False


def test_update_post_updates_unowned_post(client, test_posts):
    post_id = str(test_posts[0].post_id)

    res = client.put(
        f"/posts/{post_id}",
        json={
            "blog_id": str(test_posts[0].blog_id),
            "title": "Updated post",
            "content": "Updated content",
            "published": False,
        },
    )
    assert res.status_code == 401
    assert test_posts[0].title is not "Updated post"
    assert test_posts[0].content is not "Updated Content"


def test_delete_post_deletes_owned_post(authorized_client, client, test_posts):
    post_id = str(test_posts[0].post_id)

    response = authorized_client.delete(f"/posts/{post_id}")

    assert response.status_code == 204
    assert client.get(f"/posts/{post_id}/public").status_code == 404


def test_delete_post_deletes_unowned_post(client, test_posts):
    post_id = str(test_posts[0].post_id)

    response = client.delete(f"/posts/{post_id}")

    assert response.status_code == 401
