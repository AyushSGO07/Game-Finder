"""Unit tests for game metadata Pydantic schemas."""

import pytest
from pydantic import ValidationError
from backend.app.schemas.game import (
    BatchEnrichRequest,
    BatchEnrichResponse,
    GameCard,
    GameDetail,
    GameSearchResponse,
    MovieItem,
    ScreenshotItem,
    SteamSearchResult,
    SteamSearchResultItem,
)


def test_game_card_schema_valid():
    """Test valid GameCard construction."""
    card = GameCard(
        id=1091500,
        steam_appid=1091500,
        title="Cyberpunk 2077",
        header_image="https://steam.cdn/header.jpg",
        capsule_image="https://steam.cdn/capsule.jpg",
        genres=["Action", "RPG"],
        rating=86.0,
        release_date="10 Dec, 2020",
        short_description="An open-world, action-adventure RPG set in Night City.",
        price_overview="$59.99",
    )
    assert card.id == 1091500
    assert card.title == "Cyberpunk 2077"
    assert "RPG" in card.genres
    assert card.rating == 86.0


def test_game_card_schema_defaults():
    """Test GameCard with default and optional values."""
    card = GameCard(id="hades-2", title="Hades II")
    assert card.id == "hades-2"
    assert card.steam_appid is None
    assert card.genres == []
    assert card.rating is None


def test_screenshot_and_movie_schema():
    """Test ScreenshotItem and MovieItem schemas."""
    screenshot = ScreenshotItem(
        id=1,
        path_thumbnail="https://steam.cdn/thumb.jpg",
        path_full="https://steam.cdn/full.jpg",
    )
    assert screenshot.id == 1
    assert screenshot.path_thumbnail == "https://steam.cdn/thumb.jpg"

    movie = MovieItem(
        id=100,
        name="Official Trailer",
        thumbnail="https://steam.cdn/movie_thumb.jpg",
        mp4_url="https://steam.cdn/trailer.mp4",
    )
    assert movie.id == 100
    assert movie.mp4_url == "https://steam.cdn/trailer.mp4"
    assert movie.webm_url is None


def test_game_detail_schema():
    """Test full GameDetail schema."""
    detail = GameDetail(
        id=1091500,
        steam_appid=1091500,
        title="Cyberpunk 2077",
        developers=["CD PROJEKT RED"],
        publishers=["CD PROJEKT RED"],
        genres=["Action", "RPG"],
        detailed_description="<p>Welcome to Night City</p>",
        screenshots=[
            ScreenshotItem(
                id=1,
                path_thumbnail="https://steam.cdn/thumb.jpg",
                path_full="https://steam.cdn/full.jpg",
            )
        ],
        movies=[
            MovieItem(
                id=200,
                name="Trailer",
                thumbnail="https://steam.cdn/thumb.jpg",
                mp4_url="https://steam.cdn/trailer.mp4",
            )
        ],
        pc_requirements={"minimum": "DirectX 12 required"},
        steam_url="https://store.steampowered.com/app/1091500",
    )
    assert detail.title == "Cyberpunk 2077"
    assert len(detail.screenshots) == 1
    assert len(detail.movies) == 1
    assert detail.pc_requirements["minimum"] == "DirectX 12 required"


def test_search_and_batch_schemas():
    """Test SteamSearchResult, GameSearchResponse, and batch enrichment schemas."""
    steam_item = SteamSearchResultItem(id=730, name="Counter-Strike 2")
    steam_res = SteamSearchResult(total=1, items=[steam_item])
    assert steam_res.total == 1
    assert steam_res.items[0].name == "Counter-Strike 2"

    card = GameCard(id=730, title="Counter-Strike 2")
    search_resp = GameSearchResponse(total=1, page=1, page_size=10, items=[card])
    assert search_resp.total == 1
    assert len(search_resp.items) == 1

    batch_req = BatchEnrichRequest(titles=["Elden Ring", "Hades"])
    assert len(batch_req.titles) == 2

    with pytest.raises(ValidationError):
        BatchEnrichRequest(titles=[])  # min_length=1

    batch_resp = BatchEnrichResponse(games=[card])
    assert len(batch_resp.games) == 1
