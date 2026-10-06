import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import HomePage from '../app/page';

describe('DiscoveryHome Page Integration', () => {
  it('renders Hero Carousel, all 4 Game Shelves, and 12-tile Genre Hub', async () => {
    // Await async server component
    const PageComponent = await HomePage();
    render(PageComponent);

    // 1. Verify Hero Carousel region
    expect(screen.getByRole('region', { name: 'Featured Games Carousel' })).toBeInTheDocument();

    // 2. Verify all 4 shelf headings
    expect(screen.getByRole('heading', { level: 2, name: 'Trending Now' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2, name: 'New Releases' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2, name: 'Top Rated of All Time' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2, name: 'Hidden Gems' })).toBeInTheDocument();

    // 3. Verify Genre Hub
    expect(screen.getByRole('region', { name: 'Genre Hub' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2, name: 'Browse by Genre' })).toBeInTheDocument();

    // 4. Verify presence of all 12 genres
    const expectedGenres = [
      'Action',
      'RPG',
      'Adventure',
      'Shooter',
      'Horror',
      'Strategy',
      'Simulation',
      'Racing',
      'Sports',
      'Indie',
      'Puzzle',
      'Platformer',
    ];

    for (const genre of expectedGenres) {
      expect(screen.getByRole('link', { name: new RegExp(genre, 'i') })).toBeInTheDocument();
    }
  });
});
