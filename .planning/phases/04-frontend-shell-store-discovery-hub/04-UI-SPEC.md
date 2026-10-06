# Phase 4: Frontend Shell & Store Discovery Hub — UI Design Contract (UI-SPEC)

**Phase:** 04-frontend-shell-store-discovery-hub  
**Created:** 2026-10-07  
**Status:** Approved  

---

## 1. Scope & Purpose

This design contract specifies the visual architecture, component contracts, interaction behaviors, and design tokens for the Next.js 15 frontend application shell, global navigation, and digital-store-inspired discovery hub. It serves as the single source of truth for all Phase 4 implementations.

---

## 2. Visual Architecture & Design Tokens

### 2.1. Color System (Dark Cinematic)

| Token | Hex / Value | Semantic Usage |
|-------|-------------|----------------|
| `bg-primary` | `#090a0f` | Main application canvas background |
| `bg-surface` | `#111420` | Secondary container backgrounds |
| `bg-glass` | `rgba(18, 22, 34, 0.75)` | Cards, shelves, dropdowns with `backdrop-blur-md` |
| `border-glass` | `rgba(255, 255, 255, 0.08)` | Subdued card and section borders |
| `border-glass-hover` | `rgba(99, 102, 241, 0.4)` | Hover highlight borders |
| `accent-primary` | `#6366f1` (Indigo-500) | Primary CTA buttons, active route indicators |
| `accent-glow` | `rgba(99, 102, 241, 0.35)` | Box-shadow glow on buttons and active cards |
| `accent-cyan` | `#06b6d4` (Cyan-500) | Genre tags, technology badges |
| `accent-gold` | `#f59e0b` (Amber-500) | Review ratings, Metacritic/GOTY laurels |
| `text-primary` | `#f8fafc` (Slate-50) | High-contrast headings and primary titles |
| `text-secondary` | `#94a3b8` (Slate-400) | Game descriptions, release dates, secondary text |
| `text-muted` | `#64748b` (Slate-500) | Footers, subtle metadata labels |

### 2.2. Typography

- **Headings**: Sans-serif (`Inter`, `system-ui`), `font-bold` (700) or `font-semibold` (600), `tracking-tight`.
  - Hero Title: `text-3xl md:text-5xl lg:text-6xl`, line-height 1.1.
  - Section Header: `text-xl md:text-2xl`, font-weight 700.
  - Card Title: `text-sm md:text-base`, font-weight 600, `line-clamp-1`.
- **Body & Metadata**: `text-xs md:text-sm`, `leading-relaxed`.

---

## 3. Global Navigation Contract

### 3.1. Desktop Top Bar (`Navbar.tsx`)
- **Layout**: Fixed/Sticky top bar (`h-16 w-full backdrop-blur-md bg-slate-950/80 border-b border-white/5 z-50 px-6 flex items-center justify-between`).
- **Brand Mark**: "Game Finder" with glowing gamepad icon.
- **Navigation Links**:
  - `Home` (`/`)
  - `Discover` (`/discover`)
  - `AI Finder` (`/finder`)
  - `GOTY` (`/goty`)
  - `My Library` (`/library`)
- **Action Triggers**:
  - Quick Search input / modal trigger (`Ctrl + K` / `Cmd + K` hint badge).
  - Auth CTA: "Sign In" button or User Profile avatar pill with gamer handle.

### 3.2. Responsive Mobile Navigation (`MobileNav.tsx`)
- **Header**: Compact header with Brand Mark, Search icon, and Hamburger toggle.
- **Mobile Drawer / Bottom Bar**:
  - Slide-out drawer or bottom navigation bar with icons and labels for Home, Discover, Finder, GOTY, and Library.

---

## 4. Store Hero Carousel Specification (`HeroCarousel.tsx`)

### 4.1. Slide Anatomy
- **Height**: 480px on desktop (`min-h-[480px] md:h-[540px]`), 380px on mobile.
- **Background**: High-res backdrop artwork with multi-directional gradient masks:
  - Bottom vignette (`from-slate-950 via-slate-950/60 to-transparent`).
  - Left radial vignette ensuring crisp text contrast.
- **Content Overlay**:
  - Rating Badge (e.g., `★ 9.6` or Metacritic badge).
  - Genre pills (e.g., `Action`, `RPG`, `Open World`).
  - Game Title (bold, cinematic tracking).
  - Short Synopsis (max 2 lines, `line-clamp-2`).
  - Action Buttons:
    - Primary CTA: "Explore Game" (`bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/25`).
    - Secondary CTA: "Add to Favorites" (`backdrop-blur bg-white/10 hover:bg-white/20 border border-white/15`).

### 4.2. Carousel Controls
- Auto-play: 5-second interval, pauses automatically on cursor hover or focus.
- Slide navigation: Prev / Next chevron buttons with glass styling.
- Pagination indicators: Horizontal pill indicators showing active slide and click-to-jump.

---

## 5. Categorized Discovery Shelves (`GameShelf.tsx` & `GameCard.tsx`)

### 5.1. Shelf Sections
1. **Featured Games**: High-priority curated releases with large capsule cards.
2. **Trending Now**: Popular games with compact horizontal layout.
3. **New Releases**: Recently launched titles sorted by release date.
4. **Top Rated**: Highest rated games with prominent rating laurels.
5. **Hidden Gems**: High ratings with indie appeal.

### 5.2. Shelf Navigation & Behavior
- Horizontal scrolling container with CSS scroll snap (`snap-x snap-mandatory`).
- Shelf Header: Section title with glowing accent dot + "View All" link with arrow.
- Navigation arrows: Left and right chevron scroll buttons that smoothly scroll the shelf by one view page.

### 5.3. Game Card Specification
- **Dimensions**: Aspect ratio `16:9` for capsules or `3:4` vertical cover format (`w-[240px] md:w-[280px] shrink-0 snap-start`).
- **Surface**: Glassmorphism container (`bg-slate-900/60 border border-white/5 rounded-xl overflow-hidden hover:border-indigo-500/50 hover:shadow-xl hover:shadow-indigo-500/10 transition-all duration-300 hover:-translate-y-1.5`).
- **Card Elements**:
  - High-res cover image with fallback placeholder.
  - Rating pill in top-right corner.
  - Title with `truncate` or `line-clamp-1`.
  - Tags / genres line (max 2 badges).
  - Release date or developer credit.

---

## 6. Genre Hub Specification (`GenreHub.tsx`)

### 6.1. Genre Tiles Grid
12 interactive category tiles in a responsive grid (`grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4`):
1. **Action** (Crimson/Orange gradient)
2. **RPG** (Violet/Purple gradient)
3. **Adventure** (Emerald/Teal gradient)
4. **Shooter** (Amber/Yellow gradient)
5. **Horror** (Blood Red/Black gradient)
6. **Strategy** (Cyan/Blue gradient)
7. **Simulation** (Blue/Indigo gradient)
8. **Racing** (Fuchsia/Pink gradient)
9. **Sports** (Lime/Green gradient)
10. **Indie** (Purple/Cyan gradient)
11. **Puzzle** (Teal/Emerald gradient)
12. **Platformer** (Sky Blue/Cyan gradient)

Each tile features:
- Thematic gradient backdrop.
- Lucide icon representing the genre.
- Title and subtitle ("Explore games").
- Hover lift and glow effect.

---

## 7. Quality & Accessibility Verification

- [x] Responsive layout validated from 360px mobile to 1920px ultrawide.
- [x] Touch swipe and keyboard arrow navigation enabled on carousels and shelves.
- [x] Semantic HTML (`header`, `nav`, `main`, `section`, `article`, `footer`).
- [x] Color contrast ratios >= 4.5:1 on text elements against dark backgrounds.
