"""Asynchronous client for Steam Store Web API with caching and rate limit backoff."""

import asyncio
import logging
from typing import Any, Dict, List, Optional, Union
import httpx

from backend.app.schemas.game import (
    GameDetail,
    MovieItem,
    ScreenshotItem,
    SteamSearchResult,
    SteamSearchResultItem,
)
from backend.app.services.cache_service import CacheService, game_cache

logger = logging.getLogger(__name__)


class SteamService:
    """Service to interact with public Steam Store Web API endpoints."""

    STORE_SEARCH_URL = "https://store.steampowered.com/api/storesearch/"
    APP_DETAILS_URL = "https://store.steampowered.com/api/appdetails"

    def __init__(
        self,
        cache: Optional[CacheService] = None,
        client: Optional[httpx.AsyncClient] = None,
        timeout: float = 5.0,
        max_retries: int = 3,
        base_backoff: float = 0.5,
    ) -> None:
        """Initialize SteamService with optional custom cache or httpx client."""
        self.cache = cache or game_cache
        self._custom_client = client
        self.timeout = timeout
        self.max_retries = max_retries
        self.base_backoff = base_backoff

    async def _get_client(self) -> httpx.AsyncClient:
        """Get or create reusable httpx AsyncClient."""
        if self._custom_client is not None:
            return self._custom_client
        return httpx.AsyncClient(timeout=self.timeout)

    async def _execute_with_retry(
        self, url: str, params: Dict[str, Any]
    ) -> Optional[httpx.Response]:
        """Execute HTTP GET with exponential backoff on HTTP 429 or 5xx status codes."""
        client = await self._get_client()
        should_close_client = self._custom_client is None

        try:
            for attempt in range(self.max_retries):
                try:
                    response = await client.get(url, params=params)
                    if response.status_code == 200:
                        return response
                    elif response.status_code in (429, 500, 502, 503, 504):
                        sleep_time = self.base_backoff * (2**attempt)
                        logger.warning(
                            "Steam API returned %s for %s. Retrying in %.2fs (attempt %d/%d)",
                            response.status_code,
                            url,
                            sleep_time,
                            attempt + 1,
                            self.max_retries,
                        )
                        await asyncio.sleep(sleep_time)
                    else:
                        logger.warning(
                            "Steam API returned unexpected status %s for %s",
                            response.status_code,
                            url,
                        )
                        return None
                except (httpx.RequestError, httpx.TimeoutException) as exc:
                    sleep_time = self.base_backoff * (2**attempt)
                    logger.warning(
                        "Steam API request error: %s. Retrying in %.2fs (attempt %d/%d)",
                        str(exc),
                        sleep_time,
                        attempt + 1,
                        self.max_retries,
                    )
                    await asyncio.sleep(sleep_time)

            logger.error("Steam API retries exhausted for %s", url)
            return None
        finally:
            if should_close_client:
                await client.aclose()

    async def search_games(self, query: str, limit: int = 10) -> SteamSearchResult:
        """Search Steam Store catalog by term with caching."""
        normalized_query = query.strip()
        if not normalized_query:
            return SteamSearchResult(total=0, items=[])

        cache_key = CacheService.make_key("steam:search", normalized_query)
        cached_result = await self.cache.get(cache_key)
        if cached_result is not None:
            return SteamSearchResult.model_validate(cached_result)

        params = {
            "term": normalized_query,
            "l": "english",
            "cc": "US",
        }

        response = await self._execute_with_retry(self.STORE_SEARCH_URL, params=params)
        if response is None:
            return SteamSearchResult(total=0, items=[])

        try:
            raw_data = response.json()
            raw_items = raw_data.get("items", [])[:limit]
            items = [
                SteamSearchResultItem(
                    id=item.get("id"),
                    name=item.get("name"),
                    tiny_image=item.get("tiny_image"),
                    metascore=str(item.get("metascore")) if item.get("metascore") else None,
                )
                for item in raw_items
                if item.get("id") and item.get("name")
            ]
            result = SteamSearchResult(
                total=raw_data.get("total", len(items)),
                items=items,
            )
            await self.cache.set(cache_key, result.model_dump())
            return result
        except Exception as exc:
            logger.error("Error parsing Steam search response: %s", exc)
            return SteamSearchResult(total=0, items=[])

    async def get_app_details(self, app_id: int) -> Optional[GameDetail]:
        """Fetch full game details for a given Steam AppID with caching."""
        cache_key = CacheService.make_key("steam:app", app_id)
        cached_result = await self.cache.get(cache_key)
        if cached_result is not None:
            return GameDetail.model_validate(cached_result)

        params = {
            "appids": app_id,
            "cc": "US",
            "l": "english",
        }

        response = await self._execute_with_retry(self.APP_DETAILS_URL, params=params)
        if response is None:
            return None

        try:
            payload = response.json()
            app_str = str(app_id)
            if app_str not in payload or not payload[app_str].get("success"):
                logger.info("Steam AppID %s returned success=false or missing", app_id)
                return None

            data = payload[app_str].get("data", {})
            if not data or data.get("type") not in ("game", "dlc", "demo"):
                # Still parse if game-like
                pass

            # Parse screenshots
            screenshots: List[ScreenshotItem] = []
            for sc in data.get("screenshots", []):
                screenshots.append(
                    ScreenshotItem(
                        id=sc.get("id", 0),
                        path_thumbnail=sc.get("path_thumbnail", ""),
                        path_full=sc.get("path_full", ""),
                    )
                )

            # Parse movies
            movies: List[MovieItem] = []
            for mv in data.get("movies", []):
                mp4 = mv.get("mp4", {})
                mp4_url = mp4.get("max") or mp4.get("480")
                webm = mv.get("webm", {})
                webm_url = webm.get("max") or webm.get("480")
                movies.append(
                    MovieItem(
                        id=mv.get("id", 0),
                        name=mv.get("name", "Trailer"),
                        thumbnail=mv.get("thumbnail", ""),
                        mp4_url=mp4_url,
                        webm_url=webm_url,
                    )
                )

            # Parse genres
            genres = [
                g.get("description", "")
                for g in data.get("genres", [])
                if g.get("description")
            ]

            # Parse rating
            rating: Optional[float] = None
            metacritic = data.get("metacritic")
            if metacritic and "score" in metacritic:
                try:
                    rating = float(metacritic["score"])
                except (ValueError, TypeError):
                    pass

            # Parse PC requirements
            pc_req = data.get("pc_requirements")
            pc_requirements = pc_req if isinstance(pc_req, dict) else None

            detail = GameDetail(
                id=app_id,
                steam_appid=app_id,
                title=data.get("name", f"Steam App {app_id}"),
                header_image=data.get("header_image"),
                capsule_image=data.get("capsule_image"),
                short_description=data.get("short_description"),
                detailed_description=data.get("detailed_description"),
                about_the_game=data.get("about_the_game"),
                genres=genres,
                developers=data.get("developers", []),
                publishers=data.get("publishers", []),
                release_date=data.get("release_date", {}).get("date"),
                rating=rating,
                screenshots=screenshots,
                movies=movies,
                pc_requirements=pc_requirements,
                website=data.get("website"),
                steam_url=f"https://store.steampowered.com/app/{app_id}",
            )

            await self.cache.set(cache_key, detail.model_dump())
            return detail
        except Exception as exc:
            logger.error("Error parsing Steam appdetails for %s: %s", app_id, exc)
            return None


# Global singleton instance
steam_service = SteamService()
