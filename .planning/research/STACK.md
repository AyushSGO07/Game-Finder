# Stack Research

**Domain:** Game Discovery & Personal Gaming Platform (Store-Inspired Architecture)  
**Researched:** 2026-10-06  
**Confidence:** HIGH  

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

```bash
# Frontend dependencies
cd frontend
npm install next react react-dom lucide-react framer-motion @supabase/ssr @supabase/supabase-js clsx tailwind-merge
npm install -D typescript @types/node @types/react @types/react-dom postcss tailwindcss

# Backend dependencies
cd ../backend
pip install fastapi uvicorn pydantic httpx cachetools langchain langchain-google-genai python-dotenv supabase pytest pytest-asyncio
```

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
