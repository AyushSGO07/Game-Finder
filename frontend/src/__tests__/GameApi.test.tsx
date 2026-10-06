import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fetchGameDetails } from '../lib/api';

describe('fetchGameDetails API Client & Fallback Resilience', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('retrieves detailed metadata for Elden Ring (1245620)', async () => {
    const detail = await fetchGameDetails(1245620);
    expect(detail).not.toBeNull();
    expect(detail?.title).toContain('ELDEN RING');
    expect(detail?.rating).toBe(9.6);
    expect(detail?.genres).toContain('Action');
    expect(detail?.developers).toContain('FromSoftware Inc.');
    expect(detail?.screenshots.length).toBeGreaterThan(0);
    expect(detail?.movies.length).toBeGreaterThan(0);
    expect(detail?.pc_requirements?.minimum).toBeDefined();
  });

  it('retrieves detailed metadata for Cyberpunk 2077 (1091500)', async () => {
    const detail = await fetchGameDetails('1091500');
    expect(detail).not.toBeNull();
    expect(detail?.title).toContain('Cyberpunk 2077');
    expect(detail?.developers).toContain('CD PROJEKT RED');
  });

  it('generates a valid structured fallback for unknown game IDs', async () => {
    const detail = await fetchGameDetails(999999);
    expect(detail).not.toBeNull();
    expect(detail?.id).toBe(999999);
    expect(detail?.title).toBeDefined();
    expect(detail?.screenshots.length).toBeGreaterThan(0);
    expect(detail?.movies.length).toBeGreaterThan(0);
  });

  it('returns null when id is empty', async () => {
    const detail = await fetchGameDetails('');
    expect(detail).toBeNull();
  });
});
