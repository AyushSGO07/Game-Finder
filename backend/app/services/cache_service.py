"""In-memory asynchronous TTL cache service backed by cachetools."""

import asyncio
from typing import Any, Dict, Optional, Union
from cachetools import TTLCache


class CacheService:
    """Thread-safe and async-safe in-memory TTL cache manager."""

    def __init__(self, maxsize: int = 1000, ttl: int = 3600) -> None:
        """Initialize TTLCache with max size and default TTL (in seconds)."""
        self._maxsize = maxsize
        self._ttl = ttl
        self._cache: TTLCache = TTLCache(maxsize=maxsize, ttl=ttl)
        self._lock = asyncio.Lock()
        self._hits: int = 0
        self._misses: int = 0

    @staticmethod
    def make_key(namespace: str, identifier: Union[str, int]) -> str:
        """Generate a normalized cache key from namespace and identifier."""
        clean_ns = str(namespace).strip().lower()
        clean_id = str(identifier).strip().lower()
        return f"{clean_ns}:{clean_id}"

    async def get(self, key: str) -> Optional[Any]:
        """Retrieve value by key. Increments hits or misses counter."""
        async with self._lock:
            if key in self._cache:
                self._hits += 1
                return self._cache[key]
            self._misses += 1
            return None

    async def set(self, key: str, value: Any) -> None:
        """Store value by key in cache."""
        async with self._lock:
            self._cache[key] = value

    async def delete(self, key: str) -> bool:
        """Delete key from cache if present."""
        async with self._lock:
            if key in self._cache:
                del self._cache[key]
                return True
            return False

    async def clear(self) -> None:
        """Clear all entries from cache and reset hit/miss counters."""
        async with self._lock:
            self._cache.clear()
            self._hits = 0
            self._misses = 0

    async def stats(self) -> Dict[str, Any]:
        """Return cache health and usage statistics."""
        async with self._lock:
            total_requests = self._hits + self._misses
            hit_rate = (self._hits / total_requests) if total_requests > 0 else 0.0
            return {
                "hits": self._hits,
                "misses": self._misses,
                "total_requests": total_requests,
                "hit_rate": round(hit_rate, 4),
                "currsize": len(self._cache),
                "maxsize": self._maxsize,
                "ttl": self._ttl,
            }


# Global singleton instance for application use
game_cache = CacheService(maxsize=1000, ttl=3600)
