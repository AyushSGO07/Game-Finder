# Phase 1: Backend Extraction & Core AI Service - Research

**Researched:** 2026-10-06  
**Domain:** Python Backend Service / FastAPI / LangChain / Google Gemini API  
**Confidence:** HIGH  

<user_constraints>
## User Constraints (from CONTEXT.md)

No user constraints - all decisions at the agent's discretion (planned without CONTEXT.md per user confirmation).

### Locked Decisions (from spec.md & STACK.md)
- Decoupled Python FastAPI backend service running asynchronously on Python 3.11+.
- Re-use and preserve the working LangChain Gemini prompt template from `prompt.json` and `Game_Finder.py`.
- Strict Pydantic output validation guaranteeing exactly 8 structured game recommendations.
- Keep `GEMINI_API_KEY` strictly server-side; never expose it to client apps.

### Discretionary Decisions
- Framework layout: Clean modular structure (`backend/app/api/`, `backend/app/core/`, `backend/app/services/`, `backend/app/schemas/`).
- Gemini Model: Support `gemini-1.5-flash` / `gemini-2.0-flash` with fallback to `gemini-1.5-pro` or existing `gemini-3.5-flash-lite` identifiers.
- Testing: `pytest` + `pytest-asyncio` with mocked Gemini chain responses for fast, deterministic testing without live API keys.

### Deferred Ideas (OUT OF SCOPE)
- Database persistence or user auth (deferred to Phase 3).
- Frontend UI rendering (deferred to Phase 4).
</user_constraints>

<architectural_responsibility_map>
## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Gemini Recommendation Pipeline | API/Backend | External AI Service | Isolate API keys, execute LangChain prompt chains, and manage LLM rate limits/retries. |
| Prompt & Schema Validation | API/Backend | — | Ensure every request and response strictly validates against Pydantic models before returning to clients. |
| Health & Diagnostics | API/Backend | — | Provide uptime and readiness probes for container deployment. |
| Configuration & Secrets | API/Backend | Environment | Keep `GEMINI_API_KEY` and CORS settings encapsulated in `pydantic-settings`. |
</architectural_responsibility_map>

<research_summary>
## Summary

Phase 1 establishes the bedrock of the Game Finder architecture by extracting the core recommendation logic from the prototype `Game_Finder.py` into a production-grade FastAPI service.

The original prototype relied on Streamlit for both presentation and execution, mixing UI sliders directly with LangChain calls. In this phase, we cleanly decouple that functionality:
1. **Core Settings & App**: `backend/app/core/config.py` using `pydantic-settings` to safely load `GEMINI_API_KEY`, API host, port, and CORS origins.
2. **Data Contracts**: `backend/app/schemas/recommendation.py` defining `RecommendationRequest` (genre, age rating, difficulty, optional freeform prompt) and `RecommendationResponse` (guaranteed list of exactly 8 `GameRecommendation` objects).
3. **Recommendation Engine**: `backend/app/services/recommendation_service.py` wrapping `GoogleGenerativeAI` and `load_prompt` with exponential backoff on HTTP 503/429 errors and JSON cleanup fallback for edge cases.
4. **API Router**: `backend/app/api/v1/recommendations.py` exposing `POST /api/v1/recommendations` and `GET /api/v1/health`.
5. **Automated Verification**: Pytest suite validating input boundaries, schema outputs, error propagation, and mock-based LLM generation.
</research_summary>

## Standard Technology Stack

| Library | Version | Purpose | Why Recommended |
|---------|---------|---------|-----------------|
| `fastapi` | 0.115+ | Web Framework | Native async support, automatic OpenAPI/Swagger docs, high performance. |
| `uvicorn` | 0.32+ | ASGI Web Server | Standard production-ready ASGI server for FastAPI. |
| `pydantic` | 2.9+ | Data Validation | High-speed Rust-core serialization and schema enforcement. |
| `pydantic-settings` | 2.5+ | Config Management | Type-safe environment variable parsing with `.env` support. |
| `langchain-google-genai` | 2.0+ / 0.2+ | Gemini Integration | Direct wrapper for Google Gemini models compatible with existing `prompt.json`. |
| `pytest` & `pytest-asyncio` | Latest | Testing | Standard asynchronous Python unit and endpoint testing. |
| `httpx` | 0.27+ | Async HTTP Client | Used by FastAPI `TestClient` and future external API calls. |

## Validation Architecture

Nyquist sampling requires test infrastructure that can run quickly after each plan task commit.

### Testing Strategy
- **Framework**: `pytest` + `pytest-asyncio`
- **Location**: `backend/tests/`
- **Unit Tests**:
  - `test_schemas.py`: Validates Pydantic schema validation for genre, difficulty, age rating, and 8-game constraints.
  - `test_recommendation_service.py`: Mocks `GoogleGenerativeAI` to test successful parsing, markdown-stripped JSON parsing, and retry logic on 503 errors.
  - `test_api.py`: Tests `/api/v1/health` and `/api/v1/recommendations` endpoints using FastAPI TestClient.
- **Quick Run Command**: `pytest backend/tests/test_schemas.py` (~1 sec)
- **Full Suite Command**: `pytest backend/tests/` (~3 sec)
