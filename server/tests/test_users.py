import uuid

from app import schemas
from app.oauth2 import create_access_token


def test_create_user(client):
    res = client.post(
        "/users/",
        json={"name": "string", "email": "user@example.com", "password": "string"},
    )

    new_user = schemas.UserResponse(**res.json())
    assert res.status_code == 201
    assert new_user.email == "user@example.com"
    assert new_user.name == "string"


def test_reject_duplicate_user_email(client, test_user):
    res = client.post(
        "/users/",
        json={
            "name": test_user["name"],
            "email": test_user["email"],
            "password": test_user["password"],
        },
    )
    assert res.status_code == 409


def test_read_auth_user(authorized_client, test_user):
    res = authorized_client.get(f"/users/{test_user['user_id']}")

    assert res.status_code == 200
    assert res.json()["user_id"] == test_user["user_id"]


def test_read_user_auth(client, test_user):
    res = client.get(f"/users/{test_user['user_id']}")
    assert res.status_code == 401


def test_read_user_rejects_invalid_auth(client, test_user):
    other_user = client.post(
        "/users/",
        json={"name": "hacker", "email": "hacker@example.com", "password": "hacker123"},
    )
    new_user = schemas.UserResponse(**other_user.json())
    token = create_access_token({"user_id": str(new_user.user_id)})

    client.headers = {**client.headers, "Authorization": f"Bearer{token}"}

    res = client.get(f"/users/{test_user['user_id']}")

    assert res.status_code == 401


def test_missing_user_error(authorized_client):
    user_id = uuid.uuid4()

    response = authorized_client.get(
        f"/users/{user_id}",
    )

    assert response.status_code == 404


def test_update_user_profile(authorized_client, test_user):
    res = authorized_client.patch(
        f"/users/{test_user['user_id']}/profile",
        json={
            "name": "Updated name",
            "email": "updated@example.com",
        },
    )

    assert res.status_code == 200
    assert res.json()["name"] == "Updated name"
    assert res.json()["email"] == "updated@example.com"


def test_update_password(client, authorized_client, test_user):
    res = authorized_client.patch(
        f"/users/{test_user['user_id']}/password",
        json={
            "old_password": test_user["password"],
            "new_password": "new-password",
        },
    )

    assert res.status_code == 200
    assert res.json() == {"message": "Passsword Updated Successfully"}

    new_login = client.post(
        "/login",
        data={
            "username": test_user["email"],
            "password": "new-password",
        },
    )
    assert new_login.status_code == 200


def test_update_password_rejects_incorrect_old_password(
    client, authorized_client, test_user
):
    response = authorized_client.patch(
        f"/users/{test_user['user_id']}/password",
        json={
            "old_password": "wrong-password",
            "new_password": "new-password",
        },
    )

    assert response.status_code == 400

    new_login = client.post(
        "/login",
        data={
            "username": test_user["email"],
            "password": "new-password",
        },
    )
    assert new_login.status_code == 401


def test_update_password_rejects_incorrect_new_password(
    client, authorized_client, test_user
):
    response = authorized_client.patch(
        f"/users/{test_user['user_id']}/password",
        json={
            "old_password": test_user["password"],
            "new_password": "new-password",
        },
    )

    assert response.status_code == 200

    new_login = client.post(
        "/login",
        data={
            "username": test_user["email"],
            "password": "wrong-password",
        },
    )
    assert new_login.status_code == 401


def test_delete_user(authorized_client, test_user):
    response = authorized_client.delete(
        f"/users/{test_user['user_id']}",
    )

    assert response.status_code == 204

    read_response = authorized_client.get(
        f"/users/{test_user['user_id']}",
    )
    assert read_response.status_code == 404
