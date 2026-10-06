import {
  GameCard,
  HeroSlide,
  GenreTile,
  ShelfCategory,
  GameDetail,
  RecommendationRequest,
  EnrichedRecommendation,
} from '@/types/game';
import {
  MOCK_HERO_SLIDES,
  MOCK_SHELF_GAMES,
  MOCK_GENRE_TILES,
  getDefaultMockGameDetail,
  generateMockRecommendations,
} from './mockData';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';
const REQUEST_TIMEOUT_MS = 3000;

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
          prompt: request.prompt || undefined,
        }),
      },
      8000
    );

    if (res.ok) {
      const data = await res.json();
      if (data && Array.isArray(data.recommendations) && data.recommendations.length > 0) {
        const recs = data.recommendations;
        // Attempt batch enrichment to attach Steam artwork and metadata
        try {
          const titles = recs.map((r: { name: string }) => r.name);
          const enrichRes = await fetchWithTimeout(
            `${BASE_URL}/games/batch`,
            {
              method: 'POST',
              body: JSON.stringify({ titles }),
            },
            4000
          );
          if (enrichRes.ok) {
            const enrichData = await enrichRes.json();
            const cards: GameCard[] = enrichData.games || [];
            return recs.map((r: { name: string; match_reason: string; attributes: string[] }, idx: number) => {
              const matchedCard = cards.find(
                (c) => c.title.toLowerCase() === r.name.toLowerCase()
              );
              return {
                id: matchedCard?.id || matchedCard?.steam_appid || idx + 1,
                steam_appid: matchedCard?.steam_appid,
                name: r.name,
                match_reason: r.match_reason,
                attributes: r.attributes || matchedCard?.genres || [],
                header_image: matchedCard?.header_image || matchedCard?.capsule_image,
                capsule_image: matchedCard?.capsule_image,
                hero_image: matchedCard?.hero_image,
                rating: matchedCard?.rating,
                release_date: matchedCard?.release_date,
                store_url: matchedCard?.steam_appid
                  ? `https://store.steampowered.com/app/${matchedCard.steam_appid}/`
                  : undefined,
              };
            });
          }
        } catch {
          // Batch enrichment failed, proceed with raw recs
        }

        // Return recommendations with fallback artwork mapping
        return recs.map((r: { name: string; match_reason: string; attributes: string[] }, idx: number) => ({
          id: idx + 1,
          name: r.name,
          match_reason: r.match_reason,
          attributes: r.attributes || [],
          header_image: undefined,
        }));
      }
    }
  } catch {
    // Network or server failure, fall back to mock recommendation generator
  }

  return generateMockRecommendations(request);
}
