'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { ShelfStatus, UserLibraryItem } from '@/types/game';
import { MOCK_INITIAL_LIBRARY } from '@/lib/mockData';

interface GameLike {
  id: string | number;
  title?: string;
  header_image?: string;
  capsule_image?: string;
  slug?: string;
}

interface LibraryContextType {
  items: Record<string, UserLibraryItem>;
  isLoading: boolean;
  error: string | null;
  shelveGame: (game: GameLike, status: ShelfStatus) => Promise<void>;
  removeGame: (gameId: string | number) => Promise<void>;
  toggleFavorite: (gameId: string | number) => Promise<void>;
  updatePlaytime: (gameId: string | number, hours: number) => Promise<void>;
  rateGame: (gameId: string | number, rating: number) => Promise<void>;
  getGameItem: (gameId: string | number) => UserLibraryItem | undefined;
  clearError: () => void;
}

const STORAGE_KEY = 'game_finder_library';
const TOKEN_KEY = 'game_finder_jwt_token';
const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

function getAuthHeaders(): HeadersInit {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem(TOKEN_KEY);
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }
  return headers;
}

const LibraryContext = createContext<LibraryContextType | undefined>(undefined);

export function LibraryProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<Record<string, UserLibraryItem>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize from localStorage and fetch server data if authenticated
  useEffect(() => {
    let localItems: Record<string, UserLibraryItem> = {};
    try {
      if (typeof window !== 'undefined') {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed && typeof parsed === 'object' && Object.keys(parsed).length > 0) {
            localItems = parsed;
          }
        }
      }
    } catch {
      // LocalStorage error or JSON parse error
    }

    if (Object.keys(localItems).length > 0) {
      setItems(localItems);
      setIsLoading(false);
    } else {
      setItems(MOCK_INITIAL_LIBRARY);
      setIsLoading(false);
    }

    // Attempt to hydrate from server if auth token is present
    if (typeof window !== 'undefined' && localStorage.getItem(TOKEN_KEY)) {
      fetch(`${BASE_URL}/library/library`, { headers: getAuthHeaders() })
        .then((res) => (res.ok ? res.json() : null))
        .then((serverItems) => {
          if (Array.isArray(serverItems) && serverItems.length > 0) {
            const mapped: Record<string, UserLibraryItem> = {};
            serverItems.forEach((item) => {
              mapped[String(item.game_id)] = item;
            });
            setItems((prev) => {
              const merged = { ...prev, ...mapped };
              if (typeof window !== 'undefined') {
                localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
              }
              return merged;
            });
          }
        })
        .catch(() => {});
    }
  }, []);

  // Save to localStorage whenever items change
  const persistItems = useCallback((newItems: Record<string, UserLibraryItem>) => {
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newItems));
      }
    } catch {
      // Ignore quota errors
    }
  }, []);

  const clearError = useCallback(() => setError(null), []);

  const getGameItem = useCallback(
    (gameId: string | number): UserLibraryItem | undefined => {
      return items[String(gameId)];
    },
    [items]
  );

  const shelveGame = useCallback(
    async (game: GameLike, status: ShelfStatus) => {
      const gameId = String(game.id);
      const previous = { ...items };

      const existing = items[gameId];
      const now = new Date().toISOString();
      const updated: UserLibraryItem = {
        id: existing?.id || `lib-${gameId}`,
        user_id: existing?.user_id || 'user-default',
        game_id: gameId,
        is_favorite: existing ? existing.is_favorite : false,
        is_wishlisted: status === 'wishlist',
        status,
        personal_rating: existing?.personal_rating ?? null,
        personal_rank: existing?.personal_rank ?? null,
        playtime_hours: existing?.playtime_hours ?? 0,
        notes: existing?.notes ?? null,
        game_title: game.title || existing?.game_title || `Game #${gameId}`,
        game_cover_url:
          game.capsule_image ||
          game.header_image ||
          existing?.game_cover_url ||
          'https://placehold.co/600x400/1e293b/white?text=No+Cover',
        game_slug: game.slug || existing?.game_slug || gameId,
        created_at: existing?.created_at || now,
        updated_at: now,
      };

      const newItems = { ...items, [gameId]: updated };
      setItems(newItems);
      persistItems(newItems);
      setError(null);

      // Async backend dispatch with optimistic rollback on error
      try {
        const res = await fetch(`${BASE_URL}/library/library/${gameId}`, {
          method: 'POST',
          headers: getAuthHeaders(),
          body: JSON.stringify({
            status,
            is_wishlisted: status === 'wishlist',
          }),
        });
        if (!res.ok && res.status !== 401 && res.status !== 403) {
          // Non-auth server error: rollback
          throw new Error(`Failed to save shelf status (HTTP ${res.status})`);
        }
      } catch (err) {
        // Rollback only on network/server errors when not just unauthenticated
        if (err instanceof Error && err.message.includes('HTTP 5')) {
          setItems(previous);
          persistItems(previous);
          setError(err.message);
        }
      }
    },
    [items, persistItems]
  );

  const removeGame = useCallback(
    async (gameId: string | number) => {
      const key = String(gameId);
      if (!items[key]) return;

      const previous = { ...items };
      const newItems = { ...items };
      delete newItems[key];

      setItems(newItems);
      persistItems(newItems);
      setError(null);

      try {
        const res = await fetch(`${BASE_URL}/library/library/${key}`, {
          method: 'DELETE',
          headers: getAuthHeaders(),
        });
        if (!res.ok && res.status !== 401 && res.status !== 403 && res.status !== 404) {
          throw new Error(`Failed to remove game from library (HTTP ${res.status})`);
        }
      } catch (err) {
        if (err instanceof Error && err.message.includes('HTTP 5')) {
          setItems(previous);
          persistItems(previous);
          setError(err.message);
        }
      }
    },
    [items, persistItems]
  );

  const toggleFavorite = useCallback(
    async (gameId: string | number) => {
      const key = String(gameId);
      const existing = items[key];
      const previous = { ...items };

      let updated: UserLibraryItem;
      const now = new Date().toISOString();

      if (existing) {
        updated = {
          ...existing,
          is_favorite: !existing.is_favorite,
          updated_at: now,
        };
      } else {
        updated = {
          id: `lib-${key}`,
          user_id: 'user-default',
          game_id: key,
          is_favorite: true,
          is_wishlisted: false,
          status: 'wishlist',
          playtime_hours: 0,
          created_at: now,
          updated_at: now,
        };
      }

      const newItems = { ...items, [key]: updated };
      setItems(newItems);
      persistItems(newItems);
      setError(null);

      try {
        const res = await fetch(`${BASE_URL}/library/favorites/${key}`, {
          method: 'POST',
          headers: getAuthHeaders(),
        });
        if (!res.ok && res.status !== 401 && res.status !== 403) {
          throw new Error(`Failed to toggle favorite (HTTP ${res.status})`);
        }
      } catch (err) {
        if (err instanceof Error && err.message.includes('HTTP 5')) {
          setItems(previous);
          persistItems(previous);
          setError(err.message);
        }
      }
    },
    [items, persistItems]
  );

  const updatePlaytime = useCallback(
    async (gameId: string | number, hours: number) => {
      const key = String(gameId);
      const existing = items[key];
      if (!existing) return;

      const safeHours = Math.max(0, Math.round(hours * 10) / 10);
      const previous = { ...items };
      const updated: UserLibraryItem = {
        ...existing,
        playtime_hours: safeHours,
        updated_at: new Date().toISOString(),
      };

      const newItems = { ...items, [key]: updated };
      setItems(newItems);
      persistItems(newItems);

      try {
        await fetch(`${BASE_URL}/library/library/${key}`, {
          method: 'POST',
          headers: getAuthHeaders(),
          body: JSON.stringify({ playtime_hours: safeHours }),
        });
      } catch {
        // Safe offline preservation
      }
    },
    [items, persistItems]
  );

  const rateGame = useCallback(
    async (gameId: string | number, rating: number) => {
      const key = String(gameId);
      const existing = items[key];
      if (!existing) return;

      const safeRating = Math.min(10, Math.max(1, Math.round(rating)));
      const updated: UserLibraryItem = {
        ...existing,
        personal_rating: safeRating,
        updated_at: new Date().toISOString(),
      };

      const newItems = { ...items, [key]: updated };
      setItems(newItems);
      persistItems(newItems);

      try {
        await fetch(`${BASE_URL}/library/library/${key}`, {
          method: 'POST',
          headers: getAuthHeaders(),
          body: JSON.stringify({ personal_rating: safeRating }),
        });
      } catch {
        // Safe offline preservation
      }
    },
    [items, persistItems]
  );

  return (
    <LibraryContext.Provider
      value={{
        items,
        isLoading,
        error,
        shelveGame,
        removeGame,
        toggleFavorite,
        updatePlaytime,
        rateGame,
        getGameItem,
        clearError,
      }}
    >
      {children}
    </LibraryContext.Provider>
  );
}

const defaultContextValue: LibraryContextType = {
  items: MOCK_INITIAL_LIBRARY,
  isLoading: false,
  error: null,
  shelveGame: async () => {},
  removeGame: async () => {},
  toggleFavorite: async () => {},
  updatePlaytime: async () => {},
  rateGame: async () => {},
  getGameItem: (id) => MOCK_INITIAL_LIBRARY[String(id)],
  clearError: () => {},
};

export function useLibrary(): LibraryContextType {
  const context = useContext(LibraryContext);
  return context || defaultContextValue;
}
