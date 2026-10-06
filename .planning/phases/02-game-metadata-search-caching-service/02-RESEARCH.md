# Phase 2: Game Metadata, Search & Caching Service - Research

**Researched:** 2026-10-06  
**Domain:** External Game Metadata Aggregation / Steam Web API / Asynchronous Caching / Search  
**Confidence:** HIGH  

<user_constraints>
## User Constraints (from CONTEXT.md)

No user constraints - all decisions at the agent's discretion (planned without CONTEXT.md per user confirmation).

### Locked Decisions (from spec.md & STACK.md)
- Use Steam Store Web API (`storesearch` and `appdetails`) as primary metadata provider.
- Provide reliable multi-tier image fallbacks (Wikipedia pageimages, curated placeholders, UI avatars) so cards are never blank.
- Multi-tier TTL caching (in-memory `cachetools.TTLCache` + persistent cache structure) to eliminate HTTP 429 rate limit errors.
- Never expose raw third-party API errors or exceptions to clients.

### Discretionary Decisions
- HTTP client: `httpx.AsyncClient` with connection pooling, configurable timeout (5s), and retry policies.
- In-memory cache: `cachetools.TTLCache` (maxsize=1000, ttl=3600 seconds) for hot game cards.
- Search API: debounced search endpoint supporting keyword text, genre filters, and pagination.
- Enrichment pipeline: Asynchronous batch enrichment using `asyncio.gather` with concurrency limits (`asyncio.Semaphore(5)`).
</user_constraints>

<architectural_responsibility_map>
## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Steam Store API Client | API/Backend | External API | Asynchronously query Steam search and appdetails with request pooling. |
| In-Memory TTL Caching | API/Backend | Memory | Cache external metadata responses to guarantee sub-50ms repeat latency and prevent 429 rate limits. |
| Fallback Media Resolver | API/Backend | External API | Resolve artwork from Wikipedia or title-based avatars when Steam lacks records. |
| Game Search & Filtering | API/Backend | Cache | Search across cached games and Steam catalog with genre filtering and pagination. |
</architectural_responsibility_map>

<research_summary>
## Summary

Phase 2 builds the game metadata aggregation and search engine for Game Finder. It transforms raw recommendation titles from Phase 1 into rich, visual gaming cards featuring high-resolution capsules, screenshots, developer credits, and trailer previews.

The Steam Store Web API provides public, unauthenticated endpoints:
1. `https://store.steampowered.com/api/storesearch/?term={query}&l=english&cc=US` - Resolves search queries to Steam AppIDs.
2. `https://store.steampowered.com/api/appdetails?appids={appid}&cc=US&l=english` - Full game details including `header_image`, `screenshots`, `movies`, `genres`, and system specs.

Because Steam enforces rate limits, live querying on every request is an anti-pattern. We implement an asynchronous client (`SteamClient`) backed by `cachetools.TTLCache` and provide multi-tiered fallbacks (Wikipedia media API + SVG/avatar generation) to ensure 100% visual uptime.
</research_summary>

## Standard Technology Stack

| Library | Version | Purpose | Why Recommended |
|---------|---------|---------|-----------------|
| `httpx` | 0.28+ | Async HTTP Client | Native async/await support, connection pooling, and SSL verification. |
| `cachetools` | 5.5+ | In-Memory Caching | High-performance thread-safe and async TTL/LRU caches. |
| `pydantic` | 2.13+ | Schema Validation | Data contracts for `GameCard`, `GameDetail`, and `SearchResult`. |
| `pytest` | 9.x | Test Runner | Mocking external HTTP requests with `respx` or `unittest.mock`. |

## Validation Architecture

### Testing Strategy
- **Framework**: `pytest` + `pytest-asyncio`
- **Location**: `backend/tests/`
- **Unit & Integration Tests**:
  - `test_steam_client.py`: Verifies search and appdetails parsing, error handling, and 429 backoff using mocked HTTP responses.
  - `test_cache_service.py`: Verifies cache hit/miss behavior, TTL expiration, and duplicate call deduplication.
  - `test_games_api.py`: Tests `/api/v1/games/search` and `/api/v1/games/{id}` routes using `TestClient`.
- **Quick Run Command**: `pytest backend/tests/test_cache_service.py` (~1 sec)
- **Full Suite Command**: `pytest backend/tests/` (~3 sec)
