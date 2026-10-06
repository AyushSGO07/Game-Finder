# Phase 6: AI Game Finder Interactive Interface — UI Design Contract (UI-SPEC)

**Phase:** 06-ai-game-finder-interactive-interface  
**Created:** 2026-10-07  
**Status:** Approved  

---

## 1. Scope & Purpose

This design contract specifies the user interface, component specifications, interaction flows, animation timings, and accessibility behaviors for the AI Game Finder wizard and results showcase (`/finder`). It defines contracts for the step-by-step preference selector, natural language prompt bar with inspiration chips, animated generation skeleton with status ticker, and the 8-card AI recommendation results view with rationale callouts and quick-save buttons.

---

## 2. Layout Structure & State Flow

The `/finder` page operates as a multi-stage interactive application:
1. **Stage 1: Wizard Mode (`FinderWizard`)**
   - Centered container (`max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12`).
   - Header with glowing AI title badge (`Sparkles` icon, gradient text `AI Game Matchmaker`).
   - Progress Stepper: 3 steps (`1: Genre & Vibe`, `2: Difficulty & Age`, `3: Guidance Prompt`).
   - Interactive step cards with glassmorphism styling (`bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-2xl p-6 sm:p-8 shadow-2xl`).
   - Navigation footer with "Back", "Next", and "Find Games ✨" actions.

2. **Stage 2: Generation Loading (`FinderSkeleton`)**
   - Full-width container (`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10`).
   - Top status header with pulsing AI orb and animated text ticker:
     - *"Analyzing your gaming profile..."*
     - *"Querying Google Gemini recommendation model..."*
     - *"Scanning catalog metadata & Steam artwork..."*
     - *"Synthesizing personalized match rationales..."*
   - Responsive 8-card skeleton grid (`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6`).

3. **Stage 3: Results Showcase (`FinderResults`)**
   - Full-width container (`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8`).
   - Action bar: Summary pills of selected criteria, "Tweak Preferences" button (reopens wizard preserving inputs), and "New Search" button (resets defaults).
   - 8-card responsive grid (`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6`).
   - Animated staggered card entrance (`framer-motion` staggerChildren).

---

## 3. Component Contracts

### 3.1. Wizard Stepper (`WizardStepper.tsx`)
- **Props**:
  ```typescript
  interface WizardStepperProps {
    currentStep: number; // 1, 2, or 3
    totalSteps: number;  // 3
    onStepClick?: (step: number) => void;
  }
  ```
- **Visuals**:
  - Horizontal bar connecting 3 numbered step pills.
  - Active Step: Ring with cyan/indigo border (`ring-2 ring-indigo-500 bg-indigo-600 text-white font-bold`).
  - Completed Step: Emerald green checkmark badge (`bg-emerald-600/20 text-emerald-400 border border-emerald-500/30`).
  - Upcoming Step: Muted circle (`bg-slate-800 border border-white/10 text-slate-500`).

### 3.2. Step 1: Genre & Mood Selector (`GenreMoodSelector.tsx`)
- **Primary Genres**:
  - 12 options matching backend schema: `Action`, `RPG`, `Adventure`, `Shooter`, `Horror`, `Strategy`, `Simulation`, `Racing`, `Sports`, `Indie`, `Puzzle`, `Platformer`, `Any`.
  - Grid: `grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5`.
  - Selected state: `bg-indigo-600/25 border-indigo-500 text-indigo-300 font-semibold ring-1 ring-indigo-500/50`.
- **Mood / Vibe Chips**:
  - Options: `Cozy & Chill`, `High Adrenaline`, `Deep Story`, `Mind-Bending`, `Dark & Gritty`, `Tactical & Strategic`, `Pure Fun`.
  - Multi-select or single-select chip toggle with glowing accent border.

### 3.3. Step 2: Difficulty & Age Selector (`DifficultyAgeSelector.tsx`)
- **Difficulty Cards**:
  - 5 cards: `Casual` (Relaxed & easygoing), `Normal` (Balanced challenge), `Hard` (Requires mastery), `Punishing` (Unforgiving souls-like), `Any` (No preference).
  - Selected state: Indigo gradient border, illuminated icon.
- **Age Rating Pills**:
  - 5 options matching backend schema: `Everyone` (E), `Everyone 10+` (E10+), `Teen` (T), `Mature` (M 17+), `Any`.

### 3.4. Step 3: Conversational Prompt (`ConversationalPrompt.tsx`)
- **Prompt Input**:
  - Auto-expanding or multi-line textarea with placeholder:
    *"e.g., An atmospheric dark fantasy RPG with rich environmental storytelling, challenging boss fights, and a melancholy orchestral soundtrack..."*
  - Character counter: `0 / 300` limit with warning indicator at 280+.
  - "Clear" button to reset input.
- **Inspiration Chips**:
  - Interactive preset prompts that fill the text box on click:
    - *"Cyberpunk detective mystery with synthwave vibes"*
    - *"Cozy farming sim with deep crafting and secrets"*
    - *"Fast-paced rogue-lite with incredible build variety"*
    - *"Narrative sci-fi adventure with branching choices"*

### 3.5. Recommendation Card (`RecommendationCard.tsx`)
- **Props**:
  ```typescript
  interface RecommendationCardProps {
    recommendation: EnrichedRecommendation;
    index: number;
    onSaveToLibrary?: (gameId: string | number) => void;
  }
  ```
- **Visuals**:
  - Container: Glass card `bg-slate-900/70 border border-white/10 rounded-2xl overflow-hidden hover:border-indigo-500/50 transition-all duration-300 hover:shadow-xl hover:shadow-indigo-500/10 flex flex-col h-full`.
  - Media Header: Aspect ratio `16:9` capsule or hero artwork with subtle hover scale (`group-hover:scale-105 transition-transform duration-500`). Fallback dark gradient placeholder if image missing.
  - Rank / Laurel Badge: Absolute positioned badge (e.g., `#1 Match` or `Score: 9.5`).
  - Title: Line-clamp 1 font-bold text-lg text-white group-hover:text-indigo-300 transition-colors.
  - Attribute Badges: Wrap flex row of subtle pills (`bg-white/5 border border-white/10 text-xs text-slate-300 px-2 py-0.5 rounded-full`).
  - **AI Rationale Callout**:
    - Highlighted box: `bg-indigo-950/30 border border-indigo-500/20 rounded-xl p-3 text-xs leading-relaxed text-indigo-200/90`.
    - Header: `flex items-center gap-1.5 text-indigo-400 font-semibold mb-1` with `Sparkles` icon.
    - Match reason text explaining exactly why Gemini recommended this game.
  - Action Row:
    - Quick-Save button: "Save" / "Saved" toggle with bookmark icon.
    - "Explore" link: Direct navigation to `/games/[id]`.

### 3.6. Generation Skeleton (`FinderSkeleton.tsx`)
- **Grid**: 8 skeleton cards with pulsing shimmer (`animate-pulse`).
- **Artwork placeholder**: Aspect-video shimmer container.
- **Title & Badge placeholder**: 2 skeleton bars.
- **Rationale placeholder**: Rounded box with shimmer lines.
- **Live Status Ticker**: Smooth interval transition every 1.5 seconds updating progress text.

---

## 4. Accessibility & Responsive Design

1. **ARIA Roles**:
   - Wizard progress marked with `role="progressbar"` or `aria-valuenow`.
   - Option chips marked with `role="radio"` or `role="checkbox"` and `aria-checked`.
   - Results announced with `aria-live="polite"` so screen readers announce "8 game recommendations loaded".
2. **Keyboard Navigation**:
   - Full keyboard focusability on option chips, text areas, and CTA buttons.
   - Enter/Space triggers selection and advances stepper.
3. **Responsive Breakpoints**:
   - Mobile (`<640px`): Single column cards, compact stepper with step labels hidden, full-width CTA buttons.
   - Tablet (`640px - 1024px`): 2-column results grid.
   - Desktop (`>1024px`): 4-column results grid displaying all 8 recommendations in 2 clean rows.
