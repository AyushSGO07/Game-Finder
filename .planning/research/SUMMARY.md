# Project Research Summary

**Project:** Game Finder  
**Domain:** Game Discovery & Personal Gaming Platform  
**Researched:** 2026-10-06  
**Confidence:** HIGH  

## Executive Summary

Game Finder evolves from an AI-powered Streamlit prototype into a modern, store-inspired game discovery and personal gaming library platform. Inspired by the high information density, rich media presentation, and dark cinematic aesthetics of digital game storefronts (Steam, Epic, PSN), the platform delivers intelligent AI game matching alongside comprehensive game discovery and backlog management.

The research establishes a clean decoupled architecture: a high-performance **Next.js 15 (App Router)** web frontend paired with a **Python FastAPI** backend service, backed by **PostgreSQL (Supabase)**. This architecture protects and elevates the existing Google Gemini / LangChain recommendation engine while ensuring sub-second UI responsiveness, robust caching of external game metadata (Steam Store API / fallbacks), and secure user authentication with Row-Level Security.

Key engineering priorities include: (1) preserving the battle-tested prompt engineering and 8-game output guarantees from `Game_Finder.py`; (2) multi-tier caching to prevent third-party API rate limits; (3) optimistic UI updates for library and wishlist actions; and (4) an original, dark cinematic visual language that avoids derivative pixel-cloning.

## Key Findings

### Recommended Stack

A modern, type-safe stack combining Python's AI ecosystem with Next.js edge performance:

**Core technologies:**
- **Next.js 15 & TypeScript**: Fast SSR/RSC rendering, SEO for game catalog pages, and type-safe component contracts.
- **Tailwind CSS & Framer Motion**: Dark cinematic visual design, smooth horizontal carousel scrolling, and accessible interactive controls.
- **FastAPI & Python 3.11+**: Lightweight async backend proxying Gemini AI queries and aggregating external game metadata.
- **LangChain & Google Gemini API**: Preserved and upgraded recommendation pipeline with strict JSON schema validation.
- **Supabase (PostgreSQL 16)**: Built-in authentication, user profiles, relational game libraries, and Row-Level Security (RLS).

### Expected Features

**Must have (table stakes):**
- Persistent global navigation (desktop top bar, mobile drawer/bottom bar).
- Store-style discovery hub with cinematic hero carousel and categorized horizontal shelves (Trending, New Releases, Top Rated, Hidden Gems, Genres).
- Dedicated AI Game Finder with attribute filters (genre, difficulty, age rating, mood) producing 8 high-relevance matches.
- Rich game detail pages with trailer video player, screenshot galleries, system specifications, and tags.
- Personal game library with status shelves (Wishlist, Backlog, Currently Playing, Completed) and ratings/reviews.
- Global search with debounced autocomplete and multi-attribute filters.

**Should have (competitive):**
- Conversational AI game matching interface (natural-language queries).
- Curated Game of the Year (GOTY) interactive archive (2014–present).
- Customizable personal Top 10 ranked lists.
- Multi-tier resilient artwork fallback system ensuring 100% card visual completeness.

**Defer (v2+):**
- Social activity feed and community followers.
- Steam account library import / sync.
- Direct digital store affiliate integration.

### Architecture Approach

Decoupled web architecture with clear separation of concerns:
1. **Next.js Frontend**: Renders discovery hubs, detail views, and library interfaces; queries Supabase directly for user library data and calls FastAPI for search and AI recommendations.
2. **FastAPI Backend**: Acts as an API gateway and AI orchestrator, safeguarding Gemini API keys, executing prompt templates, and caching external Steam/IGDB metadata.
3. **Supabase Database**: Manages user authentication, profile preferences, library states, and relational reviews with strict RLS policies.

### Critical Pitfalls

1. **External API Rate Limiting**: Avoid live Steam/IGDB calls on client renders; enforce backend TTL caching (in-memory + database cache).
2. **Discarding Working AI Logic**: Preserve existing `prompt.json` templates and LangChain output parsers rather than rewriting them from scratch.
3. **API Key Leakage**: Restrict all Gemini and service-level API keys to backend environment variables.
4. **Performance Degraded by Heavy CSS**: Avoid excessive backdrop blur and continuous JS parallax; use GPU-accelerated Tailwind/Framer Motion transforms.
5. **Brittle Image Layouts**: Enforce fixed aspect ratio containers with skeleton loaders and reliable fallbacks.

## Implications for Roadmap

The project cleanly decomposes into 7 standard phases:
- **Phase 1: Backend Extraction & Core AI Service** — Extract `Game_Finder.py` Gemini pipeline into FastAPI with Pydantic validation and unit tests.
- **Phase 2: Game Metadata, Search & Caching Service** — Steam Web API client, fallback image resolver, caching layer, and search endpoints.
- **Phase 3: Database & Authentication** — Supabase PostgreSQL schema, RLS policies, Auth integration, and library data models.
- **Phase 4: Frontend Shell & Store Discovery Hub** — Next.js project setup, dark cinematic design system, navigation bar, Hero carousel, and discovery shelves.
- **Phase 5: Game Detail Pages & Rich Media** — Complete game view with trailer player, screenshot carousel, system specs, and metadata sidebar.
- **Phase 6: AI Game Finder Interactive Interface** — Wizard and conversational recommendation UI with explanation blurbs and filter controls.
- **Phase 7: Personal Library, Reviews & Ranked Lists** — Library shelves (Wishlist/Backlog/Playing/Played), ratings, reviews, and GOTY archive.

## Sources

- `D:/Game-Finder/spec.md` (Product & Engineering Specification)
- `D:/Game-Finder/Game_Finder.py` (Existing Gemini + LangChain implementation)
- `D:/Game-Finder/prompt.json` (Existing prompt template)
- Official Steam Web API & Storefront documentation
- Next.js 15 & FastAPI architectural best practices
