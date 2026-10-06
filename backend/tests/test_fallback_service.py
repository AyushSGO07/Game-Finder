"""Unit tests for FallbackService covering Wikipedia resolution and placeholder generation."""

import pytest
import httpx
from backend.app.services.cache_service import CacheService
from backend.app.services.fallback_service import FallbackService


@pytest.fixture
def mock_cache():
    return CacheService(maxsize=100, ttl=60)


def test_slugify():
    """Test string slugification."""
    assert FallbackService.slugify("The Witcher 3: Wild Hunt!") == "the-witcher-3-wild-hunt"
    assert FallbackService.slugify("Cyberpunk 2077") == "cyberpunk-2077"
    assert FallbackService.slugify("   ") == "unknown-game"


def test_generate_placeholder_url():
    """Test generating stylized avatar URL."""
    url = FallbackService.generate_placeholder_url("Elden Ring")
    assert "ui-avatars.com" in url
    assert "Elden+Ring" in url
    assert "0f172a" in url


@pytest.mark.asyncio
async def test_fetch_wikipedia_image_success(mock_cache):
    """Test successfully extracting original or thumbnail image from Wikipedia."""
    wiki_payload = {
        "query": {
            "pages": {
                "12345": {
                    "pageid": 12345,
                    "title": "Chrono Trigger",
                    "original": {"source": "https://upload.wikimedia.org/chrono.jpg"},
                }
            }
        }
    }

    call_count = 0

    def handler(request: httpx.Request) -> httpx.Response:
        nonlocal call_count
        call_count += 1
        return httpx.Response(200, json=wiki_payload)

    client = httpx.AsyncClient(transport=httpx.MockTransport(handler))
    service = FallbackService(cache=mock_cache, client=client)

    img = await service.fetch_wikipedia_image("Chrono Trigger")
    assert img == "https://upload.wikimedia.org/chrono.jpg"
    assert call_count == 1

    # Second call should be cached
    cached_img = await service.fetch_wikipedia_image("Chrono Trigger")
    assert cached_img == "https://upload.wikimedia.org/chrono.jpg"
    assert call_count == 1


@pytest.mark.asyncio
async def test_fetch_wikipedia_image_missing(mock_cache):
    """Test Wikipedia returning missing page (-1) returns None."""
    missing_payload = {
        "query": {
            "pages": {
                "-1": {
                    "ns": 0,
                    "title": "NonExistentGame12345",
                    "missing": "",
                }
            }
        }
    }

    def handler(request: httpx.Request) -> httpx.Response:
        return httpx.Response(200, json=missing_payload)

    client = httpx.AsyncClient(transport=httpx.MockTransport(handler))
    service = FallbackService(cache=mock_cache, client=client)

    img = await service.fetch_wikipedia_image("NonExistentGame12345")
    assert img is None


@pytest.mark.asyncio
async def test_resolve_fallback_metadata_with_placeholder(mock_cache):
    """Test resolve_fallback_metadata guarantees valid GameCard even when Wikipedia is empty."""
    def handler(request: httpx.Request) -> httpx.Response:
        return httpx.Response(404, text="Not Found")

    client = httpx.AsyncClient(transport=httpx.MockTransport(handler))
    service = FallbackService(cache=mock_cache, client=client)

    card = await service.resolve_fallback_metadata("Hollow Knight: Silksong")
    assert card is not None
    assert card.title == "Hollow Knight: Silksong"
    assert "hollow-knight-silksong" in str(card.id)
    assert card.header_image is not None
    assert "ui-avatars.com" in card.header_image
    assert len(card.genres) > 0
