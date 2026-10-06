"""Unit tests for SteamStore API client with mocked HTTP responses and caching."""

import json
import pytest
import httpx
from backend.app.services.cache_service import CacheService
from backend.app.services.steam_service import SteamService


@pytest.fixture
def mock_cache():
    return CacheService(maxsize=100, ttl=60)


MOCK_CYBERPUNK_DETAILS = {
    "1091500": {
        "success": True,
        "data": {
            "type": "game",
            "name": "Cyberpunk 2077",
            "steam_appid": 1091500,
            "header_image": "https://cdn.steam.com/cyberpunk_header.jpg",
            "capsule_image": "https://cdn.steam.com/cyberpunk_capsule.jpg",
            "short_description": "Night City open world RPG.",
            "detailed_description": "<p>Cyberpunk 2077 details</p>",
            "about_the_game": "About the game text",
            "developers": ["CD PROJEKT RED"],
            "publishers": ["CD PROJEKT RED"],
            "genres": [{"id": "1", "description": "Action"}, {"id": "3", "description": "RPG"}],
            "metacritic": {"score": 86},
            "release_date": {"date": "10 Dec, 2020"},
            "screenshots": [
                {
                    "id": 0,
                    "path_thumbnail": "https://cdn.steam.com/ss1_thumb.jpg",
                    "path_full": "https://cdn.steam.com/ss1_full.jpg",
                }
            ],
            "movies": [
                {
                    "id": 1,
                    "name": "Launch Trailer",
                    "thumbnail": "https://cdn.steam.com/movie_thumb.jpg",
                    "mp4": {"max": "https://cdn.steam.com/movie.mp4"},
                }
            ],
            "pc_requirements": {"minimum": "Intel Core i5-3570K"},
            "website": "https://www.cyberpunk.net",
        },
    }
}


@pytest.mark.asyncio
async def test_search_games_success(mock_cache):
    """Test successful search returns parsed SteamSearchResult and caches result."""
    search_payload = {
        "total": 1,
        "items": [
            {
                "id": 1091500,
                "name": "Cyberpunk 2077",
                "tiny_image": "https://cdn.steam.com/tiny.jpg",
                "metascore": "86",
            }
        ],
    }

    call_count = 0

    def handler(request: httpx.Request) -> httpx.Response:
        nonlocal call_count
        call_count += 1
        assert "storesearch" in str(request.url)
        return httpx.Response(200, json=search_payload)

    client = httpx.AsyncClient(transport=httpx.MockTransport(handler))
    service = SteamService(cache=mock_cache, client=client)

    result = await service.search_games("cyberpunk")
    assert result.total == 1
    assert len(result.items) == 1
    assert result.items[0].id == 1091500
    assert result.items[0].name == "Cyberpunk 2077"
    assert call_count == 1

    # Second call should be served from cache without invoking HTTP handler
    cached_result = await service.search_games("cyberpunk")
    assert cached_result.total == 1
    assert call_count == 1  # No additional network call


@pytest.mark.asyncio
async def test_search_games_empty_query(mock_cache):
    """Test searching with empty or whitespace string returns empty result immediately."""
    service = SteamService(cache=mock_cache)
    result = await service.search_games("   ")
    assert result.total == 0
    assert result.items == []


@pytest.mark.asyncio
async def test_get_app_details_success(mock_cache):
    """Test fetching app details parses full GameDetail model and caches it."""
    call_count = 0

    def handler(request: httpx.Request) -> httpx.Response:
        nonlocal call_count
        call_count += 1
        assert "appdetails" in str(request.url)
        return httpx.Response(200, json=MOCK_CYBERPUNK_DETAILS)

    client = httpx.AsyncClient(transport=httpx.MockTransport(handler))
    service = SteamService(cache=mock_cache, client=client)

    detail = await service.get_app_details(1091500)
    assert detail is not None
    assert detail.id == 1091500
    assert detail.title == "Cyberpunk 2077"
    assert detail.rating == 86.0
    assert "Action" in detail.genres
    assert len(detail.screenshots) == 1
    assert len(detail.movies) == 1
    assert detail.movies[0].mp4_url == "https://cdn.steam.com/movie.mp4"
    assert call_count == 1

    # Repeat call served from cache
    cached_detail = await service.get_app_details(1091500)
    assert cached_detail is not None
    assert cached_detail.title == "Cyberpunk 2077"
    assert call_count == 1


@pytest.mark.asyncio
async def test_get_app_details_invalid_app(mock_cache):
    """Test requesting non-existent or unreleased AppID returns None gracefully."""
    invalid_payload = {"9999999": {"success": False}}

    def handler(request: httpx.Request) -> httpx.Response:
        return httpx.Response(200, json=invalid_payload)

    client = httpx.AsyncClient(transport=httpx.MockTransport(handler))
    service = SteamService(cache=mock_cache, client=client)

    detail = await service.get_app_details(9999999)
    assert detail is None


@pytest.mark.asyncio
async def test_rate_limit_retry_backoff(mock_cache):
    """Test HTTP 429 status triggers exponential backoff and recovers on subsequent attempt."""
    attempts = 0

    def handler(request: httpx.Request) -> httpx.Response:
        nonlocal attempts
        attempts += 1
        if attempts == 1:
            return httpx.Response(429, json={"error": "Too Many Requests"})
        return httpx.Response(200, json=MOCK_CYBERPUNK_DETAILS)

    client = httpx.AsyncClient(transport=httpx.MockTransport(handler))
    service = SteamService(
        cache=mock_cache, client=client, max_retries=3, base_backoff=0.01
    )

    detail = await service.get_app_details(1091500)
    assert detail is not None
    assert detail.title == "Cyberpunk 2077"
    assert attempts == 2


@pytest.mark.asyncio
async def test_retries_exhausted_graceful_handling(mock_cache):
    """Test persistent HTTP 500 server errors gracefully return None without raising."""
    def handler(request: httpx.Request) -> httpx.Response:
        return httpx.Response(500, text="Internal Server Error")

    client = httpx.AsyncClient(transport=httpx.MockTransport(handler))
    service = SteamService(
        cache=mock_cache, client=client, max_retries=2, base_backoff=0.01
    )

    detail = await service.get_app_details(1091500)
    assert detail is None
