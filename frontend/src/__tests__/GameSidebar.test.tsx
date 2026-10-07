import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import GameHeader from '../components/game/GameHeader';
import GameSidebar from '../components/game/GameSidebar';
import { MOCK_GAME_DETAILS } from '../lib/mockData';

describe('GameHeader and GameSidebar Components', () => {
  const eldenRing = MOCK_GAME_DETAILS['1245620'];

  it('GameHeader renders title, score, release date, and developers', () => {
    render(<GameHeader game={eldenRing} />);

    expect(screen.getByRole('heading', { level: 1, name: 'ELDEN RING' })).toBeInTheDocument();
    expect(screen.getByText('9.6')).toBeInTheDocument();
    expect(screen.getByText(eldenRing.release_date!)).toBeInTheDocument();
    expect(screen.getByText('FromSoftware Inc.')).toBeInTheDocument();
  });

  it('GameHeader fires onAddLibrary and onFavorite callbacks when action buttons clicked', () => {
    const handleAddLibrary = vi.fn();
    const handleFavorite = vi.fn();

    render(
      <GameHeader
        game={eldenRing}
        onAddLibrary={handleAddLibrary}
        onFavorite={handleFavorite}
      />
    );

    const shelfButton = screen.getByRole('button', { name: /Shelf/i });
    fireEvent.click(shelfButton);

    const completedOption = screen.getByRole('menuitem', { name: /Completed/i });
    fireEvent.click(completedOption);
    expect(handleAddLibrary).toHaveBeenCalledWith(eldenRing);

    const favButton = screen.getByRole('button', { name: /Favorit/i });
    fireEvent.click(favButton);
    expect(handleFavorite).toHaveBeenCalledWith(eldenRing);
  });

  it('GameSidebar renders developers, publishers, platforms, and secure external store links', () => {
    render(<GameSidebar game={eldenRing} />);

    expect(screen.getAllByText('FromSoftware Inc.').length).toBeGreaterThan(0);
    expect(screen.getByText('Bandai Namco Entertainment')).toBeInTheDocument();
    expect(screen.getByText('Windows')).toBeInTheDocument();

    const steamLink = screen.getByRole('link', { name: /Steam Store Page/i });
    expect(steamLink).toHaveAttribute('href', eldenRing.steam_url);
    expect(steamLink).toHaveAttribute('target', '_blank');
    expect(steamLink).toHaveAttribute('rel', 'noopener noreferrer');
  });
});
