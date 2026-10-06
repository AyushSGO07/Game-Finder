---
phase: 2
slug: game-metadata-search-caching-service
status: ready
nyquist_compliant: true
wave_0_complete: false
created: 2026-10-06
---

# Phase 2 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | pytest 8.x+ + pytest-asyncio |
| **Config file** | `backend/pyproject.toml` or `backend/pytest.ini` |
| **Quick run command** | `python -m pytest backend/tests/test_cache_service.py` |
| **Full suite command** | `python -m pytest backend/tests/` |
| **Estimated runtime** | ~3-4 seconds |

---

## Sampling Rate

- **After every task commit:** Run targeted unit test suite
- **After every plan wave:** Run full test suite `python -m pytest backend/tests/`
- **Before `/gsd-verify-work`:** Full suite must be green
- **Max feedback latency:** 5 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 2-01-01 | 01 | 1 | META-03 | T-2-01 | In-memory TTL cache prevents duplicate network requests and bounds memory | unit | `python -m pytest backend/tests/test_cache_service.py` | ✅ Yes | ✅ green |
| 2-01-02 | 01 | 1 | META-01 | T-2-02 | Schema contracts validate game capsules, details, and search responses | unit | `python -m pytest backend/tests/test_game_schemas.py` | ✅ Yes | ✅ green |
| 2-01-03 | 01 | 1 | META-01, META-03 | T-2-03 | Steam client handles 429 rate limits, timeouts, and malformed responses safely | integration | `python -m pytest backend/tests/test_steam_service.py` | ✅ Yes | ✅ green |
| 2-02-01 | 02 | 2 | META-02 | T-2-04 | Fallback service resolves verified high-res artwork or placeholders when Steam data lacks | unit | `python -m pytest backend/tests/test_fallback_service.py` | ✅ Yes | ✅ green |
| 2-02-02 | 02 | 2 | META-01, META-02 | T-2-05 | Batch enrichment bounds concurrency with Semaphore and merges fallbacks seamlessly | unit | `python -m pytest backend/tests/test_game_service.py` | ✅ Yes | ✅ green |
| 2-02-03 | 02 | 2 | META-04 | T-2-06 | Search and details API routes sanitize query params and return sub-50ms cached responses | integration | `python -m pytest backend/tests/test_games_api.py` | ✅ Yes | ✅ green |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [x] `backend/tests/test_cache_service.py` — Cache behavior stubs
- [x] `backend/tests/test_game_schemas.py` — Schema validation stubs
- [x] `backend/tests/test_steam_service.py` — Mock Steam API stubs
- [x] `backend/tests/test_fallback_service.py` — Fallback resolver stubs
- [x] `backend/tests/test_games_api.py` — Game API route stubs

---

## Manual-Only Verifications

| Behavior | Why Manual | Verification Method |
|----------|------------|---------------------|
| Live Steam Store API query | Steam Store API can be rate-limited or blocked from non-US IPs | Run interactive script `python backend/scripts/test_live_steam.py` with real query |
