---
phase: 4
slug: frontend-shell-store-discovery-hub
status: draft
nyquist_compliant: true
wave_0_complete: false
created: 2026-10-07
---

# Phase 4 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | vitest 2.x+ / @testing-library/react |
| **Config file** | `frontend/vitest.config.ts` or `frontend/package.json` |
| **Quick run command** | `npm --prefix frontend test -- src/__tests__/Navbar.test.tsx` |
| **Full suite command** | `npm --prefix frontend test -- --run` |
| **Estimated runtime** | ~3-4 seconds |

---

## Sampling Rate

- **After every task commit:** Run targeted component test suite
- **After every plan wave:** Run full frontend test suite `npm --prefix frontend test -- --run`
- **Before `/gsd-verify-work`:** Full suite must be green
- **Max feedback latency:** 5 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 4-01-01 | 01 | 1 | DISC-01 | T-4-01 | Next.js project scaffolds cleanly with strict TypeScript configurations | unit | `npm --prefix frontend run build` | ❌ W0 | ⬜ pending |
| 4-01-02 | 01 | 1 | DISC-01 | T-4-02 | Root layout enforces dark cinematic tokens and safe component boundaries | unit | `npm --prefix frontend test -- src/__tests__/Layout.test.tsx` | ❌ W0 | ⬜ pending |
| 4-01-03 | 01 | 1 | DISC-01 | T-4-03 | Frontend API client sanitizes inputs and handles backend downtime gracefully | unit | `npm --prefix frontend test -- src/__tests__/Api.test.tsx` | ❌ W0 | ⬜ pending |
| 4-02-01 | 02 | 2 | DISC-01 | T-4-04 | Desktop Navbar renders persistent links and responds to route changes | unit | `npm --prefix frontend test -- src/__tests__/Navbar.test.tsx` | ❌ W0 | ⬜ pending |
| 4-02-02 | 02 | 2 | DISC-02 | T-4-05 | Mobile navigation drawer responds to viewport breakpoints and touch gestures | unit | `npm --prefix frontend test -- src/__tests__/MobileNav.test.tsx` | ❌ W0 | ⬜ pending |
| 4-02-03 | 02 | 2 | DISC-01, DISC-02 | T-4-06 | Quick search trigger opens and closes modal with sanitized input states | unit | `npm --prefix frontend test -- src/__tests__/SearchModal.test.tsx` | ❌ W0 | ⬜ pending |
| 4-03-01 | 03 | 3 | DISC-03 | T-4-07 | Hero carousel auto-plays, pauses on hover, and navigates slides correctly | unit | `npm --prefix frontend test -- src/__tests__/HeroCarousel.test.tsx` | ❌ W0 | ⬜ pending |
| 4-03-02 | 03 | 3 | DISC-04 | T-4-08 | Horizontal game shelves scroll smoothly and render capsule cards with ratings | unit | `npm --prefix frontend test -- src/__tests__/GameShelf.test.tsx` | ❌ W0 | ⬜ pending |
| 4-03-03 | 03 | 3 | DISC-05 | T-4-09 | 12 Genre tiles render with thematic badges and home page integrates all sections | integration | `npm --prefix frontend test -- src/__tests__/DiscoveryHome.test.tsx` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `frontend/src/__tests__/Layout.test.tsx` — Root shell stubs
- [ ] `frontend/src/__tests__/Api.test.tsx` — API client stubs
- [ ] `frontend/src/__tests__/Navbar.test.tsx` — Desktop navbar stubs
- [ ] `frontend/src/__tests__/MobileNav.test.tsx` — Mobile navigation stubs
- [ ] `frontend/src/__tests__/SearchModal.test.tsx` — Search modal stubs
- [ ] `frontend/src/__tests__/HeroCarousel.test.tsx` — Hero carousel stubs
- [ ] `frontend/src/__tests__/GameShelf.test.tsx` — Shelf scrolling stubs
- [ ] `frontend/src/__tests__/DiscoveryHome.test.tsx` — Full home integration stubs

---

## Manual-Only Verifications

| Behavior | Why Manual | Verification Method |
|----------|------------|---------------------|
| Visual Polish & Dark Glass Appearance | Subjective cinematic aesthetic and backdrop blur rendering | Open `http://localhost:3000` in browser and inspect desktop & mobile viewports |

---

## Validation Sign-Off

- [x] All tasks have `<automated>` verify or Wave 0 dependencies
- [x] Sampling continuity: no 3 consecutive tasks without automated verify
- [x] Wave 0 covers all MISSING references
- [x] No watch-mode flags
- [x] Feedback latency < 5s
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** approved 2026-10-07
