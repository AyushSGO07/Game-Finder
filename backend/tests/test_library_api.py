import pytest
from fastapi.testclient import TestClient
from backend.app.main import app

client = TestClient(app)


@pytest.fixture
def auth_headers():
    # Register a test user and obtain auth token
    payload = {
        "email": "libuser@example.com",
        "password": "validPassword123",
        "username": "lib_gamer"
    }
    res = client.post("/api/v1/auth/register", json=payload)
    if res.status_code == 400:
        # User already exists from previous test run, log in
        login_res = client.post("/api/v1/auth/login", json={
            "email": payload["email"],
            "password": payload["password"]
        })
        token = login_res.json()["access_token"]
    else:
        token = res.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


def test_library_endpoints_unauthorized_without_token():
    assert client.get("/api/v1/me/profile").status_code == 401
    assert client.get("/api/v1/me/library").status_code == 401
    assert client.post("/api/v1/me/library/elden-ring").status_code == 401
    assert client.get("/api/v1/me/favorites").status_code == 401
    assert client.get("/api/v1/me/rankings").status_code == 401


def test_user_profile_get_and_patch(auth_headers):
    # GET profile
    get_res = client.get("/api/v1/me/profile", headers=auth_headers)
    assert get_res.status_code == 200
    assert get_res.json()["username"] == "lib_gamer"

    # PATCH profile
    patch_res = client.patch("/api/v1/me/profile", headers=auth_headers, json={
        "bio": "Avid Indie & Metroidvania player",
        "default_difficulty": "nightmare",
        "favorite_genres": ["Indie", "Metroidvania"]
    })
    assert patch_res.status_code == 200
    data = patch_res.json()
    assert data["bio"] == "Avid Indie & Metroidvania player"
    assert data["default_difficulty"] == "nightmare"
    assert "Metroidvania" in data["favorite_genres"]


def test_user_library_shelving_and_filtering(auth_headers):
    # Add game to playing shelf
    shelf_res = client.post(
        "/api/v1/me/library/hades-2",
        headers=auth_headers,
        json={"status": "playing", "personal_rating": 9, "playtime_hours": 15.0}
    )
    assert shelf_res.status_code == 200
    item = shelf_res.json()
    assert item["game_id"] == "hades-2"
    assert item["status"] == "playing"
    assert item["personal_rating"] == 9

    # Add game to backlog shelf
    client.post(
        "/api/v1/me/library/silksong",
        headers=auth_headers,
        json={"status": "backlog"}
    )

    # Get all library items
    all_res = client.get("/api/v1/me/library", headers=auth_headers)
    assert all_res.status_code == 200
    assert len(all_res.json()) >= 2

    # Filter by status
    playing_res = client.get("/api/v1/me/library?status=playing", headers=auth_headers)
    assert playing_res.status_code == 200
    assert len(playing_res.json()) == 1
    assert playing_res.json()[0]["game_id"] == "hades-2"


def test_user_favorites_workflow(auth_headers):
    # Toggle favorite
    fav_res = client.post("/api/v1/me/favorites/celeste", headers=auth_headers)
    assert fav_res.status_code == 200
    assert fav_res.json()["is_favorite"] is True

    # Get favorites list
    list_res = client.get("/api/v1/me/favorites", headers=auth_headers)
    assert list_res.status_code == 200
    fav_ids = [g["game_id"] for g in list_res.json()]
    assert "celeste" in fav_ids

    # Toggle off
    unfav_res = client.post("/api/v1/me/favorites/celeste", headers=auth_headers)
    assert unfav_res.status_code == 200
    assert unfav_res.json()["is_favorite"] is False


def test_delete_library_item(auth_headers):
    # Add a game to delete
    client.post("/api/v1/me/library/game-to-delete", headers=auth_headers, json={"status": "wishlist"})

    # Delete it
    del_res = client.delete("/api/v1/me/library/game-to-delete", headers=auth_headers)
    assert del_res.status_code == 200

    # Delete non-existent game -> 404
    not_found = client.delete("/api/v1/me/library/non-existent-game", headers=auth_headers)
    assert not_found.status_code == 404


def test_user_rankings_get_and_post(auth_headers):
    # GET default rankings
    get_res = client.get("/api/v1/me/rankings", headers=auth_headers)
    assert get_res.status_code == 200
    assert get_res.json()["title"] == "My Top 10"

    # POST new rankings
    post_res = client.post("/api/v1/me/rankings", headers=auth_headers, json={
        "title": "All-Time Top Games",
        "positions": [
            {"game_id": "elden-ring", "rank": 1, "title": "Elden Ring"},
            {"game_id": "witcher-3", "rank": 2, "title": "The Witcher 3"}
        ]
    })
    assert post_res.status_code == 200
    data = post_res.json()
    assert data["title"] == "All-Time Top Games"
    assert len(data["positions"]) == 2
    assert data["positions"][0]["rank"] == 1
