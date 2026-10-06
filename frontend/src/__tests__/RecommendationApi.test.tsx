import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fetchRecommendations } from '../lib/api';
import { generateMockRecommendations } from '../lib/mockData';

describe('Recommendation API and Fallback Engine', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('generateMockRecommendations returns exactly 8 high-fidelity recommendations', () => {
    const results = generateMockRecommendations({
      genre: 'RPG',
      age: 'Teen',
      difficulty: 'Normal',
      prompt: 'fantasy story',
    });

    expect(results).toHaveLength(8);
    results.forEach((rec) => {
      expect(rec.name).toBeDefined();
      expect(rec.match_reason).toBeDefined();
      expect(Array.isArray(rec.attributes)).toBe(true);
      expect(rec.header_image || rec.capsule_image).toBeDefined();
    });
  });

  it('generateMockRecommendations adapts to selected genre (Horror)', () => {
    const results = generateMockRecommendations({
      genre: 'Horror',
      age: 'Mature',
      difficulty: 'Hard',
    });

    expect(results).toHaveLength(8);
    // At least one Horror title present
    const hasHorror = results.some((r) =>
      r.attributes.some((attr) => attr.toLowerCase().includes('horror'))
    );
    expect(hasHorror).toBe(true);
  });

  it('fetchRecommendations gracefully falls back when backend fetch fails', async () => {
    vi.spyOn(global, 'fetch').mockRejectedValue(new Error('Backend offline'));

    const results = await fetchRecommendations({
      genre: 'Action',
      age: 'Teen',
      difficulty: 'Hard',
    });

    expect(results).toHaveLength(8);
    expect(results[0].name).toBeDefined();
  });
});
