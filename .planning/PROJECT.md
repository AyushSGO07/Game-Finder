# Game Finder

## What This Is

Game Finder is a full-fledged game discovery and personal gaming platform evolved from an AI-powered Streamlit prototype. It combines AI-driven personalized game recommendations (powered by Google Gemini), modern digital store-inspired discovery browsing (cinematic carousels, featured sections, genre hubs), comprehensive game detail pages, and personal library management (favorites, play statuses, backlogs, user ratings, and ranked lists) within a dark cinematic visual design.

## Core Value

Discover the perfect game to play next through intelligent AI recommendations and rich game exploration, seamlessly integrated with personal gaming library tracking.

## Business Context

- **Customer**: Gamers looking for high-relevance game recommendations, game discovery, and a personal library/backlog tracker.
- **Revenue model**: Free-to-use platform with potential affiliate referral links to game retailers (Steam, Epic, GOG) and premium customization features.
- **Success metric**: User recommendation satisfaction rate, search-to-detail clickthrough rate, and active library engagement.

## Requirements

### Validated

- ✓ [Streamlit AI Recommendation Prototype] — Generates 8 game recommendations using Google Gemini (`gemini-3.5-flash-lite` / 1.5) via LangChain based on genre, age rating, and difficulty.
- ✓ [Steam & Web Imagery Fetching] — Retrieves game capsules/posters from Steam public endpoints with web/Wikipedia fallbacks.
- ✓ [Game of the Year Archive] — Curated GOTY winner selection and display.

### Active

- [ ] [Backend Extraction & API Service] — Extract AI recommendation logic into a robust Python FastAPI backend with validation, rate limiting, and secure Gemini API key management.
- [ ] [Game Metadata & Caching Service] — Backend aggregation service fetching and caching game data (Steam Store API / IGDB / RAWG) with Redis/in-memory TTL caching.
- [ ] [Database & Authentication] — PostgreSQL database via Supabase storing users, game metadata cache, libraries, favorites, ratings, reviews, and ranked lists.
- [ ] [Modern Web Frontend] — Next.js (App Router) + TypeScript frontend with Tailwind CSS and Lucide icons featuring dark cinematic aesthetics and glassmorphism accents.
- [ ] [Store-Style Discovery Hub] — Hero carousel, trending/popular sections, new releases, top rated, hidden gems, and genre browsing.
- [ ] [AI Game Finder Experience] — Interactive wizard and conversational recommendation interface with rich result cards, explanation blurbs, and filter controls.
- [ ] [Comprehensive Game Detail Pages] — Detailed pages with trailer player, screenshot galleries, system requirements, tags, developer/publisher info, and user review modules.
- [ ] [Personal Library & Backlog Management] — Track games as Wishlist, Backlog, Currently Playing, and Played, with custom user ratings and reviews.
- [ ] [Rankings & GOTY Archive] — Global rankings, curated GOTY winners (2014-present), and user-customizable Top 10 lists.

### Out of Scope

- [Pixel-for-pixel Steam clone] — The application has its own original brand identity and information architecture; do not copy Steam logos or proprietary assets.
- [Direct frontend Gemini API access] — All AI queries and API keys must be isolated in the backend for security and rate limiting.
- [Real-time multiplayer lobbies / chat] — Focus is on discovery, single-player library tracking, and reviews; not a social network or multiplayer matchmaking platform.
- [Payment processing / Game sales] — Game Finder is a discovery and tracking platform, not a direct digital merchant.

## Context

The project started as a lightweight Streamlit application (`Game_Finder.py`, `prompt.json`, `requirements.txt`). While functional, Streamlit limited the information density, navigation hierarchy, authentication persistence, and responsiveness expected of a modern gaming web app. The detailed specification (`spec.md`) maps out a comprehensive migration to a decoupled Next.js + FastAPI + Supabase architecture while preserving and upgrading the core Gemini recommendation algorithms.

## Constraints

- **Tech Stack (Frontend)**: Next.js (App Router), TypeScript, Tailwind CSS, Lucide icons, Framer Motion.
- **Tech Stack (Backend)**: Python, FastAPI, LangChain, Google Gemini API (`@google/genai` / `langchain-google-genai`).
- **Database / Auth**: PostgreSQL via Supabase (Row Level Security enabled).
- **Security**: Never expose Gemini API keys or service keys in client bundles; enforce backend rate limits.
- **Performance**: High image optimization, cached external API responses (Steam/IGDB metadata), fast cold start.

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Next.js + FastAPI decoupled architecture | Provides best-in-class frontend performance and SSR while keeping Python ecosystem for LangChain / Gemini AI pipelines | — Pending |
| Supabase for PostgreSQL & Auth | Out-of-the-box secure authentication, relational schema with RLS, and fast developer velocity | — Pending |
| Preserve & enhance LangChain Gemini pipeline | Existing prompt engineering produces solid 8-game outputs; wrapping it in FastAPI retains working IP while enabling caching and error resilience | — Pending |
| Steam API as primary metadata with cached fallbacks | Reliable artwork and trailers without requiring paid API tiers; fallbacks ensure 100% card completeness | — Pending |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd-transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd-complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-10-06 after initialization*
