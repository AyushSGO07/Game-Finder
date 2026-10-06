# Pitfalls Research

**Domain:** Game Discovery & Personal Gaming Platform  
**Researched:** 2026-10-06  
**Confidence:** HIGH  

## Critical Pitfalls & Mitigation Strategies

### 1. External API Rate Limiting (Steam & IGDB 429s)

- **The Pitfall:** Directly querying Steam or IGDB endpoints on every page load or carousel render quickly hits rate limits, resulting in HTTP 429 errors, missing artwork, and broken user sessions.
- **Warning Signs:** Broken image capsules, slow carousel rendering (>2s), 429 responses in backend logs.
- **Prevention Strategy:** 
  - Implement a multi-tier caching layer in FastAPI:
    - Tier 1: In-memory LRU cache (`cachetools.TTLCache`) for hot game metadata (TTL: 1-6 hours).
    - Tier 2: Database cache table (`game_cache`) for long-term persistence (TTL: 7 days).
  - Background asynchronous hydration of popular game lists.
  - Never allow frontend clients to call Steam/IGDB APIs directly.
- **Addressed in Phase:** Phase 2 (Game Metadata & Caching Service).

### 2. Discarding Working Gemini Prompt Engineering

- **The Pitfall:** Rewriting the recommendation system from scratch or replacing it with naive mock data often breaks the carefully calibrated 8-game recommendation output structure that `Game_Finder.py` already validates.
- **Warning Signs:** Hallucinated game titles, malformed recommendation payloads, failure to respect age rating or difficulty constraints.
- **Prevention Strategy:**
  - Preserve `prompt.json` and the LangChain JSON parser structure.
  - Encapsulate the existing pipeline into a dedicated Python service module (`backend/services/recommendation.py`).
  - Write automated tests (`pytest`) against known input combinations verifying schema conformity and 8-game output guarantees.
- **Addressed in Phase:** Phase 1 (Backend Extraction & AI Service).

### 3. Exposing API Keys & Credentials to Client Bundles

- **The Pitfall:** Accidentally embedding `GEMINI_API_KEY` or Supabase service role keys into Next.js client bundles (`NEXT_PUBLIC_*`).
- **Warning Signs:** Environment variables prefixed with `NEXT_PUBLIC_` containing secret keys, keys appearing in network headers.
- **Prevention Strategy:**
  - Strict separation of public and secret environment variables.
  - All Gemini and external game API requests must transit through FastAPI backend endpoints.
  - Supabase client in the frontend must use only the `anon` public key, protected by strict PostgreSQL Row-Level Security (RLS) policies.
- **Addressed in Phase:** Phase 1 & Phase 3 (Backend & Database Setup).

### 4. Excessive Client Animations & Heavy Parallax Degrade Performance

- **The Pitfall:** Over-decorating the UI with heavy glassmorphism filters (`backdrop-blur-2xl`), nested glow effects, and continuous parallax scripts causes severe frame drops (jank) on mobile browsers and budget GPUs.
- **Warning Signs:** Page stutter during carousel scrolling, sluggish mobile navigation, high CPU/GPU spikes in browser task manager.
- **Prevention Strategy:**
  - Limit `backdrop-filter` usage to fixed header elements and modal overlays.
  - Use GPU-accelerated CSS properties (`transform`, `opacity`) via Framer Motion / Tailwind.
  - Maintain a dark, cinematic contrast palette with lightweight radial gradient backgrounds rather than canvas particle scripts.
- **Addressed in Phase:** Phase 4 (Frontend Shell & Discovery Hub).

### 5. Brittle Image Loading & Broken Visual Layouts

- **The Pitfall:** Many games have inconsistent banner dimensions, missing Steam banners, or dead Wikipedia hotlinks, causing broken image icons and shifting grid layouts.
- **Warning Signs:** Blank card banners, layout shift (high Cumulative Layout Shift / CLS), broken image placeholders.
- **Prevention Strategy:**
  - Fixed aspect ratio card containers (`aspect-[16/9]` or `aspect-[3/4]`) with skeleton loaders.
  - Resilient multi-tier fallback pipeline:
    1. Steam header/capsule image
    2. IGDB / high-res database artwork
    3. Curated local fallback placeholder with game title badge
  - Next.js `<Image />` component with configured remote image domains and blur placeholders.
- **Addressed in Phase:** Phase 2 & Phase 4.
