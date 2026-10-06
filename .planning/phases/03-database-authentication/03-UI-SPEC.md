# Phase 3: Database & Authentication — UI Design Contract (UI-SPEC)

**Phase:** 03-database-authentication  
**Created:** 2026-10-07  
**Status:** Approved  

---

## 1. Scope & Purpose

This design contract specifies the visual, interaction, and validation contracts for authentication states, account forms, and user profile preferences. Even though Phase 3 primarily establishes the PostgreSQL database models, RLS policies, and FastAPI backend auth services, locking these UI contracts ensures that data schemas and API responses directly serve the frontend auth flows implemented in Phases 4 & 7.

---

## 2. Visual & Design System Tokens

### 2.1. Color Palette (Dark Cinematic)

| Token | Hex / Value | Usage |
|-------|-------------|-------|
| `bg-primary` | `#090a0f` | Main application background |
| `surface-glass` | `rgba(18, 21, 31, 0.8)` | Modal backdrops, card surfaces with backdrop-blur |
| `surface-glass-border` | `rgba(255, 255, 255, 0.08)` | Subdued dividing borders |
| `accent-primary` | `#6366f1` (Indigo-500) | Primary CTA buttons, focus rings, active states |
| `accent-glow` | `rgba(99, 102, 241, 0.35)` | Box-shadow glow on interactive focus / primary buttons |
| `accent-secondary` | `#06b6d4` (Cyan-500) | Tag badges, secondary highlights |
| `text-primary` | `#f8fafc` (Slate-50) | High-contrast headings and primary labels |
| `text-muted` | `#94a3b8` (Slate-400) | Form descriptions, secondary body text |
| `text-subtle` | `#64748b` (Slate-500) | Input placeholders, timestamps |
| `status-error` | `#ef4444` (Red-500) | Validation error text, destructive buttons |
| `status-success` | `#10b981` (Emerald-500) | Success alerts, completed states |

### 2.2. Typography

- **Headings**: Sans-serif (`Inter`, `system-ui`), font-weight 600–700, tight tracking (`tracking-tight`).
- **Body**: Font size 14px–16px, line-height 1.5, regular/medium (`font-normal`/`font-medium`).
- **Input text**: 14px (`text-sm`), medium weight, clean tabular numerals where appropriate.

---

## 3. Account & Auth Screen Specifications

### 3.1. Sign Up Flow (`/signup` & Auth Modal)
- **Fields**:
  - `Email`: Required, HTML5 email validation (`type="email"`).
  - `Username / Gamer Handle`: Required, 3–20 alphanumeric chars + underscores, unique check.
  - `Password`: Required, minimum 8 characters, password strength indicator.
  - `Confirm Password`: Required, match check.
- **Copywriting**:
  - Heading: "Create Your Gamer Identity"
  - Subheading: "Track your library, get tailored AI recommendations, and rank your favorite games."
  - CTA Button: "Create Account"
  - Alternate Link: "Already have an account? Sign in"

### 3.2. Sign In Flow (`/login`)
- **Fields**:
  - `Email`: Required.
  - `Password`: Required, masked with show/hide eye toggle icon.
  - `Remember Me`: Checkbox (stores refresh token).
- **Copywriting**:
  - Heading: "Welcome Back"
  - Subheading: "Sign in to access your personal vault and personalized shelves."
  - CTA Button: "Sign In"
  - Helper Links: "Forgot password?", "Don't have an account? Sign up"

### 3.3. Profile & Preferences Settings (`/settings`)
- **Profile Tab**:
  - Display Name, Avatar URL (preview with fallbacks), Bio (max 280 chars).
- **Gaming Preferences Tab**:
  - Favorite Genres (multi-select pill toggles), Preferred Platforms (PC, PlayStation, Xbox, Switch).
  - Default Difficulty (`Easy`, `Medium`, `Hard`, `Nightmare`).
  - Default Age Rating (`E`, `E10+`, `T`, `M`).
- **Privacy Tab**:
  - Switches for `is_public`, `show_library`, `show_favorites`, `show_reviews`, `show_rankings`.

---

## 4. Form States & Micro-interactions

| State | Visual Treatment |
|-------|------------------|
| **Default Input** | Glass background (`bg-slate-900/60`), border `slate-700/50`, text `slate-200`. |
| **Focus Input** | Border `indigo-500`, ring `2px indigo-500/30`, smooth transition. |
| **Error Input** | Border `red-500`, ring `2px red-500/20`, helper text in `red-400 text-xs mt-1`. |
| **Submitting Button**| Disabled opacity `0.7`, inline spinning SVG icon, text "Creating account..." / "Signing in...". |
| **Success Banner** | Emerald border glass badge with check icon, auto-dismiss toast. |

---

## 5. Verification Sign-Off

- [x] Spacing, typography, and dark cinematic color tokens defined.
- [x] All auth form fields and copy contracts specified.
- [x] Error and loading states mapped to Pydantic validation schemas.
