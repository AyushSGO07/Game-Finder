# Phase 3: Database & Authentication - Research

**Researched:** 2026-10-07  
**Domain:** Supabase PostgreSQL / Row-Level Security / Supabase Auth / JWT Session Management / FastAPI Auth Integration  
**Confidence:** HIGH  

<user_constraints>
## User Constraints (from CONTEXT.md)

No user constraints - all decisions at the agent's discretion (planned without CONTEXT.md per user confirmation).

### Locked Decisions (from spec.md & STACK.md)
- Primary database & authentication platform: **PostgreSQL via Supabase** with Row-Level Security (RLS) enabled on all user-owned tables.
- Authentication provider: **Supabase Auth** (email/password signup, login, session JWT tokens).
- Session persistence: JWT tokens with client storage / secure cookies allowing uninterrupted session restoration across page reloads.
- User profile records: gamer handle/username, display name, avatar, bio, gaming preferences, and privacy toggles (`is_public`, `show_library`, `show_favorites`, `show_reviews`, `show_rankings`).
- Personal library tracking: status shelves (`wishlist`, `backlog`, `playing`, `completed`, `dropped`), personal star rating (1-10), personal rank, playtime hours, and notes.
- Reviews & rankings: user ratings and written markdown reviews, personal Top 10 list structure, and Game of the Year (GOTY) historical archive (2014–present).

### Discretionary Decisions
- **Migration Architecture**: Versioned SQL migration scripts located in `supabase/migrations/` (`20261007000000_initial_schema.sql`, `20261007000001_rls_policies.sql`, `20261007000002_triggers_and_seed.sql`).
- **Profile Auto-Provisioning**: PostgreSQL `after insert` trigger on `auth.users` automatically inserts default profile row into `public.profiles`.
- **Backend Auth Dependency**: FastAPI authentication dependency (`get_current_user`, `get_optional_user`) in `backend/app/core/auth.py` that decodes and validates Supabase JWTs with fallback to mocked auth for deterministic unit tests.
- **Client & Service Integration**: Asynchronous Supabase service wrapper (`backend/app/services/supabase_service.py`) supporting credentials from `SUPABASE_URL` and `SUPABASE_ANON_KEY` / `SUPABASE_SERVICE_ROLE_KEY`.
- **API Endpoints**: Full auth and user library endpoints under `/api/v1/auth` and `/api/v1/me` following REST standards.
</user_constraints>

<architectural_responsibility_map>
## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| PostgreSQL Schema & Migrations | Supabase DB | Local SQL | Enforces relational integrity, foreign keys, unique constraints, and enum validations. |
| Row-Level Security (RLS) | Supabase DB | PostgreSQL | Guarantees data isolation at the database layer so users can only write to their own resources. |
| User Authentication & Sessions | Supabase Auth | FastAPI Backend | Handles password hashing, token issuance, password resets, and session renewal. |
| JWT Verification & Access Control | API/Backend | Supabase Auth | Validates Bearer tokens on protected FastAPI routes (`/api/v1/me/*`) and injects current user context. |
| Profile & Library Management | API/Backend | Supabase DB | Exposes endpoints for managing profiles, shelf items, personal ratings, and ranked lists. |
</architectural_responsibility_map>

<research_summary>
## Summary

Phase 3 establishes the database persistence and authentication infrastructure for Game Finder. It transforms Game Finder from a stateless recommendation and search tool into a personalized gaming platform capable of user accounts, personal libraries, reviews, and custom rankings.

The core components consist of:
1. **Relational Database Schema**: Structured tables in PostgreSQL for `profiles`, `games`, `game_media`, `user_games`, `reviews`, `ranked_lists`, and `goty_winners`.
2. **PostgreSQL Triggers**: Automatic profile provisioning triggered whenever a new user registers in Supabase Auth.
3. **Row-Level Security (RLS)**: Fine-grained security policies on all tables ensuring users can only mutate their own library entries and reviews while honoring privacy toggles (`is_public`, `show_library`, `show_rankings`) for read access.
4. **FastAPI Auth & Session Integration**: Pydantic schemas, JWT decoding dependencies, and REST endpoints for user registration, login, profile updates, and library mutations with offline/mock test compatibility.
</research_summary>

## Standard Technology Stack

| Library / Tool | Version | Purpose | Why Recommended |
|----------------|---------|---------|-----------------|
| `supabase` | 2.10+ | Supabase Python SDK | Official SDK for interacting with Supabase Auth, PostgREST, and database storage. |
| `pyjwt[crypto]` | 2.9+ | JWT Token Decoding & Verification | Validates Supabase JWT signature, expiration, and user claims in FastAPI dependencies. |
| `pydantic` | 2.9+ | Data Contract Validation | Strict validation for auth payloads, profile models, and library mutation bodies. |
| `fastapi` | 0.115+ | Protected Route Handlers | HTTP bearer authentication, dependency injection (`Depends`), and automatic OpenAPI docs. |
| `pytest` & `pytest-asyncio` | Latest | Test Automation | Mocked Supabase client and JWT fixtures for deterministic, offline testing. |

## Database Schema Design

### 1. `profiles`
- `id`: UUID primary key references `auth.users(id)` ON DELETE CASCADE
- `username`: TEXT UNIQUE NOT NULL
- `display_name`: TEXT
- `avatar_url`: TEXT
- `bio`: TEXT
- `favorite_genres`: TEXT[] DEFAULT '{}'
- `preferred_platforms`: TEXT[] DEFAULT '{}'
- `default_difficulty`: TEXT DEFAULT 'medium'
- `default_age_rating`: TEXT DEFAULT 'T'
- `is_public`: BOOLEAN DEFAULT true
- `show_library`: BOOLEAN DEFAULT true
- `show_favorites`: BOOLEAN DEFAULT true
- `show_reviews`: BOOLEAN DEFAULT true
- `show_rankings`: BOOLEAN DEFAULT true
- `created_at`: TIMESTAMPTZ DEFAULT NOW()
- `updated_at`: TIMESTAMPTZ DEFAULT NOW()

### 2. `games`
- `id`: UUID PRIMARY KEY DEFAULT gen_random_uuid()
- `external_id`: TEXT (Steam AppID or IGDB ID)
- `slug`: TEXT UNIQUE NOT NULL
- `title`: TEXT NOT NULL
- `description`: TEXT
- `short_description`: TEXT
- `cover_url`: TEXT
- `hero_url`: TEXT
- `logo_url`: TEXT
- `release_date`: TEXT
- `developer`: TEXT
- `publisher`: TEXT
- `platforms`: TEXT[] DEFAULT '{}'
- `genres`: TEXT[] DEFAULT '{}'
- `tags`: TEXT[] DEFAULT '{}'
- `store_url`: TEXT
- `metadata_source`: TEXT DEFAULT 'steam'
- `created_at`: TIMESTAMPTZ DEFAULT NOW()
- `updated_at`: TIMESTAMPTZ DEFAULT NOW()

### 3. `game_media`
- `id`: UUID PRIMARY KEY DEFAULT gen_random_uuid()
- `game_id`: UUID NOT NULL REFERENCES games(id) ON DELETE CASCADE
- `media_type`: TEXT NOT NULL CHECK (media_type IN ('screenshot', 'trailer', 'artwork', 'logo'))
- `url`: TEXT NOT NULL
- `thumbnail_url`: TEXT
- `sort_order`: INTEGER DEFAULT 0

### 4. `user_games`
- `id`: UUID PRIMARY KEY DEFAULT gen_random_uuid()
- `user_id`: UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE
- `game_id`: UUID NOT NULL REFERENCES games(id) ON DELETE CASCADE
- `is_favorite`: BOOLEAN DEFAULT false
- `is_wishlisted`: BOOLEAN DEFAULT false
- `status`: TEXT CHECK (status IN ('wishlist', 'backlog', 'playing', 'completed', 'dropped'))
- `personal_rating`: INTEGER CHECK (personal_rating BETWEEN 1 AND 10)
- `personal_rank`: INTEGER
- `playtime_hours`: NUMERIC DEFAULT 0
- `notes`: TEXT
- `started_at`: TIMESTAMPTZ
- `completed_at`: TIMESTAMPTZ
- `created_at`: TIMESTAMPTZ DEFAULT NOW()
- `updated_at`: TIMESTAMPTZ DEFAULT NOW()
- UNIQUE(user_id, game_id)

### 5. `reviews`
- `id`: UUID PRIMARY KEY DEFAULT gen_random_uuid()
- `user_id`: UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE
- `game_id`: UUID NOT NULL REFERENCES games(id) ON DELETE CASCADE
- `rating`: INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 10)
- `title`: TEXT
- `body`: TEXT
- `created_at`: TIMESTAMPTZ DEFAULT NOW()
- `updated_at`: TIMESTAMPTZ DEFAULT NOW()
- UNIQUE(user_id, game_id)

### 6. `ranked_lists`
- `id`: UUID PRIMARY KEY DEFAULT gen_random_uuid()
- `user_id`: UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE
- `title`: TEXT DEFAULT 'My Top 10'
- `rank_positions`: JSONB NOT NULL DEFAULT '[]'::jsonb
- `created_at`: TIMESTAMPTZ DEFAULT NOW()
- `updated_at`: TIMESTAMPTZ DEFAULT NOW()

### 7. `goty_winners`
- `id`: UUID PRIMARY KEY DEFAULT gen_random_uuid()
- `year`: INTEGER NOT NULL UNIQUE
- `game_id`: UUID REFERENCES games(id) ON DELETE CASCADE
- `award_name`: TEXT NOT NULL
- `source`: TEXT DEFAULT 'The Game Awards'
- `created_at`: TIMESTAMPTZ DEFAULT NOW()

## Row-Level Security (RLS) Strategy

- **`profiles`**:
  - `SELECT`: `is_public = true OR auth.uid() = id`
  - `INSERT`: `auth.uid() = id`
  - `UPDATE`: `auth.uid() = id`
  - `DELETE`: `auth.uid() = id`
- **`games` & `game_media` & `goty_winners`**:
  - `SELECT`: Public access (`true`)
  - `INSERT` / `UPDATE` / `DELETE`: Restrict to `service_role`
- **`user_games`**:
  - `SELECT`: `auth.uid() = user_id OR EXISTS (SELECT 1 FROM profiles WHERE profiles.id = user_games.user_id AND profiles.show_library = true AND profiles.is_public = true)`
  - `INSERT` / `UPDATE` / `DELETE`: `auth.uid() = user_id`
- **`reviews`**:
  - `SELECT`: Public access (`true`)
  - `INSERT` / `UPDATE` / `DELETE`: `auth.uid() = user_id`
- **`ranked_lists`**:
  - `SELECT`: `auth.uid() = user_id OR EXISTS (SELECT 1 FROM profiles WHERE profiles.id = ranked_lists.user_id AND profiles.show_rankings = true AND profiles.is_public = true)`
  - `INSERT` / `UPDATE` / `DELETE`: `auth.uid() = user_id`

## Validation Architecture

### Testing Strategy
- **Framework**: `pytest` + `pytest-asyncio`
- **Location**: `backend/tests/`
- **Unit & Integration Tests**:
  - `test_auth_schemas.py`: Validates Pydantic schemas for user signup, login, profile updates, and library mutations.
  - `test_auth_service.py`: Mocks Supabase client, verifying JWT token decoding, claims extraction, and unauthorized error propagation.
  - `test_auth_api.py`: Tests `/api/v1/auth/register`, `/api/v1/auth/login`, and `/api/v1/auth/me` endpoints using `TestClient`.
  - `test_library_api.py`: Tests `/api/v1/me/library`, `/api/v1/me/favorites`, and `/api/v1/me/rankings` with authenticated mock tokens.
  - `test_schema_sql.py`: Verifies SQL migration syntax, table completeness, constraint definitions, and RLS policy rules.
- **Quick Run Command**: `python -m pytest backend/tests/test_auth_schemas.py` (~1 sec)
- **Full Suite Command**: `python -m pytest backend/tests/` (~4 sec)
