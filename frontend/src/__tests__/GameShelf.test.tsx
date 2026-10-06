import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import GameShelf from '../components/discovery/GameShelf';
import { MOCK_SHELF_GAMES } from '../lib/mockData';

describe('GameShelf Component', () => {
  const trendingGames = MOCK_SHELF_GAMES.trending;

  it('renders shelf title, subtitle, and all game cards', () => {
    render(
      <GameShelf
        title="Trending Now"
        subtitle="Most played releases this week"
        games={trendingGames}
        category="trending"
      />
    );

    expect(screen.getByRole('heading', { level: 2, name: 'Trending Now' })).toBeInTheDocument();
    expect(screen.getByText('Most played releases this week')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /View All/i })).toHaveAttribute('href', '/discover?shelf=trending');

    // Verify first game card details
    const firstGame = trendingGames[0];
    expect(screen.getByText(firstGame.title)).toBeInTheDocument();
    const actionBadges = screen.getAllByText(firstGame.genres[0]);
    expect(actionBadges.length).toBeGreaterThan(0);
    expect(actionBadges[0]).toBeInTheDocument();
  });

  it('scrolls the shelf container when left/right buttons are clicked', () => {
    const scrollByMock = vi.fn();
    // Element.prototype.scrollBy in jsdom
    window.HTMLElement.prototype.scrollBy = scrollByMock;

    render(
      <GameShelf
        title="Top Rated"
        games={trendingGames}
      />
    );

    const leftButton = screen.getByLabelText('Scroll left on Top Rated');
    const rightButton = screen.getByLabelText('Scroll right on Top Rated');

    fireEvent.click(rightButton);
    expect(scrollByMock).toHaveBeenCalledWith({ left: 580, behavior: 'smooth' });

    fireEvent.click(leftButton);
    expect(scrollByMock).toHaveBeenCalledWith({ left: -580, behavior: 'smooth' });
  });

  it('triggers onGameClick when a game card is clicked', () => {
    const handleGameClick = vi.fn();
    render(
      <GameShelf
        title="Trending Now"
        games={trendingGames}
        onGameClick={handleGameClick}
      />
    );

    const firstCard = screen.getByLabelText(`Game card: ${trendingGames[0].title}`);
    fireEvent.click(firstCard);

    expect(handleGameClick).toHaveBeenCalledWith(trendingGames[0]);
  });
});
