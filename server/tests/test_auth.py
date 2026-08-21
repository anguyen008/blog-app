from app import schemas
from app import oauth2
from app.oauth2 import get_current_user
import pytest


def test_login_not_exist(client):
    res = client.post(
        "/login", data={"username": "test@gmail.com", "password": "test123"}
    )
    assert res.status_code == 401


def test_login_user(client, test_user):
    res = client.post(
        "/login",
        data={"username": test_user["email"], "password": test_user["password"]},
    )
    login_res = schemas.Token(**res.json())
    user = get_current_user(token=login_res.access_token)
    assert res.status_code == 200
    assert str(user.user_id) == test_user["user_id"]
    assert login_res.token_type == "bearer"

    assert "refresh_token" in res.cookies
    assert (
        str(get_current_user(res.cookies["refresh_token"], "refresh").user_id)
        == test_user["user_id"]
    )


@pytest.mark.parametrize(
    "email, password, status_code",
    [
        ("user1@example.com", "P@ssword123", 401),
        ("user2@example.com", "SecureWord456", 401),
        (None, "LetMeIn789", 422),
        ("user4@example.com", None, 422),
        ("test@gmail.com", "test123242kjdskjfdsdf", 401),
    ],
)
def test_incorrect_login(client, email, password, status_code):
    res = client.post("/login", data={"username": email, "password": password})
    assert res.status_code == status_code
    assert "refresh_token" not in res.cookies


def test_refresh_token(client, test_user):
    login_res = client.post(
        "/login",
        data={"username": test_user["email"], "password": test_user["password"]},
    )
    client.cookies.set("refresh_token", login_res.cookies["refresh_token"])
    refresh_res = client.post(
        "/refresh",
    )
    refresh_token = schemas.Token(**refresh_res.json())
    user = get_current_user(refresh_token.access_token)

    assert refresh_res.status_code == 200
    assert refresh_token.token_type == "bearer"
    assert str(user.user_id) == test_user["user_id"]


@pytest.mark.parametrize(
    "refresh_token",
    [
        None,
        oauth2.create_access_token(
            data={"user_id": "00000000-0000-0000-0000-000000000000"}
        ),
        oauth2.create_refresh_token(
            data={"user_id": "00000000-0000-0000-0000-000000000000"},
            expires_delta=-1,
        ),
        "not-a-jwt",
    ],
)
def test_refresh_token_rejected(client, refresh_token):
    if refresh_token is not None:
        client.cookies.set("refresh_token", refresh_token)

    res = client.post("/refresh")
    assert res.status_code == 401


def test_logout_clears_authentication_cookies(client):
    client.cookies.set("refresh_token", "refresh-token")
    client.cookies.set("is_logged_in", "false")

    res = client.post("/logout")
    assert res.status_code == 200
    assert res.json() == {"message": "Logged out succesfully"}
    cookie_headers = res.headers.get_list("set-cookie")
    assert any("refresh_token=" in h and "Max-Age=0" in h for h in cookie_headers)
    assert any("is_logged_in=" in h and "Max-Age=0" in h for h in cookie_headers)
