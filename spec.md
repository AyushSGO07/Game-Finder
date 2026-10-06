# Game Finder --- Advanced Product & Engineering Specification

## 1. Project Overview

**Project name:** Game Finder\
**Current repository:** `https://github.com/AyushSGO07/Game-Finder`

Game Finder currently exists as an AI-powered Streamlit application. The
current implementation accepts **genre, age rating, and difficulty** and
uses **Google Gemini (`gemini-3.5-flash-lite`) through LangChain** to
produce exactly eight game recommendations. It also retrieves game
imagery from Steam where possible, falls back to web/Wikipedia imagery,
and contains a Game of the Year section. The current UI is a
glassmorphism-oriented Streamlit interface with animated gradients and
hover effects.

The goal of this specification is to evolve that prototype into a
**full-fledged game discovery and personal gaming platform** inspired by
the information density, navigation patterns, game-detail presentation,
libraries, carousels, and dark cinematic visual language of modern
digital game stores.

The result should feel like a **real gaming product**, not a Streamlit
demo.

### Primary product idea

> **Discover games. Find your perfect match. Explore the greatest games
> ever made. Build your personal gaming profile.**

The application must combine:

1.  AI-powered Game Finder
2.  Game discovery/store-style browsing
3.  Game of the Year archive
4.  Detailed game pages
5.  Personal game library
6.  Favorites and ranked lists
7.  User ratings/reviews
8.  Account/authentication
9.  Persistent user preferences
10. Responsive, polished, production-quality UI

The reference screenshots supplied with this specification are visual
references only. Do **not** copy Steam's branding, logos, exact UI,
proprietary assets, or pixel-for-pixel layouts. Build an original
product with a store-inspired information architecture.

------------------------------------------------------------------------

# 2. Existing System --- Preserve and Upgrade

Before changing the project, inspect the existing repository and
preserve useful logic.

Current repository structure is intentionally small:

-   `Game_Finder.py`
-   `prompt.json`
-   `requirements.txt`
-   `README.md`

The existing application already provides:

-   Gemini-powered recommendation generation
-   LangChain orchestration
-   Genre selection
-   Age-rating selection
-   Difficulty selection
-   Exactly eight recommendations
-   Steam image retrieval
-   Fallback image retrieval
-   Game of the Year functionality
-   Custom visual styling

Do **not** simply delete the existing recommendation logic and replace
it with static dummy data.

The recommendation logic should be extracted into a reusable backend
service/module and exposed to the new web application through an API.

------------------------------------------------------------------------

# 3. Product Vision

Game Finder should behave like a modern game discovery platform with a
persistent account.

A logged-in user should be able to:

-   Discover games
-   Search games
-   Filter and sort games
-   Ask the AI for recommendations
-   Open a complete game detail page
-   Watch trailers
-   Browse screenshots
-   See developers and publishers
-   See genres and tags
-   Add games to favorites
-   Add games to a wishlist
-   Mark games as played
-   Mark games as currently playing
-   Maintain a backlog
-   Rate games
-   Review games
-   Rank favorite games
-   Create a personal ranked list
-   View Game of the Year winners
-   Maintain their profile
-   Manage account settings
-   See personalized recommendations based on their activity

------------------------------------------------------------------------

# 4. Core Navigation

The application should have a persistent global navigation.

## Desktop navigation

Use a dark top navigation bar.

### Primary tabs

1.  **Home**
2.  **Discover**
3.  **Game Finder**
4.  **Game of the Year**
5.  **My Library**
6.  **Favorites**
7.  **Rankings**

### Right side

-   Search
-   Notifications
-   User avatar
-   Username
-   Account dropdown

Account dropdown:

-   Profile
-   My Games
-   Settings
-   Sign out

### Mobile navigation

Use:

-   Compact top bar
-   Search button
-   Profile button
-   Bottom navigation or hamburger menu

Mobile navigation must remain usable without recreating the desktop
sidebar.

------------------------------------------------------------------------

# 5. Home / Store-Style Discovery Page

The home page should feel like a modern game marketplace/discovery hub.

## Hero section

Create a large cinematic hero carousel.

Each slide should support:

-   Large background image
-   Gradient overlay
-   Game logo/title
-   Short description
-   Genre
-   Release date
-   Rating
-   CTA: `Explore Game`
-   CTA: `Add to Favorites`

Hero images should be high quality and horizontally oriented.

Do not use a generic static gradient as the main visual.

## Featured sections

Create horizontal carousels similar to a modern game store.

Sections:

### Featured Games

Large cards.

### Trending Now

Compact horizontal cards.

### Popular This Week

Cards with ranking numbers.

### New Releases

Sort by release date.

### Highly Rated

Sort by rating.

### Recommended For You

Only personalized when logged in.

For logged-out users:

> Sign in to unlock personalized recommendations.

### Hidden Gems

Games with strong ratings but lower popularity.

### Browse by Genre

Genre tiles:

-   Action
-   RPG
-   Adventure
-   Shooter
-   Horror
-   Strategy
-   Simulation
-   Racing
-   Sports
-   Indie
-   Puzzle
-   Platformer

Each section must support:

-   Horizontal scrolling
-   Left/right controls
-   Keyboard accessibility
-   Touch scrolling
-   `View All`

------------------------------------------------------------------------

# 6. Game Finder --- Main Feature

This remains the core AI feature.

Route:

`/game-finder`

## Input design

Replace the old simple three-select-box layout with a richer
recommendation interface.

### Required inputs

-   Genre
-   Age rating
-   Difficulty

### Additional filters

-   Platform
-   Multiplayer
-   Single-player
-   Co-op
-   Competitive
-   Story-rich
-   Open world
-   Indie / AAA
-   Release period
-   Price/free-to-play
-   Game length
-   Mood

### Natural language mode

Add a large prompt input:

> "I want a dark open-world RPG with a strong story, difficult combat,
> and exploration."

Allow users to describe what they want naturally.

### AI controls

Buttons:

-   `Find My Games`
-   `Surprise Me`
-   `Refine Results`

## Recommendation output

Return eight recommendations by default.

Each recommendation card should show:

-   Cover image
-   Game title
-   Short description
-   Genre
-   Tags
-   Release date
-   Developer
-   Publisher
-   Rating
-   AI match percentage
-   Match explanation
-   Favorite button
-   Wishlist button
-   Add to Library button
-   `View Details`

Example:

> **94% Match**\
> You asked for: Open World + RPG + Difficult Combat\
> Why it matches: Strong exploration, challenging combat, and
> story-driven progression.

The match percentage must be presented as an **AI relevance estimate**,
not an objectively measured review score.

------------------------------------------------------------------------

# 7. AI Recommendation Architecture

The existing Gemini recommendation logic must be retained but improved.

## Recommendation pipeline

1.  Receive user preferences
2.  Normalize inputs
3.  Construct structured recommendation prompt
4.  Ask Gemini for candidate games
5.  Validate structured output
6.  Enrich each game using external game metadata APIs
7.  Remove duplicates
8.  Validate that games actually exist
9.  Rank candidates
10. Return exactly eight when enough valid candidates exist
11. Cache the result where appropriate

## Structured response

The AI should return structured JSON similar to:

``` json
{
  "recommendations": [
    {
      "title": "Game Title",
      "match_reason": "Why it matches",
      "match_score": 94,
      "genre": ["RPG", "Action"],
      "tags": ["Open World", "Story Rich"],
      "difficulty": "Hard"
    }
  ]
}
```

Never trust raw model output.

Use schema validation with Pydantic/Zod.

------------------------------------------------------------------------

# 8. Game Details Page

Every game must have a dedicated page.

Route:

`/games/[slug]`

This is one of the most important pages in the product.

## Hero

Large cinematic game hero image.

Overlay:

-   Game title
-   Logo if available
-   Short description
-   Release date
-   Developer
-   Publisher
-   Genres
-   Platforms
-   Rating

Actions:

-   `Play / Store`
-   `Favorite`
-   `Wishlist`
-   `Add to Library`
-   `Mark as Played`
-   `Rate`

## Information panel

Show:

-   Developer
-   Publisher
-   Release date
-   Platforms
-   Genres
-   Tags
-   Game modes
-   Age rating
-   Supported languages where available

## About the game

Full description.

Use clean typography and collapsible long text.

## Media gallery

Create a cinematic media section.

Support:

-   Screenshots
-   Artwork
-   Trailer thumbnails
-   Video trailers

Clicking an image opens a full-screen lightbox.

Trailer playback should use a modal/player.

## Ratings

Show:

-   Community rating
-   User rating
-   Review count

If external scores are used, clearly label the source.

## Related games

Show:

-   Similar games
-   Games by same developer
-   Games by same publisher
-   Games with similar tags

## User interaction

Logged-in users can:

-   Favorite
-   Wishlist
-   Rate
-   Review
-   Add status
-   Add personal notes
-   Add playtime
-   Rank

------------------------------------------------------------------------

# 9. Game of the Year Section

Route:

`/goty`

This should be a major first-class tab, not a toggle hidden inside
another page.

## Purpose

Create an interactive archive of Game of the Year winners.

Use historical winners from The Game Awards.

Do not fabricate future winners. If the current year has not been
awarded yet, display:

> Winner not announced yet.

## Main design

Use a year-based navigation system.

Example:

`2014  2015  2016  ...  2025  2026`

Also provide:

-   Previous year
-   Next year
-   Timeline
-   Search

## GOTY hero

For selected year:

-   Winner hero artwork
-   Game title
-   Developer
-   Publisher
-   Release date
-   Genre
-   Description
-   Trailer
-   Screenshots
-   Award year
-   User rating

CTA:

`Explore Game`

## Winner timeline

Create a visually impressive vertical or horizontal timeline.

Each year should contain:

-   Year
-   Winner
-   Cover
-   Short description
-   Developer
-   Publisher

## Browse mode

Provide:

-   Grid view
-   Timeline view

## GOTY comparisons

Optional advanced section:

-   Highest user-rated winners
-   Most favorited winners
-   Most played winners
-   Genre distribution
-   Developer/publisher frequency

These statistics must be based on stored data and must not invent
values.

------------------------------------------------------------------------

# 10. My Library

Route:

`/library`

This is the user's personal game collection.

The design should take inspiration from game-library interfaces while
remaining visually original.

## Library sections

-   All Games
-   Currently Playing
-   Completed
-   Backlog
-   Dropped
-   Wishlist
-   Favorites

## Views

Support:

-   Grid view
-   Compact list view

## Sorting

-   Recently added
-   Recently played
-   Alphabetical
-   Highest rated
-   Personal ranking
-   Release date

## Filtering

-   Genre
-   Platform
-   Status
-   Rating
-   Release year
-   Multiplayer
-   Tags

## Game card

Show:

-   Cover
-   Title
-   Personal rating
-   Status
-   Rank
-   Playtime if available
-   Favorite indicator

------------------------------------------------------------------------

# 11. Favorites

Route:

`/favorites`

Favorites should be a dedicated personal collection.

## Ranking system

Users can rank favorite games.

Each game should have:

-   Rank number
-   Cover
-   Title
-   Personal score
-   Genre
-   Release year
-   Favorite status

Example:

``` text
#1  Red Dead Redemption 2
#2  The Witcher 3
#3  Elden Ring
#4  Cyberpunk 2077
```

## Ranking interaction

Use drag-and-drop.

When a user moves a game:

-   Recalculate ranks
-   Persist the new order
-   Update UI immediately
-   Sync with backend

Use optimistic UI updates with rollback if persistence fails.

## Personal rating

Support:

-   1--10 score
-   Optional star visualization
-   Optional written review

Ranking and rating are separate:

-   **Ranking = personal order**
-   **Rating = personal score**

------------------------------------------------------------------------

# 12. Personal Game Status

Each user-game relationship should support:

``` text
Wishlist
Backlog
Playing
Completed
Dropped
Favorite
```

A game may have multiple flags where appropriate.

Example:

``` text
Favorite + Completed
Favorite + Playing
Wishlist + Backlog
```

Do not force these states into one mutually exclusive enum.

------------------------------------------------------------------------

# 13. User Profile

Route:

`/profile/[username]`

## Profile header

Show:

-   Avatar
-   Username
-   Bio
-   Favorite genres
-   Member since
-   Public/private state

## Statistics

Show:

-   Games owned
-   Games completed
-   Games currently playing
-   Favorites
-   Wishlist count
-   Average personal rating
-   Total tracked playtime

## Profile sections

-   Favorite Games
-   Recently Played
-   Completed Games
-   Rankings
-   Reviews

Users can control whether these sections are public.

------------------------------------------------------------------------

# 14. Authentication and Account Management

Authentication is required.

## Supported authentication

Minimum:

-   Email + password

Optional:

-   Google OAuth

Do not implement authentication manually using plain-text passwords.

Use a production-grade authentication provider.

Recommended:

-   Supabase Auth

## Account pages

Routes:

-   `/login`
-   `/signup`
-   `/forgot-password`
-   `/reset-password`
-   `/settings`

## Settings

Sections:

### Profile

-   Username
-   Display name
-   Avatar
-   Bio

### Preferences

-   Favorite genres
-   Preferred platforms
-   Default age rating
-   Default difficulty

### Privacy

-   Public profile
-   Show favorites
-   Show library
-   Show reviews
-   Show rankings

### Account

-   Change password
-   Email
-   Delete account
-   Sign out

------------------------------------------------------------------------

# 15. Search

Global search should be available from every major page.

Search:

-   Games
-   Developers
-   Publishers
-   Genres
-   Tags

Autocomplete should appear while typing.

Game result:

-   Thumbnail
-   Name
-   Release year
-   Genre

Keyboard support:

-   `/` focuses search
-   `Escape` closes search
-   Arrow keys navigate suggestions
-   Enter opens selected result

------------------------------------------------------------------------

# 16. Discover Page

Route:

`/discover`

Provide powerful browsing.

## Filters

-   Genre
-   Tags
-   Platform
-   Release year
-   Rating
-   Game mode
-   Multiplayer
-   Price
-   Developer
-   Publisher

## Sorting

-   Relevance
-   Popularity
-   Rating
-   Newest
-   Oldest
-   A--Z

Use URL query parameters so searches are shareable.

Example:

`/discover?genre=rpg&platform=pc&sort=rating`

------------------------------------------------------------------------

# 17. Data Sources

Use external APIs only through the backend.

## Primary game metadata

Use Steam's public store/game endpoints where suitable for:

-   Game title
-   App ID
-   Description
-   Header image
-   Screenshots
-   Trailers
-   Developer
-   Publisher
-   Genres
-   Release date
-   Platforms
-   Store URL

Steam's store architecture is a useful reference for the game's
information density and media presentation.

## Optional secondary source

Use IGDB or another reputable game metadata provider when Steam does not
contain sufficient data.

Do not expose API keys in browser code.

------------------------------------------------------------------------

# 18. Image Strategy

Game imagery is a major part of the product.

For each game, support:

-   Cover
-   Header
-   Hero
-   Logo
-   Screenshots
-   Trailer thumbnails

## Image priority

1.  Official game/Steam artwork
2.  Official publisher/developer artwork
3.  Trusted game database artwork
4.  Validated fallback

Do not use random image search results when a canonical source exists.

## Image performance

Use:

-   Responsive images
-   Lazy loading
-   CDN/image optimization
-   Blur placeholders
-   Correct aspect ratios
-   Error fallbacks

Do not allow broken images to destroy card layouts.

------------------------------------------------------------------------

# 19. Visual Design System

The application must feel like a premium gaming platform.

## Overall style

-   Dark
-   Cinematic
-   Modern
-   High contrast
-   Image-driven
-   Subtle glass surfaces
-   Soft gradients
-   Strong typography
-   Minimal unnecessary borders

The current prototype's glassmorphism should be evolved, not simply
copied everywhere.

Avoid making every element a transparent glass card.

## Suggested palette

Background:

-   Near-black
-   Deep navy
-   Charcoal

Surface:

-   Dark slate
-   Slightly lighter cards

Accent:

-   Electric cyan / blue
-   Violet
-   Occasional neon green for positive actions

Use gradients sparingly.

## Typography

Use a modern sans-serif.

Suggested:

-   Inter
-   Geist
-   Manrope

Use large bold headings for game titles.

------------------------------------------------------------------------

# 20. Reference UI Principles

The supplied screenshots establish the following visual principles:

### From game library interfaces

-   Persistent navigation
-   Dense game lists
-   Recent games
-   Large selected-game artwork
-   Play/action controls
-   Personal statistics

### From game-store interfaces

-   Large featured carousel
-   Discount/metadata badges where relevant
-   Horizontal game rails
-   Featured content
-   Category browsing
-   Rich game cards

### From modern game detail pages

-   Full-width hero
-   Large background artwork
-   Strong title treatment
-   Media gallery
-   Description
-   Developer/publisher information
-   Action buttons

Use these principles, but create an original Game Finder identity.

------------------------------------------------------------------------

# 21. Frontend Technology

The existing Streamlit application should be migrated to a proper
frontend for this phase.

## Recommended stack

-   Next.js
-   TypeScript
-   React
-   Tailwind CSS
-   shadcn/ui
-   Framer Motion
-   Lucide icons

## Why

The new product requires:

-   Multiple routes
-   Persistent navigation
-   Authentication
-   Drag-and-drop ranking
-   Complex state
-   URL-based filtering
-   Responsive layouts
-   Modals
-   Media viewers
-   User dashboards
-   Persistent data

These requirements are significantly better suited to a component-based
web application than a single Streamlit script.

------------------------------------------------------------------------

# 22. Backend Technology

Recommended:

-   FastAPI
-   Python
-   Pydantic
-   LangChain
-   Gemini API

The existing Python recommendation logic should be reused here.

## Backend responsibilities

-   Authentication validation
-   AI recommendations
-   Game metadata aggregation
-   External API calls
-   Recommendation caching
-   Game enrichment
-   User-game operations
-   Ranking persistence
-   Review persistence

------------------------------------------------------------------------

# 23. Database

Recommended:

**PostgreSQL via Supabase**

## Main tables

### users

``` text
id
email
username
display_name
avatar_url
bio
created_at
updated_at
```

### profiles

``` text
user_id
favorite_genres
preferred_platforms
default_difficulty
default_age_rating
is_public
show_library
show_favorites
show_reviews
show_rankings
```

### games

``` text
id
external_id
slug
title
description
short_description
cover_url
hero_url
logo_url
release_date
developer
publisher
platforms
genres
tags
store_url
metadata_source
created_at
updated_at
```

### game_media

``` text
id
game_id
media_type
url
thumbnail_url
sort_order
```

`media_type`:

``` text
screenshot
trailer
artwork
logo
```

### user_games

``` text
id
user_id
game_id
is_favorite
is_wishlisted
status
personal_rating
personal_rank
playtime_hours
notes
started_at
completed_at
created_at
updated_at
```

### reviews

``` text
id
user_id
game_id
rating
title
body
created_at
updated_at
```

### goty_winners

``` text
id
year
game_id
award_name
source
created_at
```

------------------------------------------------------------------------

# 24. API Design

## Authentication

``` text
POST /auth/register
POST /auth/login
POST /auth/logout
POST /auth/refresh
GET  /auth/me
```

## Games

``` text
GET /games
GET /games/{slug}
GET /games/search
GET /games/{id}/similar
GET /games/{id}/media
```

## Discovery

``` text
GET /discover
GET /genres
GET /tags
```

## AI

``` text
POST /recommendations
POST /recommendations/refine
```

## User library

``` text
GET    /me/library
POST   /me/library/{game_id}
PATCH  /me/library/{game_id}
DELETE /me/library/{game_id}
```

## Favorites

``` text
GET   /me/favorites
POST  /me/favorites/{game_id}
DELETE /me/favorites/{game_id}
```

## Rankings

``` text
GET  /me/rankings
POST /me/rankings/reorder
```

## Reviews

``` text
GET  /games/{id}/reviews
POST /games/{id}/reviews
PATCH /reviews/{id}
DELETE /reviews/{id}
```

## GOTY

``` text
GET /goty
GET /goty/{year}
```

------------------------------------------------------------------------

# 25. Caching

External game APIs must not be called unnecessarily.

Implement:

-   Server-side caching
-   Database metadata caching
-   Request deduplication
-   TTLs

Recommended initial TTL:

``` text
Game metadata: 24h–7d
Game media: 7d
Search results: 10–30 min
AI recommendations: 1h for identical normalized requests
```

Never cache private user data globally.

------------------------------------------------------------------------

# 26. Security

Mandatory:

-   Never expose API keys in frontend
-   Never store passwords directly
-   Validate all request bodies
-   Validate external API responses
-   Rate-limit AI recommendation endpoints
-   Rate-limit search endpoints
-   Sanitize user reviews
-   Protect authenticated routes
-   Enforce ownership on user resources
-   Use secure cookies/session handling
-   Add CSRF protection where applicable
-   Do not trust client-provided user IDs
-   Do not allow arbitrary external URLs to be embedded without
    validation

------------------------------------------------------------------------

# 27. Performance Requirements

Target:

-   Fast first contentful render
-   Lazy-load media-heavy sections
-   Do not load every screenshot on the initial page
-   Paginate large game collections
-   Use skeleton loaders
-   Cache API responses
-   Avoid unnecessary Gemini calls
-   Use server-side fetching for SEO-friendly game pages
-   Optimize images

Game detail pages should load hero information first and secondary media
progressively.

------------------------------------------------------------------------

# 28. Loading States

Every asynchronous section needs a meaningful loading state.

Examples:

-   Game card skeleton
-   Hero skeleton
-   Recommendation skeleton
-   Profile skeleton
-   GOTY timeline skeleton

Do not show blank white/black spaces while waiting for APIs.

------------------------------------------------------------------------

# 29. Error Handling

Create user-friendly states.

Examples:

### API unavailable

> Game data is temporarily unavailable. Please try again.

### Gemini failure

> The AI matchmaker is temporarily unavailable. You can still browse
> games.

### Game not found

> We couldn't find this game.

### Image failure

Use a branded Game Finder placeholder.

### Unauthorized

Redirect to login with a meaningful message.

Never display raw stack traces to users.

------------------------------------------------------------------------

# 30. Empty States

Design explicit empty states.

Examples:

### Empty favorites

> Your favorites list is empty. Find a game worth keeping.

Button:

`Explore Games`

### Empty backlog

> Your backlog is clear. That's dangerous.

Button:

`Find a Game`

### No recommendations

> We couldn't find a strong match for those preferences.

Buttons:

-   `Broaden Filters`
-   `Try Again`

------------------------------------------------------------------------

# 31. Animations

Use motion intentionally.

Recommended:

-   Page fade/slide
-   Card hover lift
-   Image zoom
-   Carousel transitions
-   Ranking drag animation
-   Modal transitions
-   Favorite heart animation
-   Skeleton shimmer

Avoid excessive motion.

Respect:

`prefers-reduced-motion`.

------------------------------------------------------------------------

# 32. Responsive Design

Must support:

-   Desktop
-   Laptop
-   Tablet
-   Mobile

Desktop:

-   Full navigation
-   Multi-column cards
-   Horizontal rails

Tablet:

-   Reduced columns
-   Condensed navigation

Mobile:

-   One/two-column cards
-   Horizontal scrolling rails
-   Bottom navigation or menu
-   Full-screen media viewer
-   Touch-friendly controls

No horizontal page overflow.

------------------------------------------------------------------------

# 33. Accessibility

Implement:

-   Semantic HTML
-   Keyboard navigation
-   Focus states
-   ARIA labels
-   Alt text
-   Color contrast
-   Accessible dialogs
-   Accessible carousels
-   Reduced motion

Every icon-only button needs an accessible label.

------------------------------------------------------------------------

# 34. SEO

Public game pages should be indexable.

For:

`/games/[slug]`

Generate:

-   Title
-   Description
-   Open Graph image
-   Twitter/X card metadata
-   Canonical URL

Example:

> The Witcher 3 --- Game Details \| Game Finder

Private pages should not be indexed.

------------------------------------------------------------------------

# 35. Suggested Route Structure

``` text
/
├── /discover
├── /game-finder
├── /games/[slug]
├── /goty
├── /goty/[year]
├── /library
├── /favorites
├── /rankings
├── /profile/[username]
├── /settings
├── /login
├── /signup
└── /forgot-password
```

------------------------------------------------------------------------

# 36. Component Architecture

Suggested frontend structure:

``` text
components/
├── layout/
│   ├── Navbar
│   ├── Sidebar
│   ├── MobileNav
│   └── Footer
│
├── game/
│   ├── GameCard
│   ├── GameGrid
│   ├── GameHero
│   ├── GameDetails
│   ├── GameMediaGallery
│   ├── GameTrailer
│   ├── GameMetadata
│   ├── GameRating
│   └── SimilarGames
│
├── discovery/
│   ├── HeroCarousel
│   ├── GameRail
│   ├── FeaturedSection
│   ├── GenreBrowser
│   └── FilterPanel
│
├── finder/
│   ├── FinderForm
│   ├── NaturalLanguageInput
│   ├── RecommendationCard
│   └── RecommendationGrid
│
├── goty/
│   ├── GotyHero
│   ├── GotyTimeline
│   ├── YearSelector
│   └── WinnerCard
│
├── library/
│   ├── LibraryGrid
│   ├── LibraryFilters
│   ├── LibraryCard
│   └── LibraryStats
│
├── profile/
│   ├── ProfileHeader
│   ├── ProfileStats
│   ├── FavoriteGames
│   └── RankingList
│
└── ui/
    ├── Modal
    ├── Button
    ├── Badge
    ├── Skeleton
    ├── Toast
    └── Rating
```

------------------------------------------------------------------------

# 37. Recommended Repository Structure

Transform the existing repository into a monorepo:

``` text
Game-Finder/
│
├── apps/
│   ├── web/
│   │   ├── app/
│   │   ├── components/
│   │   ├── lib/
│   │   ├── hooks/
│   │   └── styles/
│   │
│   └── api/
│       ├── app/
│       │   ├── routes/
│       │   ├── services/
│       │   ├── models/
│       │   ├── schemas/
│       │   └── core/
│       └── tests/
│
├── data/
│   └── goty/
│
├── scripts/
│
├── legacy/
│   └── streamlit/
│
├── .env.example
├── README.md
└── SPEC.md
```

The old Streamlit app may be retained temporarily under
`legacy/streamlit/` during migration.

------------------------------------------------------------------------

# 38. Migration Strategy

Do not attempt a blind rewrite.

## Phase 1 --- Audit

Inspect:

-   `Game_Finder.py`
-   `prompt.json`
-   `requirements.txt`
-   Existing recommendation behavior
-   Existing image fetching
-   Existing GOTY data

Document reusable functions.

## Phase 2 --- Backend extraction

Move:

-   Gemini logic
-   Prompt handling
-   Game enrichment
-   Image retrieval
-   GOTY data

into reusable Python services.

## Phase 3 --- Database

Create PostgreSQL/Supabase schema.

Implement:

-   Users
-   Games
-   User games
-   Favorites
-   Rankings
-   Reviews
-   GOTY

## Phase 4 --- Frontend shell

Build:

-   Navbar
-   Sidebar
-   Theme
-   Search
-   Routing
-   Auth state

## Phase 5 --- Discovery

Build:

-   Home
-   Discover
-   Game cards
-   Carousels
-   Search

## Phase 6 --- Game pages

Build:

-   Game hero
-   Metadata
-   Media
-   Trailer
-   Similar games
-   User interactions

## Phase 7 --- Game Finder

Port the existing Gemini recommendation system.

## Phase 8 --- GOTY

Build:

-   Timeline
-   Year selector
-   Winner pages
-   Media

## Phase 9 --- Personal library

Build:

-   Library
-   Favorites
-   Wishlist
-   Statuses
-   Rankings

## Phase 10 --- Account system

Build:

-   Login
-   Signup
-   Profile
-   Settings
-   Privacy

## Phase 11 --- Polish

Add:

-   Animations
-   Skeletons
-   Error states
-   Responsive behavior
-   Accessibility
-   SEO
-   Performance optimization

------------------------------------------------------------------------

# 39. Ranking System --- Detailed Requirements

The ranking system is important and must feel polished.

## Interaction

Users can:

-   Drag a favorite game
-   Drop it at another position
-   See live rank changes
-   Undo the last change

Example:

``` text
1. Elden Ring
2. The Witcher 3
3. Red Dead Redemption 2
4. Cyberpunk 2077
```

Dragging #4 to #1 should produce:

``` text
1. Cyberpunk 2077
2. Elden Ring
3. The Witcher 3
4. Red Dead Redemption 2
```

Persist this ordering.

Use integer ranks or an ordering strategy that avoids rewriting the
entire list on every drag where practical.

------------------------------------------------------------------------

# 40. Personal Recommendation Evolution

The AI system should eventually become personalized.

Signals:

-   Favorites
-   Personal ratings
-   Completed games
-   Wishlist
-   Genres
-   Tags
-   Status
-   Search history
-   Recommendation clicks

Do not immediately build a complex ML recommender.

Start with a hybrid approach:

``` text
Gemini semantic matching
+
explicit user preferences
+
favorite genres/tags
+
personal ratings
+
library history
```

Later, a traditional recommender model can be added.

------------------------------------------------------------------------

# 41. Recommendation Feedback

Each AI recommendation should allow:

-   👍 Good recommendation
-   👎 Not for me
-   `Already played`
-   `Hide this game`

Use feedback to improve future recommendations.

Store recommendation events separately from user-game records.

Suggested table:

``` text
recommendation_feedback
id
user_id
game_id
session_id
feedback
created_at
```

------------------------------------------------------------------------

# 42. Analytics

Add privacy-conscious product analytics.

Track:

-   Page views
-   Game detail opens
-   Search terms
-   Recommendation requests
-   Recommendation clicks
-   Favorites
-   Wishlist additions
-   Library additions
-   GOTY year selections

Do not store sensitive information unnecessarily.

------------------------------------------------------------------------

# 43. Testing

## Frontend

Test:

-   Navigation
-   Search
-   Filters
-   Authentication states
-   Favorite toggles
-   Ranking reorder
-   Responsive layout

## Backend

Test:

-   Recommendation schema
-   External API failures
-   Authentication
-   Authorization
-   Game enrichment
-   Ranking persistence

## End-to-end

At minimum:

1.  Register
2.  Login
3.  Search game
4.  Open game
5.  Favorite game
6.  Add to library
7.  Rate game
8.  Reorder favorites
9.  Run Game Finder
10. Open GOTY
11. Logout

------------------------------------------------------------------------

# 44. Environment Variables

Use `.env.example`.

Suggested:

``` env
# Frontend
NEXT_PUBLIC_APP_URL=

# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# AI
GOOGLE_API_KEY=

# Game APIs
STEAM_API_KEY=
IGDB_CLIENT_ID=
IGDB_CLIENT_SECRET=

# Optional analytics
ANALYTICS_KEY=
```

Never commit real keys.

------------------------------------------------------------------------

# 45. Deployment

Recommended architecture:

``` text
User
  |
  v
Next.js Web App
  |
  +---- Supabase Auth
  |
  +---- Supabase PostgreSQL
  |
  +---- FastAPI
          |
          +---- Gemini
          |
          +---- Steam
          |
          +---- IGDB (optional)
```

Possible deployment:

-   Frontend → Vercel
-   Backend → Render / Railway / Fly.io
-   Database/Auth → Supabase

------------------------------------------------------------------------

# 46. Important Product Rules

1.  The UI must never expose API keys.
2.  Do not use fake game data in production pages.
3.  Do not fabricate ratings, publishers, trailers, or release dates.
4.  If metadata is unavailable, clearly show `Not available`.
5.  Do not claim AI match scores are objective review scores.
6.  Keep user data isolated by authenticated user ID.
7.  A user can only modify their own library, rankings, favorites, and
    reviews.
8.  Public profiles must respect privacy settings.
9.  External API failures must not crash the entire site.
10. Never let one missing image break a game card.
11. Never expose raw backend exceptions to users.
12. Avoid excessive animation.
13. Preserve the core AI recommendation capability from the existing
    project.
14. The new application should be an original Game Finder product, not a
    Steam clone.

------------------------------------------------------------------------

# 47. Definition of Done

The project is complete when:

### Product

-   [ ] User can register
-   [ ] User can log in
-   [ ] User can log out
-   [ ] User can edit profile
-   [ ] User can search games
-   [ ] User can browse games
-   [ ] User can filter games
-   [ ] User can open a game detail page
-   [ ] Game page contains rich metadata
-   [ ] Game page contains images
-   [ ] Game page contains trailers where available
-   [ ] User can favorite games
-   [ ] User can wishlist games
-   [ ] User can maintain a library
-   [ ] User can mark games as playing/completed/backlog/dropped
-   [ ] User can rate games
-   [ ] User can review games
-   [ ] User can rank favorite games
-   [ ] Ranking is drag-and-drop
-   [ ] Ranking persists
-   [ ] User can run AI Game Finder
-   [ ] AI recommendations return structured results
-   [ ] GOTY archive works
-   [ ] GOTY pages contain game information
-   [ ] Profile displays gaming activity
-   [ ] Privacy settings work

### UI

-   [ ] Premium dark gaming design
-   [ ] Store-style hero
-   [ ] Horizontal game rails
-   [ ] Responsive game cards
-   [ ] Smooth transitions
-   [ ] Skeleton loaders
-   [ ] Empty states
-   [ ] Error states
-   [ ] Mobile navigation
-   [ ] Keyboard accessibility
-   [ ] Reduced-motion support

### Engineering

-   [ ] Frontend separated from backend
-   [ ] Database persistence
-   [ ] Authentication
-   [ ] Server-side API keys
-   [ ] API validation
-   [ ] External API caching
-   [ ] Tests
-   [ ] `.env.example`
-   [ ] Production build succeeds
-   [ ] README updated
-   [ ] No secrets committed

------------------------------------------------------------------------

# 48. Antigravity Implementation Instructions

Treat this specification as the source of truth.

Before writing code:

1.  Inspect the existing repository.
2.  Understand the current Gemini recommendation flow.
3.  Understand the existing GOTY implementation.
4.  Identify reusable functions.
5.  Create an implementation plan.
6.  Do not destroy working functionality without a migration path.

Then implement incrementally.

### Required development order

``` text
Repository audit
        ↓
Architecture setup
        ↓
Backend extraction
        ↓
Database
        ↓
Authentication
        ↓
Frontend shell
        ↓
Game data/search
        ↓
Game detail pages
        ↓
Game Finder
        ↓
GOTY
        ↓
Library
        ↓
Favorites + ranking
        ↓
Profile/settings
        ↓
Responsive polish
        ↓
Testing
        ↓
Production build
```

After every major phase:

-   Run the project
-   Run tests
-   Fix errors
-   Verify existing features
-   Continue only after the phase works

Do not generate placeholder UI for functionality that is supposed to
work.

If an external API is unavailable during development, create a clean
service abstraction and local development fixtures, but keep the
production integration real.

------------------------------------------------------------------------

# 49. Final UX Goal

The final application should feel like:

**a premium game discovery platform + AI game matchmaker + personal game
library + gaming profile.**

A user should be able to enter the application and naturally move
through this journey:

``` text
Discover
   ↓
See a game
   ↓
Open its detail page
   ↓
Watch trailer / screenshots
   ↓
Read description
   ↓
Favorite / Wishlist / Add to Library
   ↓
Rate / Review
   ↓
Rank it
   ↓
Return to Game Finder
   ↓
Ask AI for the next game
```

The application should feel polished enough that the current Streamlit
prototype looks like the **prototype that started the product**, while
this new version feels like the **real product**.
