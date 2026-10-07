---
phase: 7
slug: personal-library-reviews-ranked-lists
status: planned
nyquist_compliant: true
wave_0_complete: false
created: 2026-10-07
---

# Phase 7 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Frontend Framework** | vitest 2.x+ / @testing-library/react |
| **Backend Framework** | pytest 9.x+ / pytest-asyncio |
| **Frontend Config** | `frontend/vitest.config.ts` |
| **Backend Command** | `$env:PYTHONPATH="."; .\.venv\Scripts\pytest.exe backend/tests` |
| **Frontend Quick Run** | `npm --prefix frontend test -- src/__tests__/LibraryPage.test.tsx` |
| **Full Frontend Suite** | `npm --prefix frontend test -- --run` |
| **Estimated Runtime** | ~12 seconds |

---

## Sampling Rate

- **After every task commit:** Run targeted component/endpoint test suite
- **After every plan wave:** Run full frontend test suite (`npm --prefix frontend test -- --run`) and backend test suite (`pytest`)
- **Before phase completion:** Full test suites green (88+ backend, 71+ frontend) and `npm run build` succeeds cleanly
- **Max feedback latency:** 10 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 7-01-01 | 01 | 1 | LIB-01, LIB-02 | T-7-01 | Library context provides optimistic shelving, storage sync, and rollback on error | unit | `npm --prefix frontend test -- src/__tests__/LibraryContext.test.tsx` | ⬜ no | ⬜ pending |
| 7-01-02 | 01 | 1 | LIB-01 | T-7-02 | ShelfSelector renders statuses, updates selection, and emits change events | unit | `npm --prefix frontend test -- src/__tests__/ShelfSelector.test.tsx` | ⬜ no | ⬜ pending |
| 7-01-03 | 01 | 1 | LIB-01, LIB-02 | T-7-03 | LibraryGameCard handles shelf changes, playtime updates, and removal | unit | `npm --prefix frontend test -- src/__tests__/LibraryGameCard.test.tsx` | ⬜ no | ⬜ pending |
| 7-01-04 | 01 | 1 | LIB-01, LIB-02 | T-7-04 | Library page at `/library` filters by shelf tabs, searches, and displays empty states | integration | `npm --prefix frontend test -- src/__tests__/LibraryPage.test.tsx` | ⬜ no | ⬜ pending |
| 7-02-01 | 02 | 2 | LIB-03 | T-7-05 | Backend reviews endpoints validate schemas, prevent invalid ratings, and return reviews | integration | `$env:PYTHONPATH="."; .\.venv\Scripts\pytest.exe backend/tests/test_reviews_api.py` | ⬜ no | ⬜ pending |
| 7-02-02 | 02 | 2 | LIB-03 | T-7-06 | StarRating provides interactive 1-10 star selection with hover feedback | unit | `npm --prefix frontend test -- src/__tests__/StarRating.test.tsx` | ⬜ no | ⬜ pending |
| 7-02-03 | 02 | 2 | LIB-03 | T-7-07 | ReviewForm validates length, toggles preview tab, and submits sanitized markdown | unit | `npm --prefix frontend test -- src/__tests__/ReviewForm.test.tsx` | ⬜ no | ⬜ pending |
| 7-02-04 | 02 | 2 | LIB-03 | T-7-08 | ReviewList displays user reviews and MarkdownRenderer escapes HTML safely | unit | `npm --prefix frontend test -- src/__tests__/ReviewList.test.tsx` | ⬜ no | ⬜ pending |
| 7-03-01 | 03 | 3 | LIB-04 | T-7-09 | Top10Builder curates 10 ranked slots, supports reordering, and persists title | unit | `npm --prefix frontend test -- src/__tests__/Top10Builder.test.tsx` | 柴 no | ⬜ pending |
| 7-03-02 | 03 | 3 | LIB-05 | T-7-10 | Backend GOTY endpoint returns 2014-2024 winners and nominees | integration | `$env:PYTHONPATH="."; .\.venv\Scripts\pytest.exe backend/tests/test_goty_api.py` | ⬜ no | ⬜ pending |
| 7-03-03 | 03 | 3 | LIB-05 | T-7-11 | GotyTimeline switches years and GotyWinnerCard renders laurel award details | unit | `npm --prefix frontend test -- src/__tests__/GotyTimeline.test.tsx` | ⬜ no | ⬜ pending |
| 7-03-04 | 03 | 3 | LIB-05 | T-7-12 | Full GOTY archive page at `/goty` orchestrates timeline, winner, and nominees grid | integration | `npm --prefix frontend test -- src/__tests__/GotyPage.test.tsx` | ⬜ no | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `frontend/src/__tests__/LibraryContext.test.tsx` — Library state & optimistic update unit tests
- [ ] `frontend/src/__tests__/ShelfSelector.test.tsx` — ShelfSelector dropdown unit tests
- [ ] `frontend/src/__tests__/LibraryGameCard.test.tsx` — LibraryGameCard component unit tests
- [ ] `frontend/src/__tests__/LibraryPage.test.tsx` — Library route integration tests
- [ ] `backend/tests/test_reviews_api.py` — Reviews backend API tests
- [ ] `frontend/src/__tests__/StarRating.test.tsx` — StarRating 1-10 selector tests
- [ ] `frontend/src/__tests__/ReviewForm.test.tsx` — Markdown review form tests
- [ ] `frontend/src/__tests__/ReviewList.test.tsx` — Review list & markdown parser tests
- [ ] `frontend/src/__tests__/Top10Builder.test.tsx` — Top 10 list curator tests
- [ ] `backend/tests/test_goty_api.py` — GOTY backend API tests
- [ ] `frontend/src/__tests__/GotyTimeline.test.tsx` — Timeline & winner card tests
- [ ] `frontend/src/__tests__/GotyPage.test.tsx` — GOTY archive page integration tests

---

## Manual Verification Steps

1. **Optimistic Shelving**:
   - Open `/library` and verify default shelf counts.
   - Click a game card on Home or Detail page and select "Currently Playing".
   - Confirm status changes instantly in UI without lag, and appears under "Currently Playing" tab.
2. **Review & Rating Flow**:
   - Open `/games/1245620` (Elden Ring), scroll to Reviews section.
   - Select 10 stars, write a markdown review with bold headers, toggle "Preview" tab, click submit.
   - Confirm review renders immediately in community list with golden stars.
3. **Top 10 Rankings**:
   - Switch to "Top 10 Rankings" tab in `/library`.
   - Reorder games using Move Up/Down, rename title to "My Masterpieces", click Save.
   - Reload page and confirm order persists.
4. **GOTY Archive Exploration**:
   - Navigate to `/goty`.
   - Click through timeline years (2014, 2017, 2022, 2023, 2024).
   - Verify winner spotlight displays corresponding game (e.g. 2022 Elden Ring, 2023 Baldur's Gate 3), golden laurel badge, and runner-ups grid.
   - Click "Add to Library" directly from GOTY card.
