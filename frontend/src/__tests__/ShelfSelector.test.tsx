import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ShelfSelector from '@/components/library/ShelfSelector';
import { LibraryProvider } from '@/context/LibraryContext';

describe('ShelfSelector Component', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  const sampleGame = {
    id: '999111',
    title: 'Celeste',
    capsule_image: 'https://example.com/celeste.jpg',
  };

  it('renders "+ Add to Shelf" button when game is not yet in library', () => {
    render(
      <LibraryProvider>
        <ShelfSelector game={sampleGame} />
      </LibraryProvider>
    );

    expect(screen.getByRole('button', { name: /Add to Shelf/i })).toBeInTheDocument();
  });

  it('renders active shelf badge when game has an existing shelf status', () => {
    // Elden Ring ('1245620') is initially 'playing' in seed mock library
    const eldenRing = { id: '1245620', title: 'Elden Ring' };

    render(
      <LibraryProvider>
        <ShelfSelector game={eldenRing} />
      </LibraryProvider>
    );

    expect(screen.getByRole('button', { name: /Shelf: Currently Playing/i })).toBeInTheDocument();
  });

  it('opens dropdown menu on click and displays all shelf options', () => {
    render(
      <LibraryProvider>
        <ShelfSelector game={sampleGame} />
      </LibraryProvider>
    );

    const trigger = screen.getByRole('button', { name: /Add to Shelf/i });
    fireEvent.click(trigger);

    expect(screen.getByRole('menu')).toBeInTheDocument();
    expect(screen.getByRole('menuitem', { name: /Currently Playing/i })).toBeInTheDocument();
    expect(screen.getByRole('menuitem', { name: /Wishlist/i })).toBeInTheDocument();
    expect(screen.getByRole('menuitem', { name: /Backlog/i })).toBeInTheDocument();
    expect(screen.getByRole('menuitem', { name: /Completed/i })).toBeInTheDocument();
  });

  it('updates selection and triggers callback when choosing a shelf', async () => {
    const handleStatusChange = vi.fn();

    render(
      <LibraryProvider>
        <ShelfSelector game={sampleGame} onStatusChange={handleStatusChange} />
      </LibraryProvider>
    );

    const trigger = screen.getByRole('button', { name: /Add to Shelf/i });
    fireEvent.click(trigger);

    const wishlistOption = screen.getByRole('menuitem', { name: /Wishlist/i });
    fireEvent.click(wishlistOption);

    expect(handleStatusChange).toHaveBeenCalledWith('wishlist');
  });

  it('allows removing a game from library when already shelved', async () => {
    const handleStatusChange = vi.fn();
    const eldenRing = { id: '1245620', title: 'Elden Ring' };

    render(
      <LibraryProvider>
        <ShelfSelector game={eldenRing} onStatusChange={handleStatusChange} />
      </LibraryProvider>
    );

    const trigger = screen.getByRole('button', { name: /Shelf: Currently Playing/i });
    fireEvent.click(trigger);

    const removeOption = screen.getByRole('menuitem', { name: /Remove from Library/i });
    fireEvent.click(removeOption);

    expect(handleStatusChange).toHaveBeenCalledWith(null);
  });
});
