"""Unit tests for unified GameService coordinator."""

import pytest
from backend.app.schemas.game import GameCard, GameDetail, SteamSearchResult, SteamSearchResultItem
from backend.app.services.cache_service import CacheService
from backend.app.services.fallback_service import FallbackService
from backend.app.services.game_service import GameService
from backend.app.services.steam_service import SteamService


class DummySteamService(SteamService):
    def __init__(self, cache):
        super().__init__(cache=cache)
        self.search_calls = []
        self.detail_calls = []

    async def search_games(self, query: str, limit: int = 10) -> SteamSearchResult:
        self.search_calls.append(query)
        if "witcher" in query.lower():
            return SteamSearchResult(
                total=1,
                items=[SteamSearchResultItem(id=292030, name="The Witcher 3: Wild Hunt")],
            )
        elif "cyberpunk" in query.lower():
            return SteamSearchResult(
                total=1,
                items=[SteamSearchResultItem(id=1091500, name="Cyberpunk 2077")],
            )
        return SteamSearchResult(total=0, items=[])

    async def get_app_details(self, app_id: int):
        self.detail_calls.append(app_id)
        if app_id == 292030:
            return GameDetail(
                id=292030,
                steam_appid=292030,
                title="The Witcher 3: Wild Hunt",
                header_image="https://cdn.steam.com/witcher.jpg",
                genres=["RPG", "Open World"],
                rating=93.0,
            )
        elif app_id == 1091500:
            return GameDetail(
                id=1091500,
                steam_appid=1091500,
                title="Cyberpunk 2077",
                header_image="https://cdn.steam.com/cyberpunk.jpg",
                genres=["Action", "RPG"],
                rating=86.0,
            )
        return None


class DummyFallbackService(FallbackService):
    async def resolve_fallback_metadata(self, title: str) -> GameCard:
        return GameCard(
            id=f"fallback-{title.lower().replace(' ', '-')}",
            title=title,
            header_image="https://placeholder.jpg",
            capsule_image="https://placeholder.jpg",
            genres=["Indie"],
            rating=80.0,
        )


@pytest.fixture
def coordinator():
    cache = CacheService(maxsize=100, ttl=60)
    steam = DummySteamService(cache)
    fallback = DummyFallbackService(cache)
    return GameService(steam=steam, fallback=fallback, cache=cache, concurrency_limit=3)


@pytest.mark.asyncio
async def test_enrich_game_with_appid(coordinator):
    """Test enriching by AppID resolves directly without title search."""
    card = await coordinator.enrich_game(title="Any Name", app_id=292030)
    assert card.id == 292030
    assert card.title == "The Witcher 3: Wild Hunt"
    assert card.rating == 93.0
    assert "RPG" in card.genres
    assert len(coordinator.steam.search_calls) == 0
    assert 292030 in coordinator.steam.detail_calls


@pytest.mark.asyncio
async def test_enrich_game_with_title_lookup(coordinator):
    """Test enriching by title queries Steam search then details."""
    card = await coordinator.enrich_game(title="Cyberpunk 2077")
    assert card.id == 1091500
    assert card.title == "Cyberpunk 2077"
    assert "Action" in card.genres
    assert "Cyberpunk 2077" in coordinator.steam.search_calls


@pytest.mark.asyncio
async def test_enrich_game_fallback_when_not_found(coordinator):
    """Test enriching an unknown title triggers fallback service."""
    card = await coordinator.enrich_game(title="Super Indie Obscure Game")
    assert card.title == "Super Indie Obscure Game"
    assert "fallback-" in str(card.id)
    assert card.header_image == "https://placeholder.jpg"
    assert "Indie" in card.genres


@pytest.mark.asyncio
async def test_batch_enrich_games(coordinator):
    """Test batch enriching multiple games concurrently."""
    titles = ["The Witcher 3", "Cyberpunk 2077", "Super Indie Game"]
    cards = await coordinator.batch_enrich_games(titles)
    assert len(cards) == 3
    assert cards[0].title == "The Witcher 3: Wild Hunt"
    assert cards[1].title == "Cyberpunk 2077"
    assert cards[2].title == "Super Indie Game"


@pytest.mark.asyncio
async def test_get_game_details(coordinator):
    """Test fetching game details."""
    detail = await coordinator.get_game_details(292030)
    assert detail is not None
    assert detail.title == "The Witcher 3: Wild Hunt"

    missing = await coordinator.get_game_details(999999)
    assert missing is None


@pytest.mark.asyncio
async def test_search_and_filter(coordinator):
    """Test search and filter with query, genre, rating, and pagination."""
    # Search for witcher
    res = await coordinator.search_and_filter(query="witcher", genre="RPG", min_rating=90.0)
    assert res.total == 1
    assert res.items[0].title == "The Witcher 3: Wild Hunt"

    # Genre filter excluding
    res_filtered = await coordinator.search_and_filter(query="witcher", genre="Simulation")
    assert res_filtered.total == 0

    # Rating filter excluding
    res_rating = await coordinator.search_and_filter(query="witcher", min_rating=95.0)
    assert res_rating.total == 0

    # Empty query
    res_empty = await coordinator.search_and_filter(query="")
    assert res_empty.total == 0
