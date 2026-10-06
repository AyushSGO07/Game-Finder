# Feature Research

**Domain:** Game Discovery & Personal Gaming Platform  
**Researched:** 2026-10-06  
**Confidence:** HIGH  

## Feature Landscape

### Table Stakes (Users Expect These)

Features users assume exist in any modern gaming discovery and store-style platform. Missing these makes the product feel incomplete or unpolished.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Persistent Global Navigation | Users need continuous access to Home, Discovery, AI Finder, GOTY, and Personal Library. | LOW | Top dark navigation bar on desktop; responsive mobile drawer/bottom navigation. |
| Store-Style Hero Carousel | Visual gaming discovery standard set by Steam, Epic Games Store, and PlayStation Network. | MEDIUM | Cinematic artwork, title logos, tags, rating badge, trailer preview, and quick-add CTAs. |
| Categorized Game Carousels | Browsing by Trending, New Releases, Highly Rated, Hidden Gems, and Genres. | MEDIUM | Smooth horizontal touch/keyboard scrolling, pagination buttons, and "View All" views. |
| Detailed Game View | Complete game information hub. | MEDIUM | Header media player (video/trailer), screenshot thumbnails, metadata sidebar, synopsis, system specs. |
| Global Game Search & Filter | Finding specific titles rapidly across a large catalog. | MEDIUM | Debounced autocomplete query, genre/tag filters, release year, and rating sorting. |
| User Authentication & Profile | Account persistence for favorites and progress. | MEDIUM | Supabase Auth (email/password, OAuth), avatar, gaming handle, and public profile view. |
| Personal Game Library | Standard backlog tracker features (Goodreads/Letterboxd for games). | MEDIUM | Status shelves: Want to Play (Wishlist), Backlog, Currently Playing, Completed/Played. |
| Personal Ratings & Reviews | Community and personal evaluation. | LOW | 1-5 or 1-10 star/score ratings, text reviews, and review management. |
| AI Recommendation Engine | Core value differentiator inherited from prototype. | MEDIUM | Gemini-powered recommendations based on genre, mood, age rating, and difficulty. |

### Differentiators (Competitive Advantage)

Features that elevate Game Finder from a generic store clone into an indispensable personal gaming companion.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| Conversational AI Game Matcher | Goes beyond static dropdowns to natural language queries ("Games like Hollow Knight with great soundtracks"). | HIGH | Conversational mode that parses gamer preferences into structured attributes and Gemini prompts. |
| GOTY Curated Archive | Interactive retrospective of Game of the Year winners (2014-present). | LOW | Historical context, winner highlights, runners-up, and direct play links. |
| Personal Ranked Top 10 Lists | Shareable gamer identity artifact. | MEDIUM | Drag-and-drop or ranked list editor showcasing a player's all-time favorite games. |
| Hybrid Metadata Fallback Engine | 100% card visual fidelity without broken images. | MEDIUM | Steam API primary, IGDB/RAWG secondary, verified high-resolution fallback art. |
| Optimistic Library Updates | Instant UI responsiveness when bookmarking/shelving games. | LOW | State updates immediately in UI with background server sync. |

### Anti-Features (Deliberately Excluded)

Features that seem appealing on the surface but create major technical, legal, or product bloat.

| Feature | Why Requested | Why Problematic | Alternative |
|---------|---------------|-----------------|-------------|
| Direct Game Sales & Payment Gateway | "Like Steam" | Massive regulatory burden, PCI compliance, payment fees, DRM integration, publisher contracts. | Affiliate links and outbound store links (Steam, Epic, GOG, PlayStation). |
| Real-time Multiplayer Chat / Lobbies | Social gaming | Heavy moderation, server costs, toxicity management, distraction from discovery core. | Comments and text reviews only. |
| Pixel-by-pixel Steam UI Clone | Familiarity | Trademark infringement, lack of unique brand identity, outdated UI baggage. | Original modern dark cinematic UI with glassmorphism inspired by high-density digital store principles. |
| Uncached Direct Steam Scraping | Easy data | Immediate rate limiting (HTTP 429), brittle DOM parsing, slow page loads. | Cached backend service hitting official Steam Web endpoints and structured APIs. |

## Feature Dependencies

```
[User Auth] ──requires──> [Supabase Database]
     │
     └──enables──> [Personal Library (Wishlist/Backlog/Playing/Played)]
     │
     └──enables──> [User Ratings & Reviews]
     │
     └──enables──> [Custom Top 10 Ranked Lists]

[FastAPI Backend] ──provides──> [Steam / IGDB Metadata API + Cache]
     │                                     │
     │                                     └──feeds──> [Store Discovery Carousels]
     │                                     │
     │                                     └──feeds──> [Game Detail Pages]
     │
     └──provides──> [LangChain Gemini Recommendation Engine]
                           │
                           └──feeds──> [AI Game Finder Wizard / Matcher]
```

### Dependency Notes

- **Personal Library requires User Auth**: Unauthenticated users can browse and run the AI Finder, but saving games to backlog/favorites requires an account.
- **Frontend Carousels require Backend Metadata Cache**: Fast UI rendering (<100ms) requires the backend to cache external Steam and IGDB payloads in memory/Redis rather than fetching live on every client render.
