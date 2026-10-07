import pytest
from fastapi.testclient import TestClient
from backend.app.main import app

client = TestClient(app)


@pytest.fixture
def auth_headers():
    payload = {
        "email": "reviewer@example.com",
        "password": "validPassword123",
        "username": "review_master"
    }
    res = client.post("/api/v1/auth/register", json=payload)
    if res.status_code == 400:
        login_res = client.post("/api/v1/auth/login", json={
            "email": payload["email"],
            "password": payload["password"]
        })
        token = login_res.json()["access_token"]
    else:
        token = res.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


def test_get_reviews_unauthenticated():
    # Public endpoint to view reviews
    res = client.get("/api/v1/library/reviews/1245620")
    assert res.status_code == 200
    data = res.json()
    assert isinstance(data, list)
    assert len(data) >= 1
    assert data[0]["game_id"] == "1245620"
    assert data[0]["rating"] in range(1, 11)


def test_get_reviews_empty_for_unknown_game():
    res = client.get("/api/v1/library/reviews/nonexistent-game-999")
    assert res.status_code == 200
    assert res.json() == []


def test_post_review_requires_authentication():
    payload = {
        "game_id": "1245620",
        "rating": 10,
        "title": "Masterpiece",
        "body": "Unreal gameplay and open world experience."
    }
    res = client.post("/api/v1/library/reviews", json=payload)
    assert res.status_code == 401


def test_post_review_creates_and_updates_review(auth_headers):
    # 1. Create a new review
    create_payload = {
        "game_id": "1091500",
        "rating": 9,
        "title": "Night City is magnificent",
        "body": "The storyline and character depth in Phantom Liberty were stellar."
    }
    create_res = client.post("/api/v1/library/reviews", headers=auth_headers, json=create_payload)
    assert create_res.status_code == 200
    created = create_res.json()
    assert created["game_id"] == "1091500"
    assert created["rating"] == 9
    assert created["title"] == "Night City is magnificent"
    assert created["body"] == create_payload["body"]
    assert created["username"] == "review_master"

    # Verify review shows up in get_reviews
    get_res = client.get("/api/v1/library/reviews/1091500")
    assert get_res.status_code == 200
    assert any(r["id"] == created["id"] for r in get_res.json())

    # 2. Update existing review
    update_payload = {
        "game_id": "1091500",
        "rating": 10,
        "title": "Updated to a 10/10 Masterpiece",
        "body": "After completing all endings, this is definitively a 10/10."
    }
    update_res = client.post("/api/v1/library/reviews", headers=auth_headers, json=update_payload)
    assert update_res.status_code == 200
    updated = update_res.json()
    assert updated["id"] == created["id"]  # Same review record updated
    assert updated["rating"] == 10
    assert updated["title"] == "Updated to a 10/10 Masterpiece"


def test_post_review_validation_bounds(auth_headers):
    # Rating < 1 should fail validation
    res_low = client.post("/api/v1/library/reviews", headers=auth_headers, json={
        "game_id": "1245620",
        "rating": 0,
        "body": "Too low rating"
    })
    assert res_low.status_code == 422

    # Rating > 10 should fail validation
    res_high = client.post("/api/v1/library/reviews", headers=auth_headers, json={
        "game_id": "1245620",
        "rating": 11,
        "body": "Too high rating"
    })
    assert res_high.status_code == 422

    # Empty body should fail validation
    res_empty = client.post("/api/v1/library/reviews", headers=auth_headers, json={
        "game_id": "1245620",
        "rating": 8,
        "body": ""
    })
    assert res_empty.status_code == 422
