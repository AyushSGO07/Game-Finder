# Phase 4: Frontend Shell & Store Discovery Hub - Research

**Researched:** 2026-10-07  
**Domain:** Next.js 15 App Router / Dark Cinematic Gaming UI / Responsive Navigation / Store Carousels / Horizontal Shelves  
**Confidence:** HIGH  

<user_constraints>
## User Constraints (from CONTEXT.md)

No user constraints - all decisions at the agent's discretion (planned without CONTEXT.md per user confirmation).

### Locked Decisions (from spec.md & STACK.md)
- **Frontend Framework**: Next.js 15 (App Router) with TypeScript and React 19.
- **Design System & Styling**: Tailwind CSS, Lucide React icons, glassmorphism cards, dark cinematic color palette (`#090a0f` base background, `#12151f` card surfaces).
- **Navigation Architecture**:
  - Desktop: Persistent sticky top navigation bar with brand logo, primary navigation links (Home, Discover, Game Finder, GOTY, My Library), search trigger, and profile/login button.
  - Mobile: Compact top header with responsive mobile navigation drawer or bottom navigation bar.
- **Hero Carousel**: Cinematic store-style Hero carousel with auto-play, manual pause, slide navigation, backdrop artwork, game title, description, tags, rating badge, and action CTAs.
- **Horizontal Shelves**: Categorized shelves for Trending, New Releases, Top Rated, and Hidden Gems with smooth scrolling and arrow controls.
- **Genre Hub**: Interactive tiles for 12 core genres (Action, RPG, Strategy, Indie, etc.).
- **Security & Performance**: Never expose Gemini API keys or service keys in client bundles; cached API responses and high image optimization.

### Discretionary Decisions
- **Project Structure**: Clean Next.js application inside `frontend/` directory with `src/app/`, `src/components/`, `src/lib/`, and `src/types/`.
- **Carousel Engine**: Custom GPU-accelerated touch- and keyboard-accessible carousel avoiding heavy bloated dependencies.
- **Data Resilience**: Frontend API client (`frontend/src/lib/api.ts`) connecting to FastAPI backend `http://localhost:8000/api/v1` with curated fallback game catalog data to guarantee 100% visual uptime during development and offline testing.
- **Testing**: Vitest + React Testing Library for component rendering and interaction tests.
</user_constraints>

<architectural_responsibility_map>
## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| App Shell & Routing | Next.js App Router | React Server Components | High-performance routing, metadata SEO, and fast streaming. |
| Global Navigation | Client Component | Tailwind CSS | Persistent header with desktop nav, mobile drawer, and auth status state. |
| Store Hero Carousel | Client Component | CSS GPU Transitions | Auto-playing cinematic showcase with manual controls, pause on hover, and slide indicators. |
| Horizontal Discovery Shelves | Client Component | Scroll Snap CSS | High-performance shelf browsing with keyboard navigation, touch swipe, and scroll arrows. |
| Genre Hub | Server/Client Component | Tailwind Grid | Interactive category tiles with custom color gradients and icons. |
| Backend Integration | Next.js API / Client Fetch | FastAPI Backend | Consumes backend game endpoints (`/games/search`, `/me/library`) with instant fallback cache. |
</architectural_responsibility_map>

<research_summary>
## Summary

Phase 4 constructs the frontend visual foundation of Game Finder, evolving it from a raw backend API into a modern digital game store and discovery platform.

The core deliverables include:
1. **Next.js 15 Project Setup**: Initialized under `frontend/` with TypeScript, Tailwind CSS, Lucide icons, and font configuration.
2. **Persistent Global Navigation**: Desktop top bar with brand mark, links (`Home`, `Discover`, `Game Finder`, `GOTY`, `Library`), global search button, and user authentication avatar/button. Mobile responsive drawer and bottom bar.
3. **Cinematic Hero Carousel**: High-impact store hero with auto-rotating featured games, backdrop artwork, title logos, tags, rating badges, and CTAs ("Explore Game", "Add to Favorites").
4. **Categorized Horizontal Shelves**: Responsive shelves for "Featured Games", "Trending Now", "New Releases", "Top Rated", and "Hidden Gems" with chevron scroll controls and card hover lifts.
5. **Interactive Genre Hub**: 12 visually distinct genre tiles with custom gradient overlays and Lucide icons.
</research_summary>

## Standard Technology Stack

| Library / Tool | Version | Purpose | Why Recommended |
|----------------|---------|---------|-----------------|
| `next` | 15.x | Application Framework | App Router, Server Components, fast Turbopack bundling, image optimization. |
| `react` & `react-dom` | 19.x | UI Runtime | Modern React features, concurrent rendering, and hooks. |
| `typescript` | 5.x | Type Safety | End-to-end type contracts matching backend Pydantic models. |
| `tailwindcss` | 3.4+ / 4.x | Design System Styling | Dark cinematic glassmorphism without runtime overhead. |
| `lucide-react` | Latest | Iconography | Clean, consistent icons for gaming controls, search, and navigation. |
| `vitest` | Latest | Component Testing | Ultra-fast Vite-native test runner compatible with React Testing Library. |

## Component & Layout Architecture

```text
frontend/
├── src/
│   ├── app/
│   │   ├── layout.tsx         # Global html/body shell with persistent Navbar & Footer
│   │   ├── page.tsx           # Store Discovery Home Page (Hero + Shelves + Genre Hub)
│   │   ├── globals.css        # Tailwind directives and dark cinematic custom utilities
│   │   └── discover/          # Discover catalog view
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Navbar.tsx     # Desktop top bar & search trigger
│   │   │   ├── MobileNav.tsx  # Responsive mobile drawer / bottom navigation
│   │   │   └── Footer.tsx     # Modern gaming footer
│   │   ├── discovery/
│   │   │   ├── HeroCarousel.tsx   # Cinematic auto-play hero carousel
│   │   │   ├── GameCard.tsx       # Glassmorphism game card with tags & rating
│   │   │   ├── GameShelf.tsx      # Horizontal scrolling shelf with chevron controls
│   │   │   └── GenreHub.tsx       # 12 interactive genre tiles grid
│   │   └── ui/
│   │       ├── Button.tsx     # Glow & glass button variants
│   │       └── Badge.tsx      # Genre and rating badges
│   ├── lib/
│   │   ├── api.ts             # Backend API client with mock fallbacks
│   │   └── mockData.ts        # High-res curated discovery datasets
│   └── types/
│       └── game.ts            # Frontend GameCard, GameDetail, Shelf contracts
```

## Validation Architecture

### Testing Strategy
- **Framework**: `vitest` + `@testing-library/react`
- **Location**: `frontend/src/__tests__/`
- **Component & Integration Tests**:
  - `Navbar.test.tsx`: Validates persistent links, mobile drawer toggle, and search trigger.
  - `HeroCarousel.test.tsx`: Verifies auto-play transition, manual slide controls, and CTA clicks.
  - `GameShelf.test.tsx`: Verifies horizontal scroll rendering, card list display, and left/right button controls.
  - `GenreHub.test.tsx`: Verifies 12 genre cards render with correct labels and links.
- **Quick Run Command**: `npm test` inside `frontend/` (~2 sec)
- **Full Suite Command**: `npm test -- --run` (~3 sec)
