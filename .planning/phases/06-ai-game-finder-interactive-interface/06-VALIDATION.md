---
phase: 6
slug: ai-game-finder-interactive-interface
status: draft
nyquist_compliant: true
wave_0_complete: false
created: 2026-10-07
---

# Phase 6 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | vitest 2.x+ / @testing-library/react |
| **Config file** | `frontend/vitest.config.ts` |
| **Quick run command** | `npm --prefix frontend test -- src/__tests__/FinderWizard.test.tsx` |
| **Full suite command** | `npm --prefix frontend test -- --run` |
| **Estimated runtime** | ~8 seconds |

---

## Sampling Rate

- **After every task commit:** Run targeted component test suite
- **After every plan wave:** Run full frontend test suite `npm --prefix frontend test -- --run`
- **Before phase completion:** Full suite must be green (frontend + backend) and `npm run build` must succeed
- **Max feedback latency:** 5 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 6-01-01 | 01 | 1 | FIND-01 | T-6-01 | Genre and mood selector validates options and updates state cleanly | unit | `npm --prefix frontend test -- src/__tests__/GenreMoodSelector.test.tsx` | ❌ W0 | ⬜ pending |
| 6-01-02 | 01 | 1 | FIND-01 | T-6-02 | Difficulty and age selector renders options and supports keyboard choice | unit | `npm --prefix frontend test -- src/__tests__/DifficultyAgeSelector.test.tsx` | ❌ W0 | ⬜ pending |
| 6-01-03 | 01 | 1 | FIND-02 | T-6-03 | Conversational prompt sanitizes input, truncates length, and handles chips | unit | `npm --prefix frontend test -- src/__tests__/ConversationalPrompt.test.tsx` | ❌ W0 | ⬜ pending |
| 6-01-04 | 01 | 1 | FIND-01, FIND-02 | T-6-04 | Master wizard stepper navigates forward/backward and validates transitions | unit | `npm --prefix frontend test -- src/__tests__/FinderWizard.test.tsx` | ❌ W0 | ⬜ pending |
| 6-02-01 | 02 | 2 | FIND-03 | T-6-05 | Recommendations API client fetches from backend with fallback support | unit | `npm --prefix frontend test -- src/__tests__/RecommendationApi.test.tsx` | ❌ W0 | ⬜ pending |
| 6-02-02 | 02 | 2 | FIND-04 | T-6-06 | Animated loading skeleton renders 8 cards and cycles live status messages | unit | `npm --prefix frontend test -- src/__tests__/FinderSkeleton.test.tsx` | ❌ W0 | ⬜ pending |
| 6-02-03 | 02 | 2 | FIND-03 | T-6-07 | RecommendationCard renders title, artwork, AI rationale box, and quick-save | unit | `npm --prefix frontend test -- src/__tests__/RecommendationCard.test.tsx` | ❌ W0 | ⬜ pending |
| 6-02-04 | 02 | 2 | FIND-01, FIND-02, FIND-03, FIND-04 | T-6-08 | Full finder page at `/finder` orchestrates wizard, loading, and results states | integration | `npm --prefix frontend test -- src/__tests__/FinderPage.test.tsx` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `frontend/src/__tests__/GenreMoodSelector.test.tsx` — Step 1 unit tests
- [ ] `frontend/src/__tests__/DifficultyAgeSelector.test.tsx` — Step 2 unit tests
- [ ] `frontend/src/__tests__/ConversationalPrompt.test.tsx` — Step 3 unit tests
- [ ] `frontend/src/__tests__/FinderWizard.test.tsx` — Master wizard workflow tests
- [ ] `frontend/src/__tests__/RecommendationApi.test.tsx` — API client & fallback tests
- [ ] `frontend/src/__tests__/FinderSkeleton.test.tsx` — Loading skeleton & status ticker tests
- [ ] `frontend/src/__tests__/RecommendationCard.test.tsx` — Card presentation & quick-save tests
- [ ] `frontend/src/__tests__/FinderPage.test.tsx` — Full `/finder` page integration test

---

## Manual-Only Verifications

| Behavior | Why Manual | Verification Method |
|----------|------------|---------------------|
| Smooth transition animations | Hardware GPU accelerated CSS/Framer motion | Open `/finder`, step through wizard, verify smooth cross-fade |
| AI inference latency feel | Real-world network timing with Gemini API | Submit query with real backend running and observe ticker animation |

---

## Validation Sign-Off

- [x] All tasks have `<automated>` verify or Wave 0 dependencies
- [x] Sampling continuity: no 3 consecutive tasks without automated verify
- [x] Wave 0 covers all MISSING references
- [x] No watch-mode flags
- [x] Feedback latency < 5s
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** approved 2026-10-07
