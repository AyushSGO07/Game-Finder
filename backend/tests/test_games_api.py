"""Integration tests for /api/v1/games API routes."""

from unittest.mock import AsyncMock, patch
import pytest
from fastapi.testclient import TestClient

from backend.app.main import app
from backend.app.schemas.game import GameCard, GameDetail, GameSearchResponse

client = TestClient(app)


def test_search_games_missing_query():
    """Test search endpoint without 'q' query parameter returns 422."""
    response = client.get("/api/v1/games/search")
    assert response.status_code == 422


@patch("backend.app.api.v1.games.game_service.search_and_filter", new_callable=AsyncMock)
def test_search_games_success(mock_search):
    """Test search endpoint returns 200 and GameSearchResponse."""
    card = GameCard(
        id=1091500,
        steam_appid=1091500,
        title="Cyberpunk 2077",
        header_image="https://cdn.steam.com/cyberpunk.jpg",
        genres=["Action", "RPG"],
        rating=86.0,
    )
    mock_search.return_value = GameSearchResponse(
        total=1, page=1, page_size=10, items=[card]
    )

    response = client.get("/api/v1/games/search?q=cyberpunk&genre=RPG&min_rating=80")
    assert response.status_code == 200
    data = response.json()
    assert data["total"] == 1
    assert len(data["items"]) == 1
    assert data["items"][0]["title"] == "Cyberpunk 2077"
    assert data["items"][0]["rating"] == 86.0
    mock_search.assert_awaited_once_with(
        query="cyberpunk",
        genre="RPG",
        min_rating=80.0,
        page=1,
        page_size=10,
    )


@patch("backend.app.api.v1.games.game_service.get_game_details", new_callable=AsyncMock)
def test_get_game_details_success(mock_get_details):
    """Test get game details returns 200 and GameDetail."""
    detail = GameDetail(
        id=292030,
        steam_appid=292030,
        title="The Witcher 3: Wild Hunt",
        header_image="https://cdn.steam.com/witcher.jpg",
        genres=["RPG", "Open World"],
        rating=93.0,
    )
    mock_get_details.return_value = detail

    response = client.get("/api/v1/games/292030")
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == 292030
    assert data["title"] == "The Witcher 3: Wild Hunt"
    assert data["rating"] == 93.0
    mock_get_details.assert_awaited_once_with(292030)


@patch("backend.app.api.v1.games.game_service.get_game_details", new_callable=AsyncMock)
def test_get_game_details_not_found(mock_get_details):
    """Test get game details returns 404 when game does not exist."""
    mock_get_details.return_value = None

    response = client.get("/api/v1/games/9999999")
    assert response.status_code == 404
    data = response.json()
    assert "not found" in data["detail"].lower()


@patch("backend.app.api.v1.games.game_service.batch_enrich_games", new_callable=AsyncMock)
def test_batch_enrich_success(mock_batch):
    """Test batch enrich returns 200 with enriched games list."""
    card1 = GameCard(id=1, title="Elden Ring", header_image="https://img1.jpg")
    card2 = GameCard(id=2, title="Hades", header_image="https://img2.jpg")
    mock_batch.return_value = [card1, card2]

    response = client.post(
        "/api/v1/games/batch",
        json={"titles": ["Elden Ring", "Hades"]},
    )
    assert response.status_code == 200
    data = response.json()
    assert len(data["games"]) == 2
    assert data["games"][0]["title"] == "Elden Ring"
    assert data["games"][1]["title"] == "Hades"
    mock_batch.assert_awaited_once_with(["Elden Ring", "Hades"])


def test_batch_enrich_empty_titles():
    """Test batch enrich with empty titles fails validation with 422."""
    response = client.post(
        "/api/v1/games/batch",
        json={"titles": []},
    )
    assert response.status_code == 422


def test_get_featured_games():
    """Test GET /api/v1/games/featured returns hero slides list."""
    response = client.get("/api/v1/games/featured")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) >= 1
    assert "title" in data[0]
    assert "backdrop_url" in data[0]


def test_get_shelf_games():
    """Test GET /api/v1/games/shelves/{category} returns games list."""
    for category in ["trending", "new_releases", "top_rated", "hidden_gems", "popular"]:
        response = client.get(f"/api/v1/games/shelves/{category}")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) >= 1
        assert "title" in data[0]


def test_get_genres():
    """Test GET /api/v1/games/genres returns genre hub tiles."""
    response = client.get("/api/v1/games/genres")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) >= 6
    assert "slug" in data[0]
    assert "name" in data[0]


def test_discover_games():
    """Test GET /api/v1/games/discover returns paginated GameSearchResponse."""
    response = client.get("/api/v1/games/discover?page=1&page_size=6")
    assert response.status_code == 200
    data = response.json()
    assert "total" in data
    assert "games" in data
    assert "page" in data
    assert data["page"] == 1
    assert len(data["games"]) <= 6


def test_discover_games_with_filters():
    """Test GET /api/v1/games/discover with genre and search query."""
    response = client.get("/api/v1/games/discover?genre=RPG&sort_by=rating&page=1&page_size=5")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data["games"], list)

