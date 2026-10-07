# Roadmap: Game Finder

## Overview

This roadmap guides the evolution of Game Finder from a Streamlit prototype into a full-fledged, store-inspired game discovery and personal gaming library platform. The roadmap follows a vertical MVP progression across 7 phases: extracting the Python AI backend, establishing cached metadata services, setting up Supabase authentication and database models, building the Next.js dark cinematic frontend shell and discovery hub, crafting rich media game detail pages, developing the dedicated AI Game Finder interface, and finalizing personal library management, reviews, and ranked lists.

## Phases

- [x] **Phase 1: Backend Extraction & Core AI Service** - Extract and modularize the Gemini recommendation pipeline into a FastAPI service.
- [x] **Phase 2: Game Metadata, Search & Caching Service** - Aggregate Steam Store metadata with fallbacks and implement multi-tier TTL caching.
- [x] **Phase 3: Database & Authentication** - Provision Supabase PostgreSQL schema, Row-Level Security, and JWT auth persistence.
- [ ] **Phase 4: Frontend Shell & Store Discovery Hub** - Build Next.js 15 application shell, dark cinematic design system, Hero carousel, and categorized shelves.
- [ ] **Phase 5: Game Detail Pages & Rich Media** - Implement detailed game pages with trailer video player, screenshot gallery, and metadata sidebars.
- [ ] **Phase 6: AI Game Finder Interactive Interface** - Create multi-step wizard and conversational prompt interface with 8-game recommendation cards.
- [ ] **Phase 7: Personal Library, Reviews & Ranked Lists** - Deliver user library shelves (Wishlist/Backlog/Playing/Played), ratings, reviews, Top 10 lists, and GOTY archive.

## Phase Details

### Phase 1: Backend Extraction & Core AI Service

**Goal**: Extract and modularize the Gemini recommendation pipeline into a Python FastAPI backend service with strict schema validation.
**Mode:** mvp
**Depends on**: Nothing (first phase)
**Requirements**: AI-01, AI-02, AI-03, AI-04, AI-05
**Success Criteria**:

  1. FastAPI application starts cleanly and exposes `/api/v1/recommendations` and `/health` endpoints.
  2. Recommendation endpoint returns exactly 8 structured game recommendations for valid genre, age rating, and difficulty parameters.
  3. Natural language conversational queries return structured game recommendations.
  4. Gemini API keys remain strictly server-side without leaking into client responses.

**Plans**: 3 plans

Plans:

- [x] 01-01: Initialize FastAPI project structure, dependencies, configuration, and health endpoints.
- [x] 01-02: Extract LangChain Gemini recommendation service from `Game_Finder.py` with strict Pydantic output schemas.
- [x] 01-03: Implement recommendation API routes, error handling, and automated pytest test suites.

### Phase 2: Game Metadata, Search & Caching Service

**Goal**: Aggregate game artwork and details from Steam Store API with fallbacks and implement multi-tier caching to prevent rate limits.
**Mode:** mvp
**Depends on**: Phase 1
**Requirements**: META-01, META-02, META-03, META-04
**Success Criteria**:

  1. Backend resolves high-res capsules, screenshots, and metadata from Steam Store Web API.
  2. Resilient fallback mechanism provides valid artwork and titles when external metadata is missing.
  3. Cached responses return in <50ms with zero duplicate outbound API calls for repeated queries.
  4. Global search endpoint filters by text, genre, and rating.

**Plans**: 2 plans

Plans:

- [x] 02-01: Build asynchronous Steam Store API client with multi-tier TTL caching (in-memory + database).
- [x] 02-02: Implement image fallback resolvers and global search/filter endpoints with pagination.

### Phase 3: Database & Authentication

**Goal**: Establish Supabase PostgreSQL schema, Row-Level Security, and authentication session handling.
**Mode:** mvp
**Depends on**: Phase 1
**Requirements**: AUTH-01, AUTH-02, AUTH-03, AUTH-04
**Success Criteria**:

  1. Supabase Auth allows users to sign up and log in via email and password.
  2. User session persists seamlessly across page reloads via JWT cookies.
  3. User profile records (handle, avatar, preferences) are stored in PostgreSQL.
  4. Row-Level Security policies ensure users can only modify their own library entries and reviews.

**Plans**: 2 plans

Plans:
**Wave 1**

- [x] 03-01: Define PostgreSQL schema migrations for profiles, user_games, ratings_reviews, and ranked_lists.

**Wave 2** *(blocked on Wave 1 completion)*

- [x] 03-02: Configure Supabase Auth client, SSR session cookie helpers, and RLS security policies.

### Phase 4: Frontend Shell & Store Discovery Hub

**Goal**: Construct the Next.js 15 frontend application with dark cinematic aesthetic, persistent navigation, Hero carousel, and categorized discovery shelves.
**Mode:** mvp
**Depends on**: Phase 2, Phase 3
**Requirements**: DISC-01, DISC-02, DISC-03, DISC-04, DISC-05
**Success Criteria**:

  1. Global navigation renders smoothly across desktop and mobile screen sizes.
  2. Store-style Hero carousel auto-plays and allows manual slide navigation with high-res artwork.
  3. Categorized horizontal shelves (Trending, New Releases, Top Rated, Hidden Gems) support touch and keyboard scrolling.
  4. Interactive genre tiles allow users to filter the discovery catalog by genre.

**Plans**: 3 plans

Plans:
**Wave 1**

- [x] 04-01: Initialize Next.js 15 App Router project with Tailwind CSS, Lucide icons, and dark cinematic theme.

**Wave 2** *(blocked on Wave 1 completion)*

- [x] 04-02: Implement persistent global desktop top bar and responsive mobile navigation drawer.

**Wave 3** *(blocked on Wave 2 completion)*

- [x] 04-03: Build store-style cinematic Hero carousel and categorized horizontal discovery shelves.

### Phase 5: Game Detail Pages & Rich Media

**Goal**: Build comprehensive game detail pages featuring trailer video player, screenshot carousel, system requirements, and developer metadata.
**Mode:** mvp
**Depends on**: Phase 4
**Requirements**: GAME-01, GAME-02, GAME-03, GAME-04
**Success Criteria**:

  1. Navigating to `/games/[id]` displays full metadata (release date, developer, publisher, synopsis).
  2. Embedded trailer video player streams gameplay trailers.
  3. Screenshot gallery allows browsing high-res images with thumbnail strip and lightbox.
  4. System requirements and tag badges display cleanly in responsive sidebar modules.

**Plans**: 2 plans

Plans:
**Wave 1**

- [x] 05-01: Build game detail page layout with header synopsis, developer sidebar, and system requirement modules.

**Wave 2** *(blocked on Wave 1 completion)*

- [x] 05-02: Integrate responsive trailer video player and screenshot gallery lightbox.

### Phase 6: AI Game Finder Interactive Interface

**Goal**: Deliver the dedicated AI Game Finder wizard and conversational matching interface.
**Mode:** mvp
**Depends on**: Phase 4
**Requirements**: FIND-01, FIND-02, FIND-03, FIND-04
**Success Criteria**:

  1. Multi-step wizard collects user gaming preferences (genre, mood, difficulty, age rating).
  2. Conversational prompt bar accepts freeform natural language queries.
  3. Results view renders 8 animated game cards with AI rationale, tags, and quick-save buttons.
  4. Skeleton loaders and progress states display while the AI model generates matches.

**Plans**: 2 plans

Plans:

- [x] 06-01: Build AI Game Finder wizard with preference selectors and natural language prompt input.
- [x] 06-02: Connect frontend to FastAPI recommendation API with animated 8-card results view and skeleton loading states.

### Phase 7: Personal Library, Reviews & Ranked Lists

**Goal**: Implement personal game library shelves, user star ratings, written reviews, customizable Top 10 lists, and the curated GOTY archive.
**Mode:** mvp
**Depends on**: Phase 3, Phase 5
**Requirements**: LIB-01, LIB-02, LIB-03, LIB-04, LIB-05
**Success Criteria**:

  1. Users can shelf games into Wishlist, Backlog, Currently Playing, and Played with instant optimistic UI updates.
  2. Users can assign star ratings (1-10) and write markdown reviews.
  3. User can build, reorder, and save a personal Top 10 Ranked List.
  4. Curated Game of the Year archive renders historical winners and runner-ups from 2014 to present.

**Plans**: 3 plans

Plans:

- [x] 07-01: Implement personal library views with status filters (Wishlist, Backlog, Playing, Completed) and optimistic shelving.
- [x] 07-02: Build user rating and markdown review system with aggregate score displays.
- [x] 07-03: Implement personal Top 10 ranked list builder and interactive Game of the Year archive (2014–present).

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3 → 4 → 5 → 6 → 7

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Backend Extraction & Core AI Service | 3/3 | Complete | 2026-10-06 |
| 2. Game Metadata, Search & Caching Service | 2/2 | Complete | 2026-10-06 |
| 3. Database & Authentication | 2/2 | Complete | 2026-10-07 |
| 4. Frontend Shell & Store Discovery Hub | 3/3 | Complete | 2026-10-07 |
| 5. Game Detail Pages & Rich Media | 2/2 | Complete | 2026-10-07 |
| 6. AI Game Finder Interactive Interface | 2/2 | Complete | 2026-10-07 |
| 7. Personal Library, Reviews & Ranked Lists | 3/3 | Complete | 2026-10-07 |

---
*Roadmap generated: 2026-10-06*
