# Phase 6: AI Game Finder Interactive Interface - Research

**Researched:** 2026-10-07  
**Domain:** Multi-Step Wizard / Conversational Prompt Matching / AI Recommendations / Gemini API Integration / Framer Motion Animation  
**Confidence:** HIGH  

<user_constraints>
## User Constraints (from REQUIREMENTS.md & ROADMAP.md)

- **Requirements Covered**:
  - `FIND-01`: Dedicated Game Finder wizard with step-by-step preference selection (genre, mood, age rating, difficulty).
  - `FIND-02`: Conversational query input allowing natural language prompt matching.
  - `FIND-03`: Results view displaying exactly 8 rich game cards with AI rationale, tags, and quick-save buttons.
  - `FIND-04`: Polished loading state with animated skeletons and progress feedback during AI generation.
- **Frontend Architecture**:
  - Next.js 15 App Router page at `frontend/src/app/finder/page.tsx`.
  - Dark cinematic visual system (`#090a0f` canvas, `#111420` surface, glassmorphism containers, indigo/cyan/gold accents).
  - Framer Motion for step transitions, card stagger reveals, and progress spinners.
  - Lucide React iconography (`Sparkles`, `Gamepad2`, `Sliders`, `Flame`, `ShieldAlert`, `RefreshCw`, `Bookmark`, etc.).
- **Backend Architecture**:
  - `POST /api/v1/recommendations`: Accepts `RecommendationRequest(genre, age, difficulty, prompt)` and returns `RecommendationResponse(recommendations: List[GameRecommendation])` powered by LangChain + Gemini.
  - `POST /api/v1/games/batch`: Accepts list of game title strings and returns enriched `GameCard` list with Steam AppIDs, artwork, ratings, and capsules.
  - Resilient offline fallback in `frontend/src/lib/mockData.ts` to guarantee 100% test reliability and zero crashes if Gemini API key or backend service is unreachable.
</user_constraints>

<architectural_responsibility_map>
## Architectural Responsibility Map

| Component / File | Primary Responsibility | Secondary Responsibility |
|---|---|---|
| `app/finder/page.tsx` | Main Page Controller for `/finder` | Coordinates Wizard, Loading Skeleton, and Results views |
| `components/finder/FinderWizard.tsx` | Multi-step preference container | Manages step progression, validation, and submit action |
| `components/finder/WizardStepper.tsx` | Visual progress bar / steps tracker | Indicates active, completed, and upcoming steps |
| `components/finder/GenreMoodSelector.tsx` | Step 1: Genre and Mood/Vibe selection | Visual chip toggles with gradient accents |
| `components/finder/DifficultyAgeSelector.tsx` | Step 2: Difficulty & Age Rating cards | Interactive level selectors with descriptive guidance |
| `components/finder/ConversationalPrompt.tsx` | Step 3: Natural language prompt input | Preset inspiration chips, character counter, reset |
| `components/finder/FinderSkeleton.tsx` | Polished loading skeleton with feedback | Dynamic progress message ticker & 8 card skeletons |
| `components/finder/FinderResults.tsx` | Results view for exactly 8 recommendations | Active criteria chips, tweak/reset buttons |
| `components/finder/RecommendationCard.tsx` | Rich card displaying individual game match | AI rationale box, attribute badges, quick-save, link |
| `lib/api.ts` & `lib/mockData.ts` | Data fetchers & fallback recommendation engine | Batch enrichment and mock generator for offline mode |
| `types/game.ts` | Type contracts for recommendations & wizard | End-to-end typing across components and API client |
</architectural_responsibility_map>

<research_summary>
## Technical Insights & Best Practices

1. **Wizard State Management**:
   A clean client-side state machine with steps `1: Genre & Vibe`, `2: Difficulty & Age`, and `3: Prompt Guidance`.
   Support both sequential stepper navigation and a quick "Refine" view on the results page to prevent user friction when re-rolling recommendations.

2. **Backend Payload Compatibility**:
   The backend FastAPI service (`RecommendationRequest`) strictly validates:
   - `genre`: Allowed genres include `"Action"`, `"RPG"`, `"Adventure"`, `"Shooter"`, `"Horror"`, `"Strategy"`, `"Simulation"`, `"Racing"`, `"Sports"`, `"Indie"`, `"Puzzle"`, `"Platformer"`, `"Any"`.
   - `age`: `"Everyone"`, `"Everyone 10+"`, `"Teen"`, `"Mature"`, `"Any"`.
   - `difficulty`: `"Casual"`, `"Normal"`, `"Hard"`, `"Punishing"`, `"Any"`.
   - `prompt`: Freeform text (e.g. `"cyberpunk detective with synthwave soundtrack and cozy coffee shops"`).
   The frontend selector options will exactly mirror these enum values while augmenting the `prompt` with the user's selected mood/vibe (e.g. `"Mood: Cozy & Relaxing. <user prompt>"`).

3. **Card Enrichment Pipeline**:
   The backend recommendation response returns:
   ```json
   {
     "recommendations": [
       {
         "name": "Elden Ring",
         "match_reason": "Seamless open world with demanding combat matching your Hard difficulty preference.",
         "attributes": ["Souls-like", "Open World", "Dark Fantasy"]
       }
     ]
   }
   ```
   To display rich visual cards (`FIND-03`), the frontend combines the recommendation output with Steam metadata via `POST /api/v1/games/batch` or local metadata mapping. Each card gets high-resolution artwork (`capsule_image` or `hero_image`), rating, AppID, and direct link to `/games/[id]`.

4. **Progress Feedback During Inference (`FIND-04`)**:
   LLM inference and batch enrichment typically take 2-4 seconds. Rather than a static spinner, an engaging skeleton screen with an animated progress ticker cycling through 4-5 status stages keeps the user informed and delightedly engaged.

5. **Quick-Save & Library Integration**:
   Each `RecommendationCard` includes an interactive "Save to Library" / "Wishlist" button with immediate visual feedback (e.g., changing to "Saved" with a checkmark), laying the exact foundation for Phase 7 (Personal Library).
</research_summary>
