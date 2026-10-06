"""Unified game coordinator service managing Steam integration, fallbacks, and caching."""

import asyncio
import logging
from typing import List, Optional
from backend.app.schemas.game import (
    GameCard,
    GameDetail,
    GameSearchResponse,
)
from backend.app.services.cache_service import CacheService, game_cache
from backend.app.services.fallback_service import FallbackService, fallback_service
from backend.app.services.steam_service import SteamService, steam_service

logger = logging.getLogger(__name__)


class GameService:
    """Coordinates metadata enrichment, search filtering, and fallback resolution."""

    def __init__(
        self,
        steam: Optional[SteamService] = None,
        fallback: Optional[FallbackService] = None,
        cache: Optional[CacheService] = None,
        concurrency_limit: int = 5,
    ) -> None:
        """Initialize coordinator with services and concurrency semaphore."""
        self.steam = steam or steam_service
        self.fallback = fallback or fallback_service
        self.cache = cache or game_cache
        self._semaphore = asyncio.Semaphore(concurrency_limit)

    async def enrich_game(
        self, title: str, app_id: Optional[int] = None
    ) -> GameCard:
        """Enrich a single game title or AppID with Steam metadata, falling back when needed."""
        clean_title = title.strip()
        cache_key = CacheService.make_key(
            "game:card", f"{app_id or ''}:{clean_title}"
        )
        cached_card = await self.cache.get(cache_key)
        if cached_card is not None:
            return GameCard.model_validate(cached_card)

        # 1. If app_id provided, fetch details directly
        if app_id:
            detail = await self.steam.get_app_details(app_id)
            if detail:
                card = GameCard(
                    id=detail.id,
                    steam_appid=detail.steam_appid,
                    title=detail.title,
                    header_image=detail.header_image,
                    capsule_image=detail.capsule_image,
                    genres=detail.genres,
                    rating=detail.rating,
                    release_date=detail.release_date,
                    short_description=detail.short_description,
                )
                await self.cache.set(cache_key, card.model_dump())
                return card

        # 2. Search Steam by title
        if clean_title:
            search_res = await self.steam.search_games(clean_title, limit=1)
            if search_res.items:
                found_id = search_res.items[0].id
                detail = await self.steam.get_app_details(found_id)
                if detail:
                    card = GameCard(
                        id=detail.id,
                        steam_appid=detail.steam_appid,
                        title=detail.title,
                        header_image=detail.header_image,
                        capsule_image=detail.capsule_image,
                        genres=detail.genres,
                        rating=detail.rating,
                        release_date=detail.release_date,
                        short_description=detail.short_description,
                    )
                    await self.cache.set(cache_key, card.model_dump())
                    return card
                else:
                    # Use storesearch item info
                    found_item = search_res.items[0]
                    card = GameCard(
                        id=found_id,
                        steam_appid=found_id,
                        title=found_item.name,
                        header_image=found_item.tiny_image,
                        capsule_image=found_item.tiny_image,
                        rating=float(found_item.metascore) if found_item.metascore else None,
                    )
                    await self.cache.set(cache_key, card.model_dump())
                    return card

        # 3. Fallback to Wikipedia or generated placeholder
        fallback_card = await self.fallback.resolve_fallback_metadata(clean_title)
        await self.cache.set(cache_key, fallback_card.model_dump())
        return fallback_card

    async def batch_enrich_games(self, titles: List[str]) -> List[GameCard]:
        """Concurrently enrich multiple game titles respecting the concurrency semaphore."""
        async def _bounded_enrich(t: str) -> GameCard:
            async with self._semaphore:
                return await self.enrich_game(title=t)

        tasks = [_bounded_enrich(title) for title in titles if title.strip()]
        if not tasks:
            return []
        return await asyncio.gather(*tasks)

    async def get_game_details(self, app_id: int) -> Optional[GameDetail]:
        """Retrieve complete game details for an AppID."""
        return await self.steam.get_app_details(app_id)

    async def search_and_filter(
        self,
        query: str,
        genre: Optional[str] = None,
        min_rating: Optional[float] = None,
        page: int = 1,
        page_size: int = 10,
    ) -> GameSearchResponse:
        """Search games across catalog, applying genre/rating filters and pagination."""
        clean_query = query.strip()
        if not clean_query:
            return GameSearchResponse(total=0, page=page, page_size=page_size, items=[])

        # Query Steam search
        search_res = await self.steam.search_games(clean_query, limit=40)
        matched_cards: List[GameCard] = []

        if search_res.items:
            # Batch enrich top items
            async def _enrich_item(item) -> GameCard:
                async with self._semaphore:
                    return await self.enrich_game(title=item.name, app_id=item.id)

            enrich_tasks = [_enrich_item(item) for item in search_res.items]
            matched_cards = await asyncio.gather(*enrich_tasks)
        else:
            # Generate fallback card for query
            fallback_card = await self.fallback.resolve_fallback_metadata(clean_query)
            matched_cards = [fallback_card]

        # Apply genre filter if provided
        filtered = matched_cards
        if genre and genre.strip():
            genre_target = genre.strip().lower()
            filtered = [
                c
                for c in filtered
                if any(genre_target in g.lower() for g in c.genres)
            ]

        # Apply minimum rating filter if provided
        if min_rating is not None:
            filtered = [
                c for c in filtered if c.rating is not None and c.rating >= min_rating
            ]

        total = len(filtered)
        start_idx = (page - 1) * page_size
        end_idx = start_idx + page_size
        paginated_items = filtered[start_idx:end_idx]

        return GameSearchResponse(
            total=total,
            page=page,
            page_size=page_size,
            items=paginated_items,
        )


# Global singleton instance
game_service = GameService()
