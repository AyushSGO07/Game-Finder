# Phase 7: Personal Library, Reviews & Ranked Lists - Research

**Researched:** 2026-10-07  
**Domain:** Personal Game Library / Optimistic UI / Star Ratings / Markdown Reviews / Top 10 Ranked List / GOTY Archive / Supabase & FastAPI Integration  
**Confidence:** HIGH  

<user_constraints>
## User Constraints (from REQUIREMENTS.md & ROADMAP.md)

- **Requirements Covered**:
  - `LIB-01`: User can save games to status shelves: Wishlist, Backlog, Currently Playing, and Completed/Played.
  - `LIB-02`: Optimistic UI updates ensure instant library actions with background server sync and error rollback.
  - `LIB-03`: User can assign personal star ratings (1-10) and write markdown reviews for games.
  - `LIB-04`: User can build and curate a personal ranked Top 10 games list.
  - `LIB-05`: Curated Game of the Year (GOTY) interactive archive displaying winners and runner-ups from 2014 to present.
- **Frontend Architecture**:
  - Next.js 15 App Router pages:
    - `/library` (`frontend/src/app/library/page.tsx`): Personal Library dashboard with shelves, status tabs, search/sort, and Top 10 curator.
    - `/goty` (`frontend/src/app/goty/page.tsx`): Curated Game of the Year Archive (2014–2024) with interactive timeline and nominee showcases.
    - `/games/[id]` (`frontend/src/app/games/[id]/page.tsx`): Updated to feature active shelf switcher and interactive reviews section.
  - Dark cinematic visual system (`#090a0f` canvas, `#111420` surface, glassmorphism containers, indigo/amber/emerald accents).
  - Framer Motion for smooth tab transitions, shelf switches, and modal reveals.
  - Lucide React icons (`Bookmark`, `CheckCircle2`, `Clock`, `Sparkles`, `Trophy`, `Star`, `Heart`, `Trash2`, `Edit3`, `SlidersHorizontal`, etc.).
- **Backend Architecture**:
  - FastAPI endpoints in `backend/app/api/v1/library.py` & `backend/app/api/v1/games.py`:
    - `GET /api/v1/library/library`, `POST /api/v1/library/library/{game_id}`, `DELETE /api/v1/library/library/{game_id}`
    - `GET /api/v1/library/favorites`, `POST /api/v1/library/favorites/{game_id}`
    - `GET /api/v1/library/rankings`, `POST /api/v1/library/rankings`
    - `GET /api/v1/library/reviews/{game_id}`, `POST /api/v1/library/reviews`
    - `GET /api/v1/games/goty`
  - Resilient offline fallback in `frontend/src/lib/mockData.ts` and `frontend/src/context/LibraryContext.tsx` to guarantee 100% test reliability and zero UI crashes even when offline or unauthenticated.
</user_constraints>

<architectural_responsibility_map>
## Architectural Responsibility Map

| Component / File | Primary Responsibility | Secondary Responsibility |
|---|---|---|
| `context/LibraryContext.tsx` | Global Library State & Optimistic Engine | Syncs with localStorage & FastAPI, handles rollbacks |
| `components/library/ShelfSelector.tsx` | Dropdown/pill menu for shelf statuses | Emits optimistic updates (`wishlist`, `playing`, etc.) |
| `components/library/LibraryGameCard.tsx` | Card display for library items | Playtime editor, rating pill, favorite toggle, delete |
| `components/library/LibraryFilterTabs.tsx` | Horizontal shelf switcher with count badges | Counts items per shelf, triggers tab change |
| `components/library/Top10Builder.tsx` | Interactive Top 10 list curator | Slot ranking (1-10), reordering controls, custom title |
| `components/reviews/StarRating.tsx` | 1-10 rating widget | Hover states, half/full star feedback, score pill |
| `components/reviews/MarkdownRenderer.tsx` | Lightweight, safe markdown parser | Formats bold, italic, headings, lists, quotes safely |
| `components/reviews/ReviewForm.tsx` | Markdown review composer with live preview | Validates rating, title, body, handles submit |
| `components/reviews/ReviewList.tsx` | Community & user reviews display | Shows score badge, reviewer avatar, formatted body |
| `components/goty/GotyTimeline.tsx` | Horizontal year timeline selector (2014-2024) | Highlights active year with gold accent laurels |
| `components/goty/GotyWinnerCard.tsx` | Hero spotlight for GOTY winner | Displays award laurels, trailer, tags, quick-save |
| `components/goty/GotyNominees.tsx` | Grid of runner-ups / nominees for selected year | High-res cards, category badges, shelf buttons |
| `app/library/page.tsx` | Route controller for `/library` | Coordinates shelves and Top 10 tabs |
| `app/goty/page.tsx` | Route controller for `/goty` | Orchestrates timeline, winner, and nominees |
| `lib/api.ts` & `lib/mockData.ts` | API client & offline fallbacks | Library CRUD, reviews endpoints, and GOTY dataset |
</architectural_responsibility_map>

<research_summary>
## Technical Insights & Best Practices

1. **Optimistic Shelving with Rollback (`LIB-01`, `LIB-02`)**:
   Users expect immediate UI feedback when clicking "Add to Library" or changing a shelf from "Wishlist" to "Currently Playing".
   A React Context (`LibraryProvider`) holds the active library state in memory and persists it to `localStorage` while asynchronously executing the FastAPI request:
   ```typescript
   // 1. Optimistic update
   setLibrary(prev => ({ ...prev, [gameId]: updatedItem }));
   try {
     await api.shelfGame(gameId, status);
   } catch (err) {
     // 2. Rollback on failure with toast notification
     setLibrary(previousState);
   }
   ```
   This ensures zero UI lag, offline support, and backend synchronization.

2. **1-10 Rating Scale & Safe Markdown Reviews (`LIB-03`)**:
   Standard gaming platforms (e.g. IGN, GameSpot, Steam) use 10-point or percentage rating scales. We adopt a clean 10-point scale (`1-10`) where each star represents 1 point (or 5 stars with half increments).
   For reviews, users can format their critique with markdown. Rather than pulling in large dependencies that could introduce React 19 incompatibilities, a custom lightweight AST-safe markdown formatter parses bold (`**bold**`), italics (`*italic*`), headings (`#`, `##`), blockquotes (`>`), unordered lists (`-`), code spans (`` `code` ``), and line breaks into sanitize-safe React components.

3. **Top 10 Ranked List Builder (`LIB-04`)**:
   The Top 10 list represents a user's curated all-time favorites.
   The builder provides:
   - 10 fixed slots with visual prestige tier badges:
     - 🥇 **#1**: Golden Laurel / Champion
     - 🥈 **#2**: Silver Shield
     - 🥉 **#3**: Bronze Medal
     - 4-10: Numbered glass badge
   - Game selector: Allows picking from games in the user's library or quick search from catalog.
   - Reordering: Move Up (▲), Move Down (▼), Remove, or direct slot assignment.
   - Custom title input (e.g., "Ayush's All-Time Masterpieces").
   - Persistence to Supabase `ranked_lists` table via `POST /api/v1/library/rankings`.

4. **Curated Game of the Year (GOTY) Archive (`LIB-05`)**:
   The Game Awards archive covers 2014 to 2024:
   - **2024**: Astro Bot
   - **2023**: Baldur's Gate 3
   - **2022**: Elden Ring
   - **2021**: It Takes Two
   - **2020**: The Last of Us Part II
   - **2019**: Sekiro: Shadows Die Twice
   - **2018**: God of War
   - **2017**: The Legend of Zelda: Breath of the Wild
   - **2016**: Overwatch
   - **2015**: The Witcher 3: Wild Hunt
   - **2014**: Dragon Age: Inquisition
   The interactive archive lets users click any year, displaying a grand cinematic winner spotlight accompanied by the 4-5 runner-up nominees for that year (e.g., for 2023: Alan Wake 2, Spider-Man 2, Super Mario Bros. Wonder, Resident Evil 4). Users can instantly add any GOTY winner or nominee directly to their library shelf.

5. **Test Strategy & Nyquist Compliance**:
   Each component and integration flow will have a dedicated Vitest test suite testing:
   - Optimistic shelving, filtering, and delete actions in `LibraryPage.test.tsx` and `LibraryCard.test.tsx`.
   - Rating selection, markdown rendering, and review submission in `ReviewForm.test.tsx` and `ReviewList.test.tsx`.
   - Top 10 reordering and saving in `Top10Builder.test.tsx`.
   - GOTY timeline selection, winner card rendering, and nominee shelf actions in `GotyPage.test.tsx`.
   - Backend API endpoints in `test_library_api.py` and `test_goty_api.py`.
</research_summary>
