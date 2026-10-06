# Phase 5: Game Detail Pages & Rich Media — UI Design Contract (UI-SPEC)

**Phase:** 05-game-detail-pages-rich-media  
**Created:** 2026-10-07  
**Status:** Approved  

---

## 1. Scope & Purpose

This design contract specifies the visual layout, component hierarchy, media player interactions, and accessibility behaviors for Game Finder's Game Detail Pages (`/games/[id]`). It defines the exact contracts for the header banner, trailer video player, screenshot gallery, lightbox modal, metadata sidebar, and PC system requirements tabs.

---

## 2. Layout Grid & Page Structure

### 2.1. Desktop Layout (Two-Column Master-Detail)
- **Container**: `max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8`.
- **Hero/Header Banner**: Full-width header with game title, metacritic score pill, genres, and primary action CTAs.
- **Main Grid**: Responsive 12-column split:
  - **Left / Center Column (8 cols / 66%)**:
    1. Media Showcase (16:9 Main Viewport + Horizontal Thumbnail Strip).
    2. "About This Game" rich synopsis with dark glass container.
    3. PC System Requirements card with "Minimum" and "Recommended" tabs.
  - **Right Sidebar (4 cols / 33%)**:
    1. Game Capsule Poster with subtle glass border.
    2. Key Metadata Card (Developer, Publisher, Release Date, Platforms, Rating).
    3. Tags & Genres Cloud.
    4. External Store Links (Steam Store, Official Website).

### 2.2. Mobile Layout (Single Column Stack)
- Stacks vertically: Header -> Capsule & Media Gallery -> Quick Action Buttons -> Metadata Cards -> Synopsis -> System Requirements.

---

## 3. Component Contracts

### 3.1. Game Header (`GameHeader.tsx`)
- **Title**: `text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white`.
- **Badges**:
  - Score Laurel: `bg-amber-500/20 text-amber-300 border border-amber-500/30 px-3 py-1 rounded-full text-sm font-bold flex items-center gap-1.5`.
  - Release Date: `text-xs sm:text-sm text-slate-400 font-medium`.
- **Action CTAs**:
  - "Add to Library": `bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-5 py-2.5 rounded-xl shadow-lg shadow-indigo-600/30`.
  - "Bookmark / Favorite": `bg-white/10 hover:bg-white/20 text-slate-200 border border-white/15 px-4 py-2.5 rounded-xl`.
  - "Steam Store": `bg-slate-800 hover:bg-slate-700 text-slate-200 border border-white/10 px-4 py-2.5 rounded-xl flex items-center gap-2`.

### 3.2. Media Showcase & Trailer Player (`MediaGallery.tsx`, `TrailerPlayer.tsx`)
- **Main Viewport**:
  - Aspect ratio: `16:9` (`aspect-video w-full rounded-2xl overflow-hidden bg-slate-950 border border-white/10 relative shadow-2xl`).
  - Active Item:
    - If Trailer selected: Render `<video>` player with poster thumbnail, play/pause toggle, volume mute/unmute, and progress indicator.
    - If Screenshot selected: Render full-resolution screenshot image with zoom-on-hover capability and "Expand Fullscreen" button (`Maximize2` icon).
- **Thumbnail Strip**:
  - Horizontal scrolling row below viewport (`flex gap-3 overflow-x-auto scrollbar-none py-3`).
  - Thumbnail Cards: Aspect ratio `16:9`, `w-28 sm:w-36 shrink-0 rounded-lg overflow-hidden border`.
  - Active State: `border-indigo-500 ring-2 ring-indigo-500/50 scale-102`.
  - Video Badge: Small play badge overlay (`Play` icon) on video thumbnails to distinguish from screenshots.

### 3.3. Screenshot Lightbox Modal (`ScreenshotLightbox.tsx`)
- **Trigger**: Click on active screenshot in main viewport or "Expand Fullscreen" button.
- **Container**: Fullscreen overlay (`fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex items-center justify-center p-4 sm:p-8`).
- **Image**: High-resolution image constrained to `max-w-7xl max-h-[85vh] object-contain rounded-xl shadow-2xl`.
- **Controls**:
  - Top Bar: Image counter (`Image 3 of 12`) + Close button (`X` button or `ESC`).
  - Left & Right Chevrons: Floating circular buttons (`ChevronLeft` / `ChevronRight`) with glass styling.
  - Keyboard Navigation: `ArrowLeft` (previous), `ArrowRight` (next), `Escape` (close).

### 3.4. Metadata Sidebar (`GameSidebar.tsx`)
- **Surface**: `bg-slate-900/60 border border-white/5 rounded-2xl p-6 backdrop-blur-md space-y-6`.
- **Items**:
  - Developer Studios: Clickable chips linking to search.
  - Publishers: Formatted labels.
  - Release Date: Human-readable calendar format.
  - Platforms: Badges for `Windows`, `Mac`, `Linux` with icons.
  - Genre Chips: Cyan & Indigo tags.
  - External links: Button linking directly to Steam Store URL with external arrow icon.

### 3.5. System Requirements Tabs (`SystemRequirements.tsx`)
- **Surface**: Dark glass container with tab bar: "Minimum Requirements" and "Recommended Requirements".
- **Fields Displayed**:
  - OS / Operating System
  - Processor / CPU
  - Memory / RAM
  - Graphics / GPU
  - Storage / Disk space
- **HTML Sanitization**: Cleans and strips raw HTML tags from Steam requirement descriptions while preserving bold spec keys.

---

## 4. Accessibility & Quality Checklist

- [x] Semantic HTML tags: `<article>`, `<section>`, `<aside>`, `<video>`, `<dialog>`.
- [x] Lightbox traps focus, handles `Escape` key to close, and restores focus on exit.
- [x] Touch swipe and click controls on media thumbnail strips and screenshot lightbox.
- [x] High-contrast text on all dark glass panels (ratio >= 4.5:1).
- [x] Fallback placeholders for broken images and missing trailer streams.
