# Phase 7: Personal Library, Reviews & Ranked Lists — UI Design Contract (UI-SPEC)

**Phase:** 07-personal-library-reviews-ranked-lists  
**Created:** 2026-10-07  
**Status:** Approved  

---

## 1. Scope & Purpose

This design contract specifies the user interface, component specifications, interaction flows, animation timings, and accessibility behaviors for personal gaming library tracking, star ratings, written markdown reviews, the Top 10 ranked list builder, and the curated Game of the Year (GOTY) interactive archive.

---

## 2. Layout Structure & Route Specifications

### 2.1. Personal Library (`/library`)
- **Route**: `frontend/src/app/library/page.tsx`
- **Container**: `max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8`
- **Header**:
  - Title: *"My Gaming Library"* with glowing gamepad icon.
  - Subtitle: *"Track your backlog, playing status, and personal all-time rankings."*
  - Tab Switcher:
    - Tab 1: **"Game Shelves"** (active by default)
    - Tab 2: **"Top 10 Rankings"**
- **View 1: Game Shelves View**:
  - Filter Bar: Horizontal shelf tabs with live item count badges:
    - `All Games`
    - `Wishlist` (indigo pill)
    - `Backlog` (amber pill)
    - `Currently Playing` (emerald pill with pulsing dot)
    - `Completed` (cyan pill)
    - `Dropped` (slate pill)
  - Search & Sort controls: Filter by game title, sort by: Title, Personal Rating, Playtime, or Date Added.
  - Game Grid: Responsive 2-to-4 column grid (`grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6`).
  - Empty State: Sleek dark glass card with informative text and "Discover Games" / "Find with AI" buttons when shelf has no entries.
- **View 2: Top 10 Rankings View (`Top10Builder`)**:
  - Header: Editable custom list title input (e.g. *"My All-Time Top 10"*).
  - 10 Rank Cards: Vertical stacked list of slots #1 to #10 with visual prestige tier styling.
  - Add/Pick game modal or dropdown to fill vacant slots.
  - Quick reorder controls: Up (▲), Down (▼), Remove (✕).
  - Sticky/Bottom Action Bar: "Save Top 10 Rankings" button with saved state indicator.

### 2.2. Game of the Year Archive (`/goty`)
- **Route**: `frontend/src/app/goty/page.tsx`
- **Container**: `max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-10`
- **Header**:
  - Trophy badge with golden glow: *"The Game Awards Archive"*.
  - Title: *"Game of the Year Hall of Fame"*.
  - Subtitle: *"Relive gaming history from 2014 to present. Explore winners, nominees, and add classics to your library."*
- **Interactive Timeline (`GotyTimeline`)**:
  - Horizontal scrollable or flex bar of years: `2014`, `2015`, ..., `2024`.
  - Active year: Golden laurel border (`ring-2 ring-amber-400 bg-amber-500/20 text-amber-300 font-bold`).
  - Inactive years: Slate glass pills with hover lift.
- **Winner Spotlight Card (`GotyWinnerCard`)**:
  - Hero card with 16:9 or panoramic backdrop artwork, golden laurels overlay (`Trophy` icon, *"2023 Game of the Year Winner"*).
  - Game title, developer, publisher, release date, and genre badges.
  - Award winning rationale & historical legacy blurb.
  - Quick action buttons: "View Game Details", "Add to Library" (with `ShelfSelector`), "Steam Store".
- **Nominees / Runner-ups Section (`GotyNominees`)**:
  - Section title: *"Official Nominees for [Year]"*.
  - Responsive grid of 4-5 nominee cards with "Nominee" ribbon badge, rating, genres, and quick shelf action.

### 2.3. Game Detail Reviews & Shelf Integration (`/games/[id]`)
- **Header Action**:
  - Update `GameHeader.tsx` to include `ShelfSelector` dropdown allowing instant assignment to `Wishlist`, `Backlog`, `Currently Playing`, or `Completed`.
- **Reviews & Ratings Section**:
  - Placed below "About This Game" on the detail page.
  - Summary Bar: Aggregate score pill (e.g. `8.8 / 10`), total reviews count, and personal rating selector.
  - Review Composer (`ReviewForm`):
    - Score selector (1 to 10 stars/pills).
    - Review title input (optional).
    - Tabbed Markdown Editor: "Write" tab with textarea, "Preview" tab with rendered HTML.
    - Submit button with optimistic state.
  - Community Reviews List (`ReviewList`):
    - Cards displaying user avatar, handle, star score badge, review date, and formatted markdown content.

---

## 3. Component Design Contracts

### 3.1. Shelf Selector (`ShelfSelector.tsx`)
```typescript
interface ShelfSelectorProps {
  gameId: string | number;
  currentStatus?: 'wishlist' | 'backlog' | 'playing' | 'completed' | 'dropped' | null;
  onStatusChange?: (status: 'wishlist' | 'backlog' | 'playing' | 'completed' | 'dropped' | null) => void;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}
```
- **Visuals**:
  - Default: Sleek glass button displaying current status (e.g., `Currently Playing` with emerald dot, or `+ Add to Shelf` when unassigned).
  - Dropdown Menu: Glass popup (`bg-slate-900/95 border border-white/10 rounded-xl shadow-2xl p-1 z-30`).
  - Options with icons & colors:
    - 🔖 Wishlist (indigo)
    - ⏳ Backlog (amber)
    - 🎮 Currently Playing (emerald)
    - 🏆 Completed (cyan)
    - ✕ Remove from Library (rose)

### 3.2. Library Game Card (`LibraryGameCard.tsx`)
```typescript
interface LibraryGameCardProps {
  item: UserLibraryItem;
  onStatusChange: (status: ShelfStatus | null) => void;
  onFavoriteToggle: () => void;
  onPlaytimeChange?: (hours: number) => void;
  onDelete: () => void;
}
```
- **Visuals**:
  - Vertical card with high-res cover image (`aspect-[16/9]` or `aspect-[3/4]`), title, and status pill overlay.
  - Bottom controls:
    - `ShelfSelector` compact trigger.
    - Favorite heart button (`Heart` icon, filled rose when active).
    - Playtime counter with quick edit modal/input (`Clock` icon, e.g. `42.5 hrs`).
    - Remove button (`Trash2` icon) with confirmation tooltip.

### 3.3. Star Rating Component (`StarRating.tsx`)
```typescript
interface StarRatingProps {
  value: number; // 1 to 10
  onChange?: (rating: number) => void;
  readOnly?: boolean;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}
```
- **Visuals**:
  - 10 interactive star segments (or 5 stars with half-step hover) with golden shimmer.
  - Hover highlights up to hovered value with numerical badge (e.g., `"8 / 10 • Great"`).
  - Rating semantic labels:
    - 1-2: Poor
    - 3-4: Mediocre
    - 5-6: Decent
    - 7-8: Great
    - 9-10: Masterpiece

### 3.4. Safe Markdown Renderer (`MarkdownRenderer.tsx`)
```typescript
interface MarkdownRendererProps {
  content: string;
  className?: string;
}
```
- **Supported Markdown elements**:
  - Headings: `# Heading 1`, `## Heading 2`, `### Heading 3`
  - Bold: `**bold**`
  - Italics: `*italic*`
  - Blockquotes: `> quote`
  - Unordered lists: `- list item`
  - Inline code: `` `code` ``
  - Paragraphs and line breaks
- Sanitization: Automatically escapes HTML and renders pure React elements to eliminate XSS risks.

### 3.5. Top 10 Builder (`Top10Builder.tsx`)
```typescript
interface Top10BuilderProps {
  initialTitle?: string;
  initialPositions?: RankedPosition[];
  onSave?: (title: string, positions: RankedPosition[]) => Promise<void>;
}
```
- **Visuals**:
  - 10 slots with distinctive rank badges:
    - Rank 1: Gold Laurel badge (`#1 🥇 Champion`, border `amber-400/50`, glow)
    - Rank 2: Silver badge (`#2 🥈 Runner Up`, border `slate-300/40`)
    - Rank 3: Bronze badge (`#3 🥉 Third Place`, border `amber-700/40`)
    - Ranks 4-10: Numbered glass badge (`#4` to `#10`)
  - Controls per slot: Move Up (▲), Move Down (▼), Remove (✕).
  - "Add Game" trigger opens search modal to pick from library or catalog.
  - Save button with animated "Saved!" confirmation.

### 3.6. GOTY Timeline & Winner Card (`GotyTimeline.tsx`, `GotyWinnerCard.tsx`)
- **Timeline**:
  - Horizontal flex list of years 2014 through 2024.
  - Active year gets golden glow ring, bold text, and subtle laurel icon.
- **Winner Card**:
  - Wide panoramic presentation with high-res backdrop image, gradient overlay.
  - Golden laurel badge: *"Game of the Year — [Year]"*.
  - Title, developer, genre badges, release date.
  - Narrative highlight: Why this title defined the gaming landscape.
  - Action buttons: "Game Details", "Shelf Selector", "Steam Link".

---

## 4. Accessibility & Responsive Breakpoints

- Keyboard navigation: All buttons, dropdowns, and rating stars are focusable with `Tab` and interactive via `Enter` / `Space`.
- ARIA semantics:
  - `role="tablist"`, `role="tab"`, and `aria-selected` for shelf filters and GOTY timeline.
  - `role="radiogroup"` and `aria-valuenow` for star rating.
  - `aria-label` on icon-only buttons (favorite, remove, shelf selector).
- Responsive breakpoints:
  - Mobile (<640px): 1-column cards, scrollable horizontal timeline, full-width shelf selector.
  - Tablet (640px - 1024px): 2-column library grid, compact Top 10 list.
  - Desktop (>1024px): 3-4 column library grid, two-column reviews view, panoramic GOTY spotlight.
