import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fetchHeroGames, fetchShelfGames, fetchGenres, searchGames } from '../lib/api';

describe('Frontend API Client & Fallback Resilience', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('fetchHeroGames falls back gracefully to curated hero slides', async () => {
    const slides = await fetchHeroGames();
    expect(Array.isArray(slides)).toBe(true);
    expect(slides.length).toBeGreaterThanOrEqual(5);

    const firstSlide = slides[0];
    expect(firstSlide).toHaveProperty('id');
    expect(firstSlide).toHaveProperty('title');
    expect(firstSlide).toHaveProperty('backdrop_url');
    expect(firstSlide).toHaveProperty('rating');
    expect(firstSlide).toHaveProperty('genres');
    expect(firstSlide.genres.length).toBeGreaterThan(0);
  });

  it('fetchShelfGames returns valid GameCard objects for trending category', async () => {
    const trending = await fetchShelfGames('trending');
    expect(Array.isArray(trending)).toBe(true);
    expect(trending.length).toBe(6);

    for (const game of trending) {
      expect(game).toHaveProperty('id');
      expect(game).toHaveProperty('title');
      expect(game).toHaveProperty('genres');
      expect(typeof game.title).toBe('string');
      expect(Array.isArray(game.genres)).toBe(true);
    }
  });

  it('fetchShelfGames returns valid GameCard objects for new_releases, top_rated, and hidden_gems', async () => {
    const newReleases = await fetchShelfGames('new_releases');
    const topRated = await fetchShelfGames('top_rated');
    const hiddenGems = await fetchShelfGames('hidden_gems');

    expect(newReleases.length).toBe(6);
    expect(topRated.length).toBe(6);
    expect(hiddenGems.length).toBe(6);
  });

  it('fetchGenres returns exactly 12 core genre tiles', async () => {
    const genres = await fetchGenres();
    expect(Array.isArray(genres)).toBe(true);
    expect(genres.length).toBe(12);

    const slugs = genres.map((g) => g.slug);
    expect(slugs).toContain('action');
    expect(slugs).toContain('rpg');
    expect(slugs).toContain('strategy');
    expect(slugs).toContain('indie');
  });

  it('searchGames returns matching items for text query and handles empty string', async () => {
    const emptyResults = await searchGames('');
    expect(emptyResults).toEqual([]);

    const whitespaceResults = await searchGames('   ');
    expect(whitespaceResults).toEqual([]);

    const eldenResults = await searchGames('elden');
    expect(eldenResults.length).toBeGreaterThan(0);
    expect(eldenResults[0].title.toLowerCase()).toContain('elden');

    const rpgResults = await searchGames('rpg');
    expect(rpgResults.length).toBeGreaterThan(0);
  });
});
