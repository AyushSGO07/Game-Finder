import pytest
from pydantic import ValidationError
from backend.app.schemas.auth import (
    UserRegisterRequest,
    UserLoginRequest,
    TokenResponse,
    UserInfo,
    UserProfileResponse,
    UserProfileUpdate,
    UserLibraryItemCreate,
    UserLibraryItemUpdate,
    UserLibraryItemResponse,
    RankedPosition,
    RankedListUpdate,
    RankedListResponse,
    ReviewCreateRequest,
    ReviewResponse,
)


def test_user_register_valid():
    req = UserRegisterRequest(
        email="gamer@example.com",
        password="securePassword123",
        username="pixel_warrior",
        display_name="Pixel Warrior"
    )
    assert req.email == "gamer@example.com"
    assert req.username == "pixel_warrior"
    assert req.display_name == "Pixel Warrior"


def test_user_register_invalid_password_length():
    with pytest.raises(ValidationError):
        UserRegisterRequest(
            email="gamer@example.com",
            password="short",  # < 8 chars
            username="valid_user"
        )


def test_user_register_invalid_username_characters():
    with pytest.raises(ValidationError):
        UserRegisterRequest(
            email="gamer@example.com",
            password="securePassword123",
            username="invalid user with spaces!"
        )


def test_user_login_valid():
    req = UserLoginRequest(
        email="gamer@example.com",
        password="secretpassword"
    )
    assert req.email == "gamer@example.com"


def test_token_response_serialization():
    token = TokenResponse(
        access_token="sample.jwt.token",
        refresh_token="sample.refresh.token",
        expires_in=3600,
        user=UserInfo(id="usr-123", email="user@example.com", username="gamer1")
    )
    data = token.model_dump()
    assert data["token_type"] == "bearer"
    assert data["access_token"] == "sample.jwt.token"
    assert data["user"]["username"] == "gamer1"


def test_user_profile_response_defaults():
    profile = UserProfileResponse(
        id="usr-123",
        username="retro_king"
    )
    assert profile.is_public is True
    assert profile.show_library is True
    assert profile.default_difficulty == "medium"
    assert profile.favorite_genres == []


def test_user_library_item_create_validation():
    item = UserLibraryItemCreate(
        game_id="game-456",
        status="playing",
        is_favorite=True,
        personal_rating=9,
        playtime_hours=24.5
    )
    assert item.status == "playing"
    assert item.personal_rating == 9
    assert item.playtime_hours == 24.5


def test_user_library_item_invalid_status():
    with pytest.raises(ValidationError):
        UserLibraryItemCreate(
            game_id="game-456",
            status="invalid_status"  # Must match regex pattern
        )


def test_user_library_item_invalid_rating():
    with pytest.raises(ValidationError):
        UserLibraryItemCreate(
            game_id="game-456",
            personal_rating=11  # > 10
        )


def test_ranked_list_update():
    ranked = RankedListUpdate(
        title="Top RPGs",
        positions=[
            RankedPosition(game_id="g1", rank=1, title="Elden Ring"),
            RankedPosition(game_id="g2", rank=2, title="Witcher 3")
        ]
    )
    assert len(ranked.positions) == 2
    assert ranked.positions[0].rank == 1


def test_review_create_validation():
    review = ReviewCreateRequest(
        game_id="g1",
        rating=10,
        title="Masterpiece",
        body="One of the best games ever made."
    )
    assert review.rating == 10
    assert review.body == "One of the best games ever made."

    with pytest.raises(ValidationError):
        ReviewCreateRequest(
            game_id="g1",
            rating=0,  # Below 1
            body="Too low"
        )
