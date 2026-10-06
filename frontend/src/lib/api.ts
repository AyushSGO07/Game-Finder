import { GameCard, HeroSlide, GenreTile, ShelfCategory } from '@/types/game';
import { MOCK_HERO_SLIDES, MOCK_SHELF_GAMES, MOCK_GENRE_TILES } from './mockData';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';
const REQUEST_TIMEOUT_MS = 3000;

async function fetchWithTimeout(url: string, timeoutMs = REQUEST_TIMEOUT_MS): Promise<Response> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return response;
  } finally {
    clearTimeout(id);
  }
}

export async function fetchHeroGames(): Promise<HeroSlide[]> {
  try {
    const res = await fetchWithTimeout(`${BASE_URL}/games/featured`);
    if (!res.ok) {
      return MOCK_HERO_SLIDES;
    }
    const data = await res.json();
    if (Array.isArray(data) && data.length > 0) {
      return data;
    }
    return MOCK_HERO_SLIDES;
  } catch {
    return MOCK_HERO_SLIDES;
  }
}

export async function fetchShelfGames(category: ShelfCategory): Promise<GameCard[]> {
  try {
    const res = await fetchWithTimeout(`${BASE_URL}/games/shelves/${category}`);
    if (!res.ok) {
      return MOCK_SHELF_GAMES[category] || [];
    }
    const data = await res.json();
    if (Array.isArray(data) && data.length > 0) {
      return data;
    }
    return MOCK_SHELF_GAMES[category] || [];
  } catch {
    return MOCK_SHELF_GAMES[category] || [];
  }
}

export async function fetchGenres(): Promise<GenreTile[]> {
  try {
    const res = await fetchWithTimeout(`${BASE_URL}/games/genres`);
    if (!res.ok) {
      return MOCK_GENRE_TILES;
    }
    const data = await res.json();
    if (Array.isArray(data) && data.length > 0) {
      return data;
    }
    return MOCK_GENRE_TILES;
  } catch {
    return MOCK_GENRE_TILES;
  }
}

export async function searchGames(query: string): Promise<GameCard[]> {
  const trimmed = query.trim().toLowerCase();
  if (!trimmed) return [];

  try {
    const res = await fetchWithTimeout(`${BASE_URL}/games/search?q=${encodeURIComponent(trimmed)}`);
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data.games)) {
        return data.games;
      }
      if (Array.isArray(data)) {
        return data;
      }
    }
  } catch {
    // Graceful fallback to client search below
  }

  // Filter across all mock games for client-side search fallback
  const allMock = [
    ...(MOCK_SHELF_GAMES.trending || []),
    ...(MOCK_SHELF_GAMES.new_releases || []),
    ...(MOCK_SHELF_GAMES.top_rated || []),
    ...(MOCK_SHELF_GAMES.hidden_gems || []),
  ];

  const seen = new Set<string>();
  const results: GameCard[] = [];

  for (const game of allMock) {
    if (seen.has(game.id)) continue;
    const matchTitle = game.title.toLowerCase().includes(trimmed);
    const matchGenre = game.genres.some((g) => g.toLowerCase().includes(trimmed));
    const matchDev = game.developer?.toLowerCase().includes(trimmed);
    if (matchTitle || matchGenre || matchDev) {
      seen.add(game.id);
      results.push(game);
    }
  }

  return results;
}
