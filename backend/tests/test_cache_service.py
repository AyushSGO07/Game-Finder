"""Unit tests for asynchronous TTL CacheService."""

import asyncio
import pytest
from backend.app.services.cache_service import CacheService


@pytest.mark.asyncio
async def test_cache_set_and_get():
    """Test standard cache hit and miss."""
    cache = CacheService(maxsize=10, ttl=60)
    key = CacheService.make_key("game", 1091500)
    assert key == "game:1091500"

    # Initial miss
    val = await cache.get(key)
    assert val is None

    # Set value
    await cache.set(key, {"title": "Cyberpunk 2077"})

    # Hit
    val = await cache.get(key)
    assert val == {"title": "Cyberpunk 2077"}

    # Verify stats
    stats = await cache.stats()
    assert stats["hits"] == 1
    assert stats["misses"] == 1
    assert stats["currsize"] == 1
    assert stats["hit_rate"] == 0.5


@pytest.mark.asyncio
async def test_cache_delete_and_clear():
    """Test delete and clear methods."""
    cache = CacheService(maxsize=10, ttl=60)
    key1 = CacheService.make_key("test", 1)
    key2 = CacheService.make_key("test", 2)

    await cache.set(key1, "value1")
    await cache.set(key2, "value2")

    deleted = await cache.delete(key1)
    assert deleted is True
    assert await cache.get(key1) is None

    not_deleted = await cache.delete("non_existent_key")
    assert not_deleted is False

    await cache.clear()
    stats = await cache.stats()
    assert stats["currsize"] == 0
    assert stats["hits"] == 0
    assert stats["misses"] == 0


@pytest.mark.asyncio
async def test_cache_ttl_expiration():
    """Test that items expire when their TTL passes."""
    # Use a 0.1-second TTL
    cache = CacheService(maxsize=10, ttl=0.1)
    key = "expiring_key"
    await cache.set(key, "data")

    # Immediate get should hit
    assert await cache.get(key) == "data"

    # Wait for TTL to expire
    await asyncio.sleep(0.15)

    # After expiry, should miss
    assert await cache.get(key) == None


@pytest.mark.asyncio
async def test_cache_concurrency():
    """Test concurrent reads and writes with asyncio.gather."""
    cache = CacheService(maxsize=100, ttl=60)

    async def write_read(i: int):
        k = CacheService.make_key("concurrency", i)
        await cache.set(k, f"val-{i}")
        res = await cache.get(k)
        assert res == f"val-{i}"

    tasks = [write_read(i) for i in range(50)]
    await asyncio.gather(*tasks)

    stats = await cache.stats()
    assert stats["currsize"] == 50
    assert stats["hits"] == 50
