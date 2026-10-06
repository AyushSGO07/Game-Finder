---
phase: 3
slug: database-authentication
status: ready
nyquist_compliant: true
wave_0_complete: true
created: 2026-10-07
---

# Phase 3 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | pytest 8.x+ + pytest-asyncio |
| **Config file** | `backend/pyproject.toml` or `backend/pytest.ini` |
| **Quick run command** | `& "D:\Game-Finder\.venv\Scripts\python.exe" -m pytest backend/tests/test_auth_schemas.py` |
| **Full suite command** | `& "D:\Game-Finder\.venv\Scripts\python.exe" -m pytest backend/tests/` |
| **Estimated runtime** | ~1-2 seconds |

---

## Sampling Rate

- **After every task commit:** Run targeted unit test suite
- **After every plan wave:** Run full test suite `python -m pytest backend/tests/`
- **Before `/gsd-verify-work`:** Full suite must be green
- **Max feedback latency:** 5 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 3-01-01 | 01 | 1 | AUTH-03, AUTH-04 | T-3-01 | Relational schema enforces foreign keys, cascades, enums, and unique user-game constraints | unit | `& "D:\Game-Finder\.venv\Scripts\python.exe" -m pytest backend/tests/test_schema_sql.py` | ✅ Yes | ✅ green |
| 3-01-02 | 01 | 1 | AUTH-03, AUTH-04 | T-3-02 | RLS policies prevent cross-user data tampering and restrict admin-only mutations | unit | `& "D:\Game-Finder\.venv\Scripts\python.exe" -m pytest backend/tests/test_schema_sql.py` | ✅ Yes | ✅ green |
| 3-01-03 | 01 | 1 | AUTH-03, AUTH-04 | T-3-03 | Automated test suite verifies SQL migration syntax, constraints, and trigger rules | unit | `& "D:\Game-Finder\.venv\Scripts\python.exe" -m pytest backend/tests/test_schema_sql.py` | ✅ Yes | ✅ green |
| 3-02-01 | 02 | 2 | AUTH-01, AUTH-02 | T-3-04 | Pydantic schemas sanitize user credentials, profile attributes, and shelf inputs | unit | `& "D:\Game-Finder\.venv\Scripts\python.exe" -m pytest backend/tests/test_auth_schemas.py` | ✅ Yes | ✅ green |
| 3-02-02 | 02 | 2 | AUTH-01, AUTH-02 | T-3-05 | Supabase client and JWT dependency safely validate bearer tokens and reject forged signatures | unit | `& "D:\Game-Finder\.venv\Scripts\python.exe" -m pytest backend/tests/test_auth_service.py` | ✅ Yes | ✅ green |
| 3-02-03 | 02 | 2 | AUTH-01, AUTH-02, AUTH-04 | T-3-06 | Auth and user library endpoints guard access and execute operations under isolated user contexts | integration | `& "D:\Game-Finder\.venv\Scripts\python.exe" -m pytest backend/tests/test_auth_api.py backend/tests/test_library_api.py` | ✅ Yes | ✅ green |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [x] `backend/tests/test_schema_sql.py` — SQL migration syntax & constraint stubs
- [x] `backend/tests/test_auth_schemas.py` — Auth schema validation stubs
- [x] `backend/tests/test_auth_service.py` — Supabase client & JWT verification stubs
- [x] `backend/tests/test_auth_api.py` — Auth route integration stubs
- [x] `backend/tests/test_library_api.py` — Library route integration stubs

---

## Manual-Only Verifications

| Behavior | Why Manual | Verification Method |
|----------|------------|---------------------|
| Live Supabase Cloud Connection | Requires active internet, external Supabase project credentials, and network connectivity | Run `python backend/scripts/test_live_supabase.py` with real `SUPABASE_URL` and `SUPABASE_ANON_KEY` |

---

## Validation Sign-Off

- [x] All tasks have `<automated>` verify or Wave 0 dependencies
- [x] Sampling continuity: no 3 consecutive tasks without automated verify
- [x] Wave 0 covers all MISSING references
- [x] No watch-mode flags
- [x] Feedback latency < 5s
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** approved 2026-10-07
