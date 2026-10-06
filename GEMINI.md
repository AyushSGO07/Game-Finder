<!-- GSD:project-start source:PROJECT.md -->

## Project

**Game Finder**

Game Finder is a full-fledged game discovery and personal gaming platform evolved from an AI-powered Streamlit prototype. It combines AI-driven personalized game recommendations (powered by Google Gemini), modern digital store-inspired discovery browsing (cinematic carousels, featured sections, genre hubs), comprehensive game detail pages, and personal library management (favorites, play statuses, backlogs, user ratings, and ranked lists) within a dark cinematic visual design.

**Core Value:** Discover the perfect game to play next through intelligent AI recommendations and rich game exploration, seamlessly integrated with personal gaming library tracking.

### Constraints

- **Tech Stack (Frontend)**: Next.js (App Router), TypeScript, Tailwind CSS, Lucide icons, Framer Motion.
- **Tech Stack (Backend)**: Python, FastAPI, LangChain, Google Gemini API (`@google/genai` / `langchain-google-genai`).
- **Database / Auth**: PostgreSQL via Supabase (Row Level Security enabled).
- **Security**: Never expose Gemini API keys or service keys in client bundles; enforce backend rate limits.
- **Performance**: High image optimization, cached external API responses (Steam/IGDB metadata), fast cold start.

<!-- GSD:project-end -->

<!-- GSD:stack-start source:research/STACK.md -->

## Technology Stack

## Recommended Stack

### Core Technologies

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| Next.js (App Router) | 15.x | Web Frontend Framework | High-performance React framework with server components (RSC), SEO capabilities for game pages, fast streaming, and edge routing. |
| TypeScript | 5.x | Type Safety | End-to-end type contracts across API schemas, game metadata models, and component props. |
| Tailwind CSS | 4.x / 3.4+ | Design System & Styling | Rapidly builds modern, dark cinematic, glassmorphism gaming UI without runtime overhead. |
| FastAPI | 0.115+ | Backend API Service | Asynchronous Python framework with native Pydantic validation, ultra-low latency, and seamless integration with Python AI packages. |
| Python | 3.11+ | Backend Runtime | Required for existing LangChain pipeline, Google GenAI SDK, and scientific/async game metadata aggregation. |
| PostgreSQL (Supabase) | 16+ | Primary Relational Database & Auth | Robust relational data model for users, libraries, reviews, and game caches with built-in Row-Level Security (RLS) and JWT auth. |
| Google Gemini API | 1.5/2.5/Flash | AI Recommendation Engine | Powers nuanced, multi-attribute game matching with fast inference speeds and high structured prompt fidelity. |

### Supporting Libraries

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| LangChain (`langchain-google-genai`) | 0.2+ | AI Orchestration | Preserves existing prompt templates and structured JSON parsing from `Game_Finder.py`. |
| `@supabase/ssr` / `@supabase/supabase-js` | 2.x | Auth & DB Client | Client-side and server-side Supabase authentication and session management in Next.js. |
| Lucide React | Latest | Iconography | Clean, consistent UI icons for gaming controls, ratings, search, and navigation. |
| Framer Motion | 11.x | Micro-interactions | Smooth carousel scrolling, card hover lifts, modal popups, and dark glass transitions. |
| HTTPX / aiohttp | 0.27+ | Async HTTP Requests | High-speed concurrent external API calls to Steam Store API and Wikipedia/IGDB fallbacks. |
| Cachetools / Redis | Latest | API Response Caching | Caching game metadata, search queries, and AI recommendation responses to prevent rate limiting. |

### Development & Testing Tools

| Tool | Purpose | Notes |
|------|---------|-------|
| Pytest + pytest-asyncio | Backend Unit/Integration Testing | Validates API schemas, Gemini mock outputs, and caching behaviors. |
| Vitest / Jest + React Testing Library | Frontend Component Testing | Tests carousel controls, library state mutations, and search bar interactions. |
| Ruff & Black | Python Linting & Formatting | Enforces clean Python style across backend modules. |
| ESLint & Prettier | Frontend Linting | Enforces TypeScript and React best practices. |

## Installation

# Frontend dependencies

# Backend dependencies

## Alternatives Considered

| Recommended | Alternative | When to Use Alternative |
|-------------|-------------|-------------------------|
| Next.js App Router | Streamlit (Current) | Streamlit is suited for rapid data science prototypes, but cannot support store-scale information density, accounts, custom carousels, or multi-page state. |
| FastAPI | Node.js / Express | Node is viable, but Python keeps the working LangChain/Gemini prompt pipeline from `Game_Finder.py` intact without complete rewriting. |
| Supabase | SQLite / Flat JSON | Flat files or local SQLite fail for multi-user authentication, cloud persistence, and concurrent library sync. |

## What NOT to Use

- **Raw scraping / headless browsers for imagery**: Too brittle and slow. Rely on Steam Store API with structured fallbacks.
- **Client-side Gemini API calls**: Exposes API credentials to the browser and lacks rate-limiting control.
- **Uncontrolled CSS heavy parallax**: Degrades FPS on lower-end hardware and mobile devices. Keep animations GPU-accelerated and purposeful.

<!-- GSD:stack-end -->

<!-- GSD:conventions-start source:CONVENTIONS.md -->

## Conventions

Conventions not yet established. Will populate as patterns emerge during development.
<!-- GSD:conventions-end -->

<!-- GSD:architecture-start source:ARCHITECTURE.md -->

## Architecture

Architecture not yet mapped. Follow existing patterns found in the codebase.
<!-- GSD:architecture-end -->

<!-- GSD:skills-start source:skills/ -->

## Project Skills

No project skills found. Add skills to any of: `.agents/skills/`, `.agents/skills/`, `.cursor/skills/`, `.github/skills/`, or `.codex/skills/` with a `SKILL.md` index file.
<!-- GSD:skills-end -->

<!-- GSD:workflow-start source:GSD defaults -->

## GSD Workflow Enforcement

Before using Edit, Write, or other file-changing tools, start work through a GSD command so planning artifacts and execution context stay in sync.

Use these entry points:

- `/gsd-quick` for small fixes, doc updates, and ad-hoc tasks
- `/gsd-debug` for investigation and bug fixing
- `/gsd-execute-phase` for planned phase work

Do not make direct repo edits outside a GSD workflow unless the user explicitly asks to bypass it.
<!-- GSD:workflow-end -->

<!-- GSD:profile-start -->

## Developer Profile

> Profile not yet configured. Run `/gsd-profile-user` to generate your developer profile.
> This section is managed by `generate-claude-profile` -- do not edit manually.
<!-- GSD:profile-end -->
