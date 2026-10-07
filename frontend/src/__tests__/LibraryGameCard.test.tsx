import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import LibraryGameCard from '@/components/library/LibraryGameCard';
import { UserLibraryItem } from '@/types/game';
import { LibraryProvider } from '@/context/LibraryContext';

describe('LibraryGameCard Component', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  const sampleItem: UserLibraryItem = {
    id: 'lib-1245620',
    user_id: 'user-1',
    game_id: '1245620',
    is_favorite: false,
    is_wishlisted: false,
    status: 'playing',
    personal_rating: 10,
    personal_rank: 1,
    playtime_hours: 74.5,
    game_title: 'Elden Ring',
    game_cover_url: 'https://example.com/er.jpg',
    game_slug: 'elden-ring',
  };

  it('renders title, playtime, rating badge, and shelf status', () => {
    render(
      <LibraryProvider>
        <LibraryGameCard item={sampleItem} />
      </LibraryProvider>
    );

    expect(screen.getByText('Elden Ring')).toBeInTheDocument();
    expect(screen.getByText(/74.5 hrs played/i)).toBeInTheDocument();
    expect(screen.getByText('10/10')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Shelf: Currently Playing/i })).toBeInTheDocument();
  });

  it('handles favorite toggle click', () => {
    const onFavoriteToggle = vi.fn();

    render(
      <LibraryProvider>
        <LibraryGameCard item={sampleItem} onFavoriteToggle={onFavoriteToggle} />
      </LibraryProvider>
    );

    const favButton = screen.getByRole('button', { name: /Add to favorites/i });
    fireEvent.click(favButton);

    expect(onFavoriteToggle).toHaveBeenCalled();
  });

  it('allows clicking playtime to edit hours and save', () => {
    const onPlaytimeChange = vi.fn();

    render(
      <LibraryProvider>
        <LibraryGameCard item={sampleItem} onPlaytimeChange={onPlaytimeChange} />
      </LibraryProvider>
    );

    const playtimeBtn = screen.getByText(/74.5 hrs played/i);
    fireEvent.click(playtimeBtn);

    const input = screen.getByRole('spinbutton', { name: /Edit playtime hours/i });
    expect(input).toBeInTheDocument();

    fireEvent.change(input, { target: { value: '85' } });
    fireEvent.blur(input);

    expect(onPlaytimeChange).toHaveBeenCalledWith(85);
  });

  it('calls delete callback on remove confirmation', () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    const onDelete = vi.fn();

    render(
      <LibraryProvider>
        <LibraryGameCard item={sampleItem} onDelete={onDelete} />
      </LibraryProvider>
    );

    const deleteBtn = screen.getByRole('button', { name: /Remove Elden Ring from library/i });
    fireEvent.click(deleteBtn);

    expect(onDelete).toHaveBeenCalled();
  });
});
