import time
import pytest
import jwt
from fastapi import HTTPException
from fastapi.security import HTTPAuthorizationCredentials
from backend.app.services.supabase_service import SupabaseService
from backend.app.core.auth import get_current_user, get_optional_user


@pytest.fixture
def service():
    svc = SupabaseService()
    svc.jwt_secret = "test-secret-key-for-unit-testing-32-chars-min"
    return svc


def test_jwt_generation_and_decoding(service):
    token = service.generate_jwt("user-1", "user1@example.com", "user_one", expires_in=60)
    assert isinstance(token, str)

    payload = service.decode_jwt(token)
    assert payload is not None
    assert payload["sub"] == "user-1"
    assert payload["email"] == "user1@example.com"
    assert payload["user_metadata"]["username"] == "user_one"


def test_jwt_expired_token_rejected(service):
    # Expired token in the past
    token = service.generate_jwt("user-1", "user1@example.com", "user_one", expires_in=-10)
    payload = service.decode_jwt(token)
    assert payload is None


def test_jwt_invalid_signature_rejected(service):
    token = service.generate_jwt("user-1", "user1@example.com", "user_one")
    # Decode with a different secret
    other_svc = SupabaseService()
    other_svc.jwt_secret = "different-secret-that-does-not-match"
    payload = other_svc.decode_jwt(token)
    assert payload is None


def test_mock_sign_up_and_sign_in(service):
    # Sign up
    res = service.sign_up("player1@example.com", "pass12345", "player1", "Player One")
    assert res["email"] == "player1@example.com"
    assert res["username"] == "player1"
    user_id = res["user_id"]

    # Prevent duplicate email
    with pytest.raises(ValueError, match="already exists"):
        service.sign_up("player1@example.com", "otherpass", "player2")

    # Prevent duplicate username
    with pytest.raises(ValueError, match="already taken"):
        service.sign_up("other@example.com", "otherpass", "player1")

    # Sign in successfully
    login_res = service.sign_in("player1@example.com", "pass12345")
    assert login_res["user_id"] == user_id
    assert "access_token" in login_res

    # Sign in wrong password
    with pytest.raises(ValueError, match="Invalid email or password"):
        service.sign_in("player1@example.com", "wrongpass")


def test_profile_retrieval_and_update(service):
    res = service.sign_up("gamer@example.com", "pass12345", "gamerX")
    uid = res["user_id"]

    profile = service.get_profile(uid)
    assert profile is not None
    assert profile["username"] == "gamerX"

    updated = service.update_profile(uid, {
        "bio": "Competitive FPS and RPG lover",
        "default_difficulty": "hard",
        "favorite_genres": ["RPG", "Shooter"]
    })
    assert updated["bio"] == "Competitive FPS and RPG lover"
    assert updated["default_difficulty"] == "hard"
    assert "RPG" in updated["favorite_genres"]


def test_user_library_operations(service):
    res = service.sign_up("collector@example.com", "pass12345", "collector")
    uid = res["user_id"]

    # Add game to backlog
    item = service.upsert_user_game(uid, "game-elden-ring", {
        "status": "backlog",
        "personal_rating": 10,
        "playtime_hours": 12.5
    })
    assert item["status"] == "backlog"
    assert item["personal_rating"] == 10

    # Retrieve library
    lib = service.get_user_library(uid)
    assert len(lib) == 1
    assert lib[0]["game_id"] == "game-elden-ring"

    # Filter by status
    playing = service.get_user_library(uid, status="playing")
    assert len(playing) == 0

    # Toggle favorite
    item_fav = service.toggle_favorite(uid, "game-elden-ring")
    assert item_fav["is_favorite"] is True

    # Delete game
    deleted = service.delete_user_game(uid, "game-elden-ring")
    assert deleted is True
    assert len(service.get_user_library(uid)) == 0


def test_user_rankings_operations(service):
    res = service.sign_up("ranker@example.com", "pass12345", "ranker")
    uid = res["user_id"]

    rankings = service.get_user_rankings(uid)
    assert rankings["title"] == "My Top 10"
    assert rankings["positions"] == []

    updated = service.update_user_rankings(uid, "Top Souls Games", [
        {"game_id": "elden-ring", "rank": 1, "title": "Elden Ring"}
    ])
    assert updated["title"] == "Top Souls Games"
    assert len(updated["positions"]) == 1


@pytest.mark.asyncio
async def test_get_current_user_dependency_valid():
    svc = SupabaseService()
    token = svc.generate_jwt("user-999", "nine@example.com", "player9")
    creds = HTTPAuthorizationCredentials(scheme="Bearer", credentials=token)

    user = await get_current_user(creds)
    assert user.id == "user-999"
    assert user.email == "nine@example.com"
    assert user.username == "player9"


@pytest.mark.asyncio
async def test_get_current_user_dependency_invalid():
    creds = HTTPAuthorizationCredentials(scheme="Bearer", credentials="invalid.token.here")
    with pytest.raises(HTTPException) as exc:
        await get_current_user(creds)
    assert exc.value.status_code == 401


@pytest.mark.asyncio
async def test_get_optional_user_dependency():
    # When no token provided
    user = await get_optional_user(None)
    assert user is None

    # When valid token provided
    svc = SupabaseService()
    token = svc.generate_jwt("user-opt", "opt@example.com", "optuser")
    creds = HTTPAuthorizationCredentials(scheme="Bearer", credentials=token)
    user = await get_optional_user(creds)
    assert user is not None
    assert user.username == "optuser"
