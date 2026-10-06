# Architecture Research

**Domain:** Game Discovery & Personal Gaming Platform  
**Researched:** 2026-10-06  
**Confidence:** HIGH  

## Architecture Overview

Game Finder follows a modern decoupled client-server architecture designed for high information density, fast rendering, secure AI key management, and persistent relational data storage.

```
┌─────────────────────────────────────────────────────────────┐
│                   Next.js 15 Client (Web)                   │
│  - App Router, Server Components & Client Islands           │
│  - Tailwind CSS + Framer Motion (Dark Cinematic UI)         │
│  - Store Discovery Hub / Carousels / Game Detail Pages      │
│  - AI Recommendation Wizard & Chat Interface                │
│  - Personal Library & Ranked Top 10 Lists                   │
└──────────────┬──────────────────────────────┬───────────────┘
               │ (Client / RSC HTTP)          │ (Auth & User Data)
               ▼                              ▼
┌──────────────────────────────┐ ┌────────────────────────────┐
│    FastAPI Backend Service   │ │   Supabase (PostgreSQL)    │
│ - Recommendation Pipeline    │ │ - Auth Service (JWT)       │
│ - Prompt Handling (LangChain)│ │ - Users & Profiles         │
│ - Steam/IGDB Aggregation     │ │ - User Libraries & Statuses│
│ - Caching & Rate Limiting    │ │ - Reviews & Ratings        │
└──────────────┬───────────────┘ │ - Row-Level Security (RLS) │
               │                 └────────────────────────────┘
               ▼
┌──────────────────────────────┐
│       External Services      │
│ - Google Gemini API (LLM)    │
│ - Steam Store Web API        │
│ - IGDB / RAWG Metadata       │
└──────────────────────────────┘
```

## Component Boundaries & Data Flow

### 1. Frontend Layer (`frontend/`)
- **Technology**: Next.js 15, TypeScript, Tailwind CSS, Lucide React.
- **Responsibilities**:
  - Render store-style discovery home, category carousels, and search filters.
  - Render interactive AI recommendation forms and conversational matcher.
  - Display game detail pages with responsive image/video galleries.
  - Manage user state and personal library shelves (optimistic UI mutations).
- **Communication**:
  - Talks directly to Supabase via `@supabase/ssr` for authentication and direct user table reads/writes governed by RLS.
  - Talks to the FastAPI backend (`/api/v1/...`) for AI recommendations, external game metadata lookups, and global search aggregation.

### 2. Backend Layer (`backend/`)
- **Technology**: Python 3.11+, FastAPI, Pydantic, HTTPX, LangChain (`langchain-google-genai`).
- **Responsibilities**:
  - Encapsulate Google Gemini API keys server-side (never exposed to client).
  - Run LangChain prompt pipelines with input validation and response schema guarantees.
  - Query Steam Web APIs and fallback sources for game capsules, screenshots, genres, and trailers.
  - Cache metadata requests in-memory / Redis to avoid external rate limits (429s).
  - Provide structured OpenAPI/Swagger endpoints.

### 3. Database Layer (`Supabase PostgreSQL`)
- **Tables**:
  - `profiles`: User information, avatar, gaming handle, bio, preferences.
  - `user_games`: User library entries (`status`: `wishlist`, `backlog`, `playing`, `completed`, `dropped`).
  - `ratings_reviews`: Star rating (1-10) and markdown review text per user per game.
  - `ranked_lists`: User-created ranked lists (e.g. "My Top 10 Games of All Time").
  - `game_cache`: Cached game metadata from external APIs for rapid relational joins and search indexing.

## Suggested Build Order

1. **Backend Core & AI Pipeline**: Extract existing `Game_Finder.py` Gemini recommendation logic into FastAPI with clean endpoints and tests.
2. **Metadata Aggregation & Caching**: Implement Steam/fallback external API client with caching and data normalization.
3. **Database Schema & Auth**: Provision Supabase schema, RLS policies, and user library models.
4. **Frontend Foundation & Discovery**: Initialize Next.js project, global layout/navigation, and store-style hero/carousels.
5. **Game Detail & Media Experience**: Build complete game page layout with media player and metadata sidebar.
6. **AI Game Finder Interface**: Build dedicated AI recommendation wizard and natural-language query UI.
7. **User Library & Personal Tracking**: Connect Supabase auth to personal library shelves, ratings, and ranked Top 10 lists.
