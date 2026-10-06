---
phase: 1
slug: backend-extraction-core-ai-service
status: draft
nyquist_compliant: true
wave_0_complete: false
created: 2026-10-06
---

# Phase 1 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | pytest 8.x + pytest-asyncio |
| **Config file** | `backend/pyproject.toml` or `backend/pytest.ini` |
| **Quick run command** | `pytest backend/tests/test_schemas.py` |
| **Full suite command** | `pytest backend/tests/` |
| **Estimated runtime** | ~2-3 seconds |

---

## Sampling Rate

- **After every task commit:** Run `pytest backend/tests/test_schemas.py`
- **After every plan wave:** Run `pytest backend/tests/`
- **Before `/gsd-verify-work`:** Full suite must be green
- **Max feedback latency:** 5 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 1-01-01 | 01 | 1 | AI-01 | T-1-01 | Encapsulate env vars and dependencies cleanly | integration | `python -m pytest backend/tests/test_health.py` | ❌ W0 | ⬜ pending |
| 1-01-02 | 01 | 1 | AI-03 | T-1-02 | Input boundaries and 8-game count schema constraints enforced | unit | `python -m pytest backend/tests/test_schemas.py` | ❌ W0 | ⬜ pending |
| 1-02-01 | 02 | 2 | AI-01 | T-1-03 | Gemini credentials securely loaded from environment only | unit | `python -m pytest backend/tests/test_recommendation_service.py -k test_config` | ❌ W0 | ⬜ pending |
| 1-02-02 | 02 | 2 | AI-02 | T-1-04 | Valid structured prompt formatted with correct input parameters | unit | `python -m pytest backend/tests/test_recommendation_service.py -k test_prompt_format` | ❌ W0 | ⬜ pending |
| 1-02-03 | 02 | 2 | AI-03 | T-1-05 | Mocked LLM response parsed into exactly 8 validated game records | unit | `python -m pytest backend/tests/test_recommendation_service.py -k test_generate_recommendations` | ❌ W0 | ⬜ pending |
| 1-03-01 | 03 | 3 | AI-04 | T-1-06 | Never expose API keys or raw internal tracebacks in error responses | security | `python -m pytest backend/tests/test_api.py -k test_error_handling` | ❌ W0 | ⬜ pending |
| 1-03-02 | 03 | 3 | AI-05 | T-1-07 | Natural language queries handled without prompt injection / syntax crashes | integration | `python -m pytest backend/tests/test_api.py -k test_natural_language` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `backend/requirements.txt` / `backend/pyproject.toml` — packages installed (fastapi, uvicorn, pydantic, langchain-google-genai, pytest, pytest-asyncio, httpx)
- [ ] `backend/tests/conftest.py` — shared fixtures and mock LLM helpers
- [ ] `backend/tests/test_health.py` — health check stub
- [ ] `backend/tests/test_schemas.py` — schema validation stubs

---

## Manual-Only Verifications

| Behavior | Why Manual | Verification Method |
|----------|------------|---------------------|
| Live Gemini API call | Requires valid user GEMINI_API_KEY with quota | Run interactive CLI script `python backend/scripts/test_live_gemini.py` when key is present |
