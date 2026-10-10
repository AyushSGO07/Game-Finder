import {
  GameCard,
  HeroSlide,
  GenreTile,
  ShelfCategory,
  GameDetail,
  RecommendationRequest,
  EnrichedRecommendation,
  GameReview,
  RankedPosition,
  RankedList,
  GotyYearArchive,
} from '@/types/game';
import {
  MOCK_HERO_SLIDES,
  MOCK_SHELF_GAMES,
  MOCK_GENRE_TILES,
  getDefaultMockGameDetail,
  generateMockRecommendations,
  MOCK_GAME_REVIEWS,
  MOCK_GOTY_ARCHIVE,
} from './mockData';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';
const REQUEST_TIMEOUT_MS = 3000;

function getAuthHeader(): Record<string, string> {
  if (typeof window !== 'undefined') {
    const token =
      localStorage.getItem('game_finder_jwt_token') ||
      localStorage.getItem('game_finder_auth_token');
    if (token) {
      return { Authorization: `Bearer ${token}` };
    }
  }
  return {};
}

async function fetchWithTimeout(
  url: string,
  options?: RequestInit,
  timeoutMs = REQUEST_TIMEOUT_MS
): Promise<Response> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
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

export async function fetchGameDetails(id: string | number): Promise<GameDetail | null> {
  const strId = String(id).trim();
  if (!strId) return null;

  try {
    const res = await fetchWithTimeout(`${BASE_URL}/games/${strId}`);
    if (res.ok) {
      const data = await res.json();
      if (data && data.title) {
        return data;
      }
    }
  } catch {
    // Network/timeout fallback
  }

  // Gracefully fallback to high-fidelity mock dataset
  return getDefaultMockGameDetail(strId);
}

export async function searchGames(query: string): Promise<GameCard[]> {
  const trimmed = query.trim().toLowerCase();
  if (!trimmed) return [];

  try {
    const res = await fetchWithTimeout(`${BASE_URL}/games/search?q=${encodeURIComponent(trimmed)}`);
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data.items)) {
        return data.items;
      }
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
    const gameId = String(game.id);
    if (seen.has(gameId)) continue;
    const matchTitle = game.title.toLowerCase().includes(trimmed);
    const matchGenre = game.genres.some((g) => g.toLowerCase().includes(trimmed));
    const matchDev = game.developer?.toLowerCase().includes(trimmed);
    if (matchTitle || matchGenre || matchDev) {
      seen.add(gameId);
      results.push(game);
    }
  }

  return results;
}

export async function fetchRecommendations(
  request: RecommendationRequest
): Promise<EnrichedRecommendation[]> {
  try {
    const res = await fetchWithTimeout(
      `${BASE_URL}/recommendations`,
      {
        method: 'POST',
        body: JSON.stringify({
          genre: request.genre,
          age: request.age,
          difficulty: request.difficulty,
          platform: request.platform || 'PC',
          prompt: request.prompt || undefined,
        }),
      },
      15000
    );

    if (res.ok) {
      const data = await res.json();
      if (data && Array.isArray(data.recommendations) && data.recommendations.length > 0) {
        const recs = data.recommendations;
        return recs.map((r: any, idx: number) => ({
          id: r.id || r.steam_appid || idx + 1,
          steam_appid: r.steam_appid,
          name: r.name,
          match_reason: r.match_reason,
          attributes: r.attributes || [],
          header_image: r.header_image || r.capsule_image,
          capsule_image: r.capsule_image,
          hero_image: r.hero_image,
          rating: r.rating,
          release_date: r.release_date,
          store_url:
            r.store_url ||
            (r.steam_appid ? `https://store.steampowered.com/app/${r.steam_appid}/` : undefined),
          developer: r.developer,
          publisher: r.publisher,
        }));
      }
    }
  } catch {
    // Network or server failure, fall back to mock recommendation generator
  }

  return generateMockRecommendations(request);
}

export async function fetchGameReviews(gameId: string | number): Promise<GameReview[]> {
  const strId = String(gameId).trim();
  try {
    const res = await fetchWithTimeout(`${BASE_URL}/library/reviews/${strId}`);
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data)) {
        return data;
      }
    }
  } catch {
    // Network fallback
  }

  return MOCK_GAME_REVIEWS[strId] || [];
}

export async function submitGameReview(data: {
  game_id: string | number;
  rating: number;
  title?: string;
  body: string;
}): Promise<GameReview> {
  const strId = String(data.game_id);
  const payload = {
    game_id: strId,
    rating: data.rating,
    title: data.title || undefined,
    body: data.body,
  };

  try {
    const res = await fetchWithTimeout(`${BASE_URL}/library/reviews`, {
      method: 'POST',
      headers: {
        ...getAuthHeader(),
      },
      body: JSON.stringify(payload),
    });
    if (res.ok) {
      return await res.json();
    }
  } catch {
    // Fallback below
  }

  const now = new Date().toISOString();
  const mockCreated: GameReview = {
    id: `rev-client-${Date.now()}`,
    user_id: 'user-client',
    game_id: strId,
    rating: data.rating,
    title: data.title || null,
    body: data.body,
    username: 'Gamer',
    avatar_url: 'https://ui-avatars.com/api/?name=Gamer&background=1e293b&color=cbd5e1',
    created_at: now,
    updated_at: now,
  };

  // Cache locally in mock data
  if (!MOCK_GAME_REVIEWS[strId]) {
    MOCK_GAME_REVIEWS[strId] = [];
  }
  MOCK_GAME_REVIEWS[strId].unshift(mockCreated);
  return mockCreated;
}

export async function fetchUserRankings(): Promise<RankedList> {
  try {
    const res = await fetchWithTimeout(`${BASE_URL}/library/rankings`, {
      headers: {
        ...getAuthHeader(),
      },
    });
    if (res.ok) {
      const data = await res.json();
      if (data && Array.isArray(data.positions)) {
        return data;
      }
    }
  } catch {
    // Network fallback
  }

  // Fallback to localStorage if present
  if (typeof window !== 'undefined') {
    try {
      const local = localStorage.getItem('game_finder_user_rankings');
      if (local) {
        return JSON.parse(local);
      }
    } catch {
      // ignore
    }
  }

  return {
    id: 'rank-default',
    user_id: 'default-user',
    title: 'My All-Time Top 10',
    positions: [],
  };
}

export async function saveUserRankings(
  title: string,
  positions: RankedPosition[]
): Promise<RankedList> {
  const payload = {
    title,
    positions: positions.map((p, idx) => ({
      game_id: String(p.game_id),
      rank: idx + 1,
      title: p.title || '',
      cover_url: p.cover_url || '',
    })),
  };

  try {
    const res = await fetchWithTimeout(`${BASE_URL}/library/rankings`, {
      method: 'POST',
      headers: {
        ...getAuthHeader(),
      },
      body: JSON.stringify(payload),
    });
    if (res.ok) {
      const saved = await res.json();
      if (typeof window !== 'undefined') {
        localStorage.setItem('game_finder_user_rankings', JSON.stringify(saved));
      }
      return saved;
    }
  } catch {
    // Network fallback
  }

  const result: RankedList = {
    id: `rank-${Date.now()}`,
    user_id: 'local-user',
    title,
    positions: payload.positions,
    updated_at: new Date().toISOString(),
  };

  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem('game_finder_user_rankings', JSON.stringify(result));
    } catch {
      // ignore
    }
  }

  return result;
}

export async function fetchGotyArchive(): Promise<GotyYearArchive[]> {
  try {
    const res = await fetchWithTimeout(`${BASE_URL}/games/goty`);
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        return data;
      }
    }
  } catch {
    // Network fallback
  }

  return MOCK_GOTY_ARCHIVE;
}

