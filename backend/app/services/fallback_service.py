"""Artwork and metadata fallback resolver for games missing external store records."""

import logging
import re
import urllib.parse
from typing import Optional
import httpx

from backend.app.schemas.game import GameCard
from backend.app.services.cache_service import CacheService, game_cache

logger = logging.getLogger(__name__)


class FallbackService:
    """Provides fallback artwork and metadata via Wikipedia API and stylized placeholders."""

    WIKIPEDIA_API_URL = "https://en.wikipedia.org/w/api.php"
    USER_AGENT = "GameFinderBot/1.0 (https://github.com/gamefinder; gamefinder@example.com)"

    def __init__(
        self,
        cache: Optional[CacheService] = None,
        client: Optional[httpx.AsyncClient] = None,
        timeout: float = 4.0,
    ) -> None:
        """Initialize FallbackService with optional custom cache or httpx client."""
        self.cache = cache or game_cache
        self._custom_client = client
        self.timeout = timeout

    async def _get_client(self) -> httpx.AsyncClient:
        """Get or create reusable httpx AsyncClient."""
        if self._custom_client is not None:
            return self._custom_client
        return httpx.AsyncClient(
            timeout=self.timeout,
            headers={"User-Agent": self.USER_AGENT},
        )

    @staticmethod
    def generate_placeholder_url(title: str) -> str:
        """Generate a sleek dark-themed UI-Avatar image URL for a game title."""
        encoded_name = urllib.parse.quote_plus(title.strip() or "Game")
        return (
            f"https://ui-avatars.com/api/?name={encoded_name}"
            f"&background=0f172a&color=38bdf8&size=512&font-size=0.33&bold=true"
        )

    @staticmethod
    def slugify(title: str) -> str:
        """Convert a title to a clean URL/id slug."""
        slug = re.sub(r"[^a-zA-Z0-9]+", "-", title.lower()).strip("-")
        return slug or "unknown-game"

    async def fetch_wikipedia_image(self, title: str) -> Optional[str]:
        """Query Wikipedia PageImages API for game cover or lead image."""
        clean_title = title.strip()
        if not clean_title:
            return None

        cache_key = CacheService.make_key("wiki:img", clean_title)
        cached_img = await self.cache.get(cache_key)
        if cached_img is not None:
            return cached_img

        params = {
            "action": "query",
            "format": "json",
            "prop": "pageimages",
            "piprop": "original|thumbnail",
            "pithumbsize": 600,
            "titles": clean_title,
        }

        client = await self._get_client()
        should_close = self._custom_client is None

        try:
            response = await client.get(self.WIKIPEDIA_API_URL, params=params)
            if response.status_code != 200:
                logger.warning(
                    "Wikipedia API returned status %s for title %s",
                    response.status_code,
                    clean_title,
                )
                return None

            data = response.json()
            pages = data.get("query", {}).get("pages", {})
            for page_id, page in pages.items():
                if str(page_id) != "-1":
                    original = page.get("original", {}).get("source")
                    thumbnail = page.get("thumbnail", {}).get("source")
                    img_url = original or thumbnail
                    if img_url:
                        await self.cache.set(cache_key, img_url)
                        return img_url
            return None
        except Exception as exc:
            logger.warning("Error fetching Wikipedia image for '%s': %s", clean_title, exc)
            return None
        finally:
            if should_close:
                await client.aclose()

    async def resolve_fallback_metadata(self, title: str) -> GameCard:
        """Resolve guaranteed complete GameCard with artwork from Wikipedia or placeholder."""
        clean_title = title.strip() or "Unknown Game"
        cache_key = CacheService.make_key("fallback:card", clean_title)
        cached_card = await self.cache.get(cache_key)
        if cached_card is not None:
            return GameCard.model_validate(cached_card)

        # 1. Try Wikipedia image
        wiki_image = await self.fetch_wikipedia_image(clean_title)

        # 2. If not found, use placeholder artwork
        artwork_url = wiki_image or self.generate_placeholder_url(clean_title)
        slug = self.slugify(clean_title)

        card = GameCard(
            id=f"fallback-{slug}",
            steam_appid=None,
            title=clean_title,
            header_image=artwork_url,
            capsule_image=artwork_url,
            genres=["Featured", "Adventure"],
            rating=75.0,
            release_date="TBA",
            short_description=f"Explore {clean_title} — recommended based on your preferences.",
            price_overview=None,
        )

        await self.cache.set(cache_key, card.model_dump())
        return card


# Global singleton instance
fallback_service = FallbackService()
