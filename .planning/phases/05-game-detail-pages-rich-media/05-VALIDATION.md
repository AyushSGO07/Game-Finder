---
phase: 5
slug: game-detail-pages-rich-media
status: draft
nyquist_compliant: true
wave_0_complete: false
created: 2026-10-07
---

# Phase 5 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | vitest 2.x+ / @testing-library/react |
| **Config file** | `frontend/vitest.config.ts` |
| **Quick run command** | `npm --prefix frontend test -- src/__tests__/GameDetail.test.tsx` |
| **Full suite command** | `npm --prefix frontend test -- --run` |
| **Estimated runtime** | ~3-4 seconds |

---

## Sampling Rate

- **After every task commit:** Run targeted component test suite
- **After every plan wave:** Run full frontend test suite `npm --prefix frontend test -- --run`
- **Before `/gsd-verify-work`:** Full suite must be green (frontend + backend)
- **Max feedback latency:** 5 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 5-01-01 | 01 | 1 | GAME-01 | T-5-01 | Data fetcher handles missing games and returns typed detail model | unit | `npm --prefix frontend test -- src/__tests__/GameApi.test.tsx` | ❌ W0 | ⬜ pending |
| 5-01-02 | 01 | 1 | GAME-01, GAME-04 | T-5-02 | Header and metadata sidebar display developer, publisher, release date, and tags | unit | `npm --prefix frontend test -- src/__tests__/GameSidebar.test.tsx` | ❌ W0 | ⬜ pending |
| 5-01-03 | 01 | 1 | GAME-04 | T-5-03 | System requirements tabs sanitize raw HTML and render Min/Rec specs | unit | `npm --prefix frontend test -- src/__tests__/SystemRequirements.test.tsx` | ❌ W0 | ⬜ pending |
| 5-02-01 | 02 | 2 | GAME-02 | T-5-04 | Video player streams trailer, handles play/pause, and supports video formats | unit | `npm --prefix frontend test -- src/__tests__/TrailerPlayer.test.tsx` | ❌ W0 | ⬜ pending |
| 5-02-02 | 02 | 2 | GAME-03 | T-5-05 | Screenshot gallery thumbnail strip switches active media seamlessly | unit | `npm --prefix frontend test -- src/__tests__/MediaGallery.test.tsx` | ❌ W0 | ⬜ pending |
| 5-02-03 | 02 | 2 | GAME-03 | T-5-06 | Fullscreen lightbox modal navigates with Arrow keys and closes on Escape | unit | `npm --prefix frontend test -- src/__tests__/ScreenshotLightbox.test.tsx` | ❌ W0 | ⬜ pending |
| 5-02-04 | 02 | 2 | GAME-01, GAME-02, GAME-03, GAME-04 | T-5-07 | Game detail route at `/games/[id]` integrates header, media, synopsis, and sidebar | integration | `npm --prefix frontend test -- src/__tests__/GameDetailPage.test.tsx` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `frontend/src/__tests__/GameApi.test.tsx` — Game details API client test
- [ ] `frontend/src/__tests__/GameSidebar.test.tsx` — Header & sidebar tests
- [ ] `frontend/src/__tests__/SystemRequirements.test.tsx` — Requirements tab tests
- [ ] `frontend/src/__tests__/TrailerPlayer.test.tsx` — Video player tests
- [ ] `frontend/src/__tests__/MediaGallery.test.tsx` — Media gallery switcher tests
- [ ] `frontend/src/__tests__/ScreenshotLightbox.test.tsx` — Lightbox modal tests
- [ ] `frontend/src/__tests__/GameDetailPage.test.tsx` — Full game detail route integration test

---

## Manual-Only Verifications

| Behavior | Why Manual | Verification Method |
|----------|------------|---------------------|
| Video Playback Audio & Fluidity | Browser audio context and codec hardware acceleration | Open game detail page on `localhost:3000/games/1245620` and play trailer video |

---

## Validation Sign-Off

- [x] All tasks have `<automated>` verify or Wave 0 dependencies
- [x] Sampling continuity: no 3 consecutive tasks without automated verify
- [x] Wave 0 covers all MISSING references
- [x] No watch-mode flags
- [x] Feedback latency < 5s
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** approved 2026-10-07
