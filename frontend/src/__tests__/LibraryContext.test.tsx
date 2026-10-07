import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { LibraryProvider, useLibrary } from '@/context/LibraryContext';

describe('LibraryContext & Optimistic Engine', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <LibraryProvider>{children}</LibraryProvider>
  );

  it('initializes with seed mock items when localStorage is empty', () => {
    const { result } = renderHook(() => useLibrary(), { wrapper });

    expect(result.current.items).toBeDefined();
    // Default mock library should contain Elden Ring ('1245620')
    const eldenRing = result.current.getGameItem('1245620');
    expect(eldenRing).toBeDefined();
    expect(eldenRing?.game_title).toBe('Elden Ring');
    expect(eldenRing?.status).toBe('playing');
  });

  it('optimistically shelves a new game and persists to state', async () => {
    // Mock global fetch
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ success: true }),
    });

    const { result } = renderHook(() => useLibrary(), { wrapper });

    const newGame = {
      id: '999999',
      title: 'Hollow Knight',
      capsule_image: 'https://example.com/hk.jpg',
      slug: 'hollow-knight',
    };

    await act(async () => {
      await result.current.shelveGame(newGame, 'wishlist');
    });

    const shelved = result.current.getGameItem('999999');
    expect(shelved).toBeDefined();
    expect(shelved?.game_title).toBe('Hollow Knight');
    expect(shelved?.status).toBe('wishlist');
    expect(shelved?.is_wishlisted).toBe(true);
  });

  it('updates shelf status for an existing game', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ success: true }),
    });

    const { result } = renderHook(() => useLibrary(), { wrapper });

    await act(async () => {
      await result.current.shelveGame({ id: '1245620', title: 'Elden Ring' }, 'completed');
    });

    const updated = result.current.getGameItem('1245620');
    expect(updated?.status).toBe('completed');
  });

  it('toggles favorite status correctly', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ success: true }),
    });

    const { result } = renderHook(() => useLibrary(), { wrapper });
    const initialFavorite = result.current.getGameItem('1145360')?.is_favorite;

    await act(async () => {
      await result.current.toggleFavorite('1145360');
    });

    expect(result.current.getGameItem('1145360')?.is_favorite).toBe(!initialFavorite);
  });

  it('updates playtime hours safely', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ success: true }),
    });

    const { result } = renderHook(() => useLibrary(), { wrapper });

    await act(async () => {
      await result.current.updatePlaytime('1245620', 120.5);
    });

    expect(result.current.getGameItem('1245620')?.playtime_hours).toBe(120.5);
  });

  it('removes a game from the library', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ success: true }),
    });

    const { result } = renderHook(() => useLibrary(), { wrapper });

    expect(result.current.getGameItem('1426210')).toBeDefined();

    await act(async () => {
      await result.current.removeGame('1426210');
    });

    expect(result.current.getGameItem('1426210')).toBeUndefined();
  });

  it('rolls back state when backend returns 500 server error', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
      json: async () => ({ detail: 'Internal server failure' }),
    });

    const { result } = renderHook(() => useLibrary(), { wrapper });
    const originalStatus = result.current.getGameItem('1245620')?.status;

    await act(async () => {
      await result.current.shelveGame({ id: '1245620' }, 'dropped');
    });

    // Should have rolled back to original status
    expect(result.current.getGameItem('1245620')?.status).toBe(originalStatus);
    expect(result.current.error).toContain('HTTP 500');
  });
});
