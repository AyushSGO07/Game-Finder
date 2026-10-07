import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import LibraryPage from '@/app/library/page';
import { LibraryProvider } from '@/context/LibraryContext';

describe('LibraryPage Route Integration', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  const renderPage = () =>
    render(
      <LibraryProvider>
        <LibraryPage />
      </LibraryProvider>
    );

  it('renders library header, statistics bar, and game cards', () => {
    renderPage();

    expect(screen.getByText('My Game Library')).toBeInTheDocument();
    expect(screen.getByText('Total Shelved')).toBeInTheDocument();
    expect(screen.getAllByText('Currently Playing').length).toBeGreaterThan(0);
    expect(screen.getByText('Time Logged')).toBeInTheDocument();
    expect(screen.getByText('Favorites')).toBeInTheDocument();

    // Default mock library contains Elden Ring
    expect(screen.getByText('Elden Ring')).toBeInTheDocument();
  });

  it('filters games when clicking a status shelf tab', () => {
    renderPage();

    // Click 'Wishlist' tab
    const wishlistTab = screen.getByRole('tab', { name: /Wishlist/i });
    fireEvent.click(wishlistTab);

    // Silksong is on Wishlist
    expect(screen.getByText('Hollow Knight: Silksong')).toBeInTheDocument();
    // Elden Ring is on Playing shelf, so should not be in Wishlist view
    expect(screen.queryByText('Elden Ring')).not.toBeInTheDocument();
  });

  it('filters shelved games by title search query', () => {
    renderPage();

    const searchInput = screen.getByLabelText(/Filter games by title/i);
    fireEvent.change(searchInput, { target: { value: 'Cyberpunk' } });

    expect(screen.getByText('Cyberpunk 2077')).toBeInTheDocument();
    expect(screen.queryByText('Elden Ring')).not.toBeInTheDocument();
  });

  it('displays empty state when search matches no games', () => {
    renderPage();

    const searchInput = screen.getByLabelText(/Filter games by title/i);
    fireEvent.change(searchInput, { target: { value: 'NonexistentUnheardGame' } });

    expect(screen.getByText('No games found on this shelf')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Explore Games/i })).toHaveAttribute('href', '/');
    expect(screen.getByRole('link', { name: /AI Game Matchmaker/i })).toHaveAttribute(
      'href',
      '/finder'
    );
  });
});
