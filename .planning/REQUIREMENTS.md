# Requirements: Game Finder

**Defined:** 2026-10-06  
**Core Value:** Discover the perfect game to play next through intelligent AI recommendations and rich game exploration, seamlessly integrated with personal gaming library tracking.

## v1 Requirements

Requirements for the initial production release. Each requirement maps directly to roadmap phases.

### AI Recommendation Engine (AI)

- [x] **AI-01**: Backend extracts and encapsulates Gemini recommendation logic from `Game_Finder.py` into a modular Python FastAPI service.
- [x] **AI-02**: Recommendation service accepts genre, age rating, and difficulty parameters and returns structured recommendations.
- [x] **AI-03**: Recommendation response validates against a strict Pydantic schema guaranteeing 8 structured game recommendations.
- [x] **AI-04**: Backend securely manages `GEMINI_API_KEY` on the server without exposing keys to web clients.
- [x] **AI-05**: Backend supports natural language conversational prompts (e.g., "story-rich RPGs with relaxing atmosphere").

### Game Metadata & Caching Service (META)

- [ ] **META-01**: Backend fetches game capsules, trailers, screenshots, and metadata from Steam Store Web API.
- [ ] **META-02**: Backend provides verified high-resolution fallback artwork and metadata when Steam data is unavailable.
- [ ] **META-03**: Multi-tier TTL caching (in-memory LRU + database cache) prevents third-party API rate limits (HTTP 429).
- [ ] **META-04**: Global game search endpoint supports debounced text queries, genre filters, and rating sorting.

### Database & Authentication (AUTH)

- [ ] **AUTH-01**: User can sign up, log in, and log out using Supabase Auth (email/password).
- [ ] **AUTH-02**: User session persists across browser reloads via secure JWT tokens and Supabase SSR cookies.
- [ ] **AUTH-03**: User profile manages gamer handle, avatar, bio, and gaming preferences in PostgreSQL.
- [ ] **AUTH-04**: Database enforces Row-Level Security (RLS) on all user-owned records (libraries, reviews, ranked lists).

### Frontend Shell & Store Discovery Hub (DISC)

- [ ] **DISC-01**: Persistent dark-themed global navigation bar with links to Home, Discover, Game Finder, GOTY, and My Library.
- [ ] **DISC-02**: Responsive mobile navigation with compact header and slide-out navigation drawer / bottom bar.
- [ ] **DISC-03**: Store-style Hero carousel with cinematic artwork, game title, tags, rating badge, and quick-action CTAs.
- [ ] **DISC-04**: Categorized horizontal game carousels for Trending, New Releases, Top Rated, and Hidden Gems with smooth scrolling and keyboard controls.
- [ ] **DISC-05**: Genre browsing hub displaying interactive tiles for major gaming genres (Action, RPG, Strategy, Indie, etc.).

### Game Detail & Rich Media Experience (GAME)

- [ ] **GAME-01**: Complete game detail page displaying title, release date, developer, publisher, and synopsis.
- [ ] **GAME-02**: Embedded video player supporting game trailers and teaser previews.
- [ ] **GAME-03**: Screenshot gallery with responsive thumbnail strip and fullscreen lightbox preview.
- [ ] **GAME-04**: Metadata sidebar displaying tags, genre badges, PC system requirements, and external store links.

### AI Game Finder Interactive Interface (FIND)

- [ ] **FIND-01**: Dedicated Game Finder wizard with step-by-step preference selection (genre, mood, age rating, difficulty).
- [ ] **FIND-02**: Conversational query input allowing natural language prompt matching.
- [ ] **FIND-03**: Results view displaying exactly 8 rich game cards with AI rationale, tags, and quick-save buttons.
- [ ] **FIND-04**: Polished loading state with animated skeletons and progress feedback during AI generation.

### Personal Library, Reviews & Ranked Lists (LIB)

- [ ] **LIB-01**: User can save games to status shelves: Wishlist, Backlog, Currently Playing, and Completed/Played.
- [ ] **LIB-02**: Optimistic UI updates ensure instant library actions with background server sync and error rollback.
- [ ] **LIB-03**: User can assign personal star ratings (1-10) and write markdown reviews for games.
- [ ] **LIB-04**: User can build and curate a personal ranked Top 10 games list.
- [ ] **LIB-05**: Curated Game of the Year (GOTY) interactive archive displaying winners and runner-ups from 2014 to present.

## v2 Requirements

Deferred to future releases. Tracked but not in current roadmap.

### Social & Community

- **SOC-01**: Public gamer profile sharing with unique vanity URLs (`/user/[handle]`).
- **SOC-02**: Following friends to view their activity feed and recent reviews.
- **SOC-03**: Upvoting and commenting on community reviews.

### Integrations

- **INT-01**: Steam OAuth account linking to automatically import owned games and achievements.
- **INT-02**: Direct price tracking and discount alerts via IsThereAnyDeal / CheapShark APIs.

## Out of Scope

Explicitly excluded. Documented to prevent scope creep.

| Feature | Reason |
|---------|--------|
| Direct digital game sales / checkout | Game Finder is a discovery and tracking platform; handling payments, keys, and DRM adds extreme regulatory and technical overhead. |
| Real-time multiplayer voice/text chat | High infrastructure cost, moderation burden, and distracts from core discovery experience. |
| Pixel-by-pixel Steam UI clone | Violates copyright/trademarks; Game Finder maintains its own original, modern dark aesthetic. |
| Client-side direct LLM API calls | Critical security violation; all AI inference must stay behind the FastAPI proxy. |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| AI-01 | Phase 1 | Complete |
| AI-02 | Phase 1 | Complete |
| AI-03 | Phase 1 | Complete |
| AI-04 | Phase 1 | Complete |
| AI-05 | Phase 1 | Complete |
| META-01 | Phase 2 | Pending |
| META-02 | Phase 2 | Pending |
| META-03 | Phase 2 | Pending |
| META-04 | Phase 2 | Pending |
| AUTH-01 | Phase 3 | Pending |
| AUTH-02 | Phase 3 | Pending |
| AUTH-03 | Phase 3 | Pending |
| AUTH-04 | Phase 3 | Pending |
| DISC-01 | Phase 4 | Pending |
| DISC-02 | Phase 4 | Pending |
| DISC-03 | Phase 4 | Pending |
| DISC-04 | Phase 4 | Pending |
| DISC-05 | Phase 4 | Pending |
| GAME-01 | Phase 5 | Pending |
| GAME-02 | Phase 5 | Pending |
| GAME-03 | Phase 5 | Pending |
| GAME-04 | Phase 5 | Pending |
| FIND-01 | Phase 6 | Pending |
| FIND-02 | Phase 6 | Pending |
| FIND-03 | Phase 6 | Pending |
| FIND-04 | Phase 6 | Pending |
| LIB-01 | Phase 7 | Pending |
| LIB-02 | Phase 7 | Pending |
| LIB-03 | Phase 7 | Pending |
| LIB-04 | Phase 7 | Pending |
| LIB-05 | Phase 7 | Pending |

**Coverage:**
- v1 requirements: 31 total
- Mapped to phases: 31
- Unmapped: 0 ✓

---
*Requirements defined: 2026-10-06*  
*Last updated: 2026-10-06 after initialization*
