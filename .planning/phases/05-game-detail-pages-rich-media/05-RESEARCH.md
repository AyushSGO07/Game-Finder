# Phase 5: Game Detail Pages & Rich Media - Research

**Researched:** 2026-10-07  
**Domain:** Next.js 15 Dynamic Routing / Game Detail Views / HTML5 Video Streaming / Screenshot Lightbox / System Requirements Formatting  
**Confidence:** HIGH  

<user_constraints>
## User Constraints (from User Interaction & spec.md)

User confirmed: Proceed directly with research-backed planning — Use established dark cinematic layout, Steam/HTML5 trailer player, screenshot lightbox, and requirements GAME-01 through GAME-04.

### Locked Decisions (from spec.md & STACK.md)
- **Frontend Framework**: Next.js 15 (App Router) dynamic route `frontend/src/app/games/[id]/page.tsx`.
- **Styling**: Tailwind CSS dark cinematic theme tokens (`#090a0f` canvas, `#111420` surface, glassmorphism panels, indigo/gold/cyan accents).
- **Core Requirements**:
  - `GAME-01`: Complete game detail page displaying title, release date, developer, publisher, synopsis, and rich descriptions.
  - `GAME-02`: Embedded video player supporting game trailers and teaser previews (HTML5 MP4/WebM streams from Steam with custom overlay controls).
  - `GAME-03`: Screenshot gallery with responsive thumbnail strip and fullscreen lightbox preview (supporting keyboard Arrow Left/Right and Escape navigation).
  - `GAME-04`: Metadata sidebar displaying tags, genre badges, PC system requirements (Minimum vs Recommended tabs), and external store links.
- **Backend Integration**: Consumes backend `GET /api/v1/games/{app_id}` with client-side fallback cache in `frontend/src/lib/api.ts` to ensure 100% offline & development resilience.
</user_constraints>

<architectural_responsibility_map>
## Architectural Responsibility Map

| Component / File | Primary Responsibility | Secondary Responsibility |
|-------------------|------------------------|--------------------------|
| `app/games/[id]/page.tsx` | Dynamic Route Server Page | Resolves params, loads game detail data, generates metadata SEO |
| `components/game/GameHeader.tsx` | Hero Banner, Title, Developer, Release Date, Badges | Quick Action CTAs ("Add to Library", "Steam Store") |
| `components/game/MediaGallery.tsx` | Combined Media Showcase (Trailer + Screenshots) | Active media switcher, poster previews |
| `components/game/TrailerPlayer.tsx` | Embedded HTML5 Video Player | Play/pause overlays, format fallback (MP4/WebM) |
| `components/game/ScreenshotLightbox.tsx` | Fullscreen modal with keyboard navigation | Arrow navigation, zoom, backdrop dismiss |
| `components/game/GameSidebar.tsx` | Developer, Publisher, Platform badges, External links | Metadata chips, user rating pill |
| `components/game/SystemRequirements.tsx` | Minimum & Recommended specs tab view | HTML sanitizer/stripper for Steam requirement strings |
| `lib/api.ts` & `lib/mockData.ts` | `fetchGameDetails(id)` data fetcher | Comprehensive detail fallback mocks with real screenshots & trailers |
</architectural_responsibility_map>

<research_summary>
## Summary

Phase 5 equips Game Finder with full game detail pages (`/games/[id]`), transitioning users from discovery browsing into deep exploration of individual titles.

Key technical facets include:
1. **Dynamic Route Architecture**: Next.js 15 dynamic route parameter handling (`app/games/[id]/page.tsx`), supporting both numeric Steam AppIDs (`1245620`) and string slugs (`elden-ring`).
2. **Rich Media Gallery & Video Streaming**: High-performance trailer playback using native `<video>` elements supporting Steam's MP4/WebM CDN streams with custom glass controls, accompanied by interactive screenshot thumbnail strips.
3. **Keyboard-Accessible Lightbox**: Fullscreen modal dialog (`role="dialog"`) with `Escape` to close, `ArrowLeft` / `ArrowRight` to step through screenshots, and image preloading.
4. **Structured System Requirements**: Parsing Steam's legacy HTML requirement strings into clean, structured Minimum vs. Recommended tabs.
5. **Metadata Sidebar**: Developer studios, publishers, release dates, genre pills, user score laurels, and external store links (Steam, official websites).
</research_summary>

## Component Contract Hierarchy

```text
frontend/src/
├── app/
│   └── games/
│       └── [id]/
│           ├── page.tsx                    # Game detail route (async RSC)
│           └── loading.tsx                 # Skeleton loader for detail view
├── components/
│   └── game/
│       ├── GameHeader.tsx                 # Title, release date, badges, quick actions
│       ├── MediaGallery.tsx               # Primary media showcase (video + photo strip)
│       ├── TrailerPlayer.tsx              # HTML5 trailer player with custom controls
│       ├── ScreenshotLightbox.tsx         # Fullscreen lightbox dialog
│       ├── GameSidebar.tsx                # Developer, publisher, genres, links
│       └── SystemRequirements.tsx         # Min/Rec PC hardware spec tabs
└── types/
    └── game.ts                            # Augmented GameDetail, Screenshot, Movie types
```

## Testing & Validation Strategy
- `vitest` + `@testing-library/react`
- Test files:
  - `GameDetailView.test.tsx`: Validates header, metadata sidebar, synopsis, and system requirements tabs.
  - `MediaGallery.test.tsx`: Validates trailer player controls, video stream sources, screenshot switching, and lightbox modal triggers.
