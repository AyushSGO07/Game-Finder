import pytest
from fastapi.testclient import TestClient
from backend.app.main import app

client = TestClient(app)


def test_auth_register_success():
    payload = {
        "email": "newuser@example.com",
        "password": "validPassword123",
        "username": "new_gamer",
        "display_name": "New Gamer"
    }
    response = client.post("/api/v1/auth/register", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert "access_token" in data
    assert data["user"]["email"] == "newuser@example.com"
    assert data["user"]["username"] == "new_gamer"


def test_auth_register_duplicate_email():
    payload = {
        "email": "duplicate@example.com",
        "password": "validPassword123",
        "username": "gamer_one"
    }
    # First registration
    client.post("/api/v1/auth/register", json=payload)
    # Second registration should fail
    response = client.post("/api/v1/auth/register", json=payload)
    assert response.status_code == 400
    assert "already exists" in response.json()["detail"]


def test_auth_register_validation_error():
    payload = {
        "email": "not-an-email",
        "password": "short",
        "username": "bad user name!"
    }
    response = client.post("/api/v1/auth/register", json=payload)
    assert response.status_code == 422


def test_auth_login_success_and_failure():
    # Register first
    reg = {
        "email": "loginuser@example.com",
        "password": "mypassword123",
        "username": "login_user"
    }
    client.post("/api/v1/auth/register", json=reg)

    # Valid login
    login_res = client.post("/api/v1/auth/login", json={
        "email": "loginuser@example.com",
        "password": "mypassword123"
    })
    assert login_res.status_code == 200
    data = login_res.json()
    assert "access_token" in data
    assert data["user"]["email"] == "loginuser@example.com"

    # Invalid login
    bad_login = client.post("/api/v1/auth/login", json={
        "email": "loginuser@example.com",
        "password": "wrongpassword"
    })
    assert bad_login.status_code == 401


def test_auth_me_protected_endpoint():
    # Without token
    unauth = client.get("/api/v1/auth/me")
    assert unauth.status_code == 401

    # With valid token
    reg = {
        "email": "meuser@example.com",
        "password": "mypassword123",
        "username": "me_user"
    }
    reg_res = client.post("/api/v1/auth/register", json=reg)
    token = reg_res.json()["access_token"]

    headers = {"Authorization": f"Bearer {token}"}
    me_res = client.get("/api/v1/auth/me", headers=headers)
    assert me_res.status_code == 200
    profile = me_res.json()
    assert profile["username"] == "me_user"
    assert profile["is_public"] is True


def test_auth_logout():
    # Without token
    unauth = client.post("/api/v1/auth/logout")
    assert unauth.status_code == 401

    # With token
    reg = {
        "email": "logoutuser@example.com",
        "password": "mypassword123",
        "username": "logout_user"
    }
    reg_res = client.post("/api/v1/auth/register", json=reg)
    token = reg_res.json()["access_token"]

    headers = {"Authorization": f"Bearer {token}"}
    logout_res = client.post("/api/v1/auth/logout", headers=headers)
    assert logout_res.status_code == 200
    assert "Successfully logged out" in logout_res.json()["message"]


def test_auth_forgot_password():
    response = client.post(
        "/api/v1/auth/forgot-password",
        json={"email": "forgotuser@example.com"},
    )
    assert response.status_code == 200
    data = response.json()
    assert "instructions" in data["message"].lower() or "sent" in data["message"].lower()


def test_auth_reset_password():
    # Register user first
    reg = {
        "email": "resetuser@example.com",
        "password": "oldpassword123",
        "username": "reset_user"
    }
    client.post("/api/v1/auth/register", json=reg)

    response = client.post(
        "/api/v1/auth/reset-password",
        json={
            "email": "resetuser@example.com",
            "new_password": "newpassword456",
            "reset_token": "valid-token-123"
        },
    )
    assert response.status_code == 200
    data = response.json()
    assert "password updated" in data["message"].lower() or "success" in data["message"].lower()


def test_auth_profile_update():
    reg = {
        "email": "updateuser@example.com",
        "password": "validpassword123",
        "username": "update_user"
    }
    reg_res = client.post("/api/v1/auth/register", json=reg)
    token = reg_res.json()["access_token"]

    headers = {"Authorization": f"Bearer {token}"}
    update_res = client.patch(
        "/api/v1/auth/profile",
        headers=headers,
        json={
            "display_name": "Updated Handle",
            "bio": "Avid tactical gamer",
            "favorite_genres": ["Strategy", "RPG"],
            "preferred_platforms": ["PC", "Steam Deck"],
            "default_difficulty": "Hard",
        },
    )
    assert update_res.status_code == 200
    updated = update_res.json()
    assert updated["display_name"] == "Updated Handle"
    assert updated["bio"] == "Avid tactical gamer"
    assert "Strategy" in updated["favorite_genres"]

