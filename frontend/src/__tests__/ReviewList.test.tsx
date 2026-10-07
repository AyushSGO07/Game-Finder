import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import ReviewList from '@/components/reviews/ReviewList';
import { GameReview } from '@/types/game';

describe('ReviewList Component', () => {
  const sampleReviews: GameReview[] = [
    {
      id: 'rev-1',
      user_id: 'user-1',
      game_id: '1245620',
      rating: 10,
      title: 'A True Masterpiece',
      body: 'FromSoftware delivers an **unmatched** open world adventure.\n\n- Combat is deep\n- Exploration is thrilling',
      username: 'TarnishedChampion',
      avatar_url: 'https://example.com/avatar.jpg',
      created_at: '2026-09-10T12:00:00Z',
    },
    {
      id: 'rev-2',
      user_id: 'user-2',
      game_id: '1245620',
      rating: 8,
      title: 'Challenging and Beautiful',
      body: '> "Prepare to die, but prepare to be amazed."',
      username: 'GamerGirl99',
      avatar_url: null,
      created_at: '2026-09-15T15:00:00Z',
    },
  ];

  it('renders average community score and total count', () => {
    render(<ReviewList reviews={sampleReviews} />);

    expect(screen.getByText('Community Reviews')).toBeInTheDocument();
    expect(screen.getByText(/2 reviews from Game Finder players/i)).toBeInTheDocument();
    // (10 + 8) / 2 = 9.0
    expect(screen.getByText(/9.0 \/ 10 Average Score/i)).toBeInTheDocument();
  });

  it('renders individual review cards with username, rating, and markdown formatting', () => {
    render(<ReviewList reviews={sampleReviews} />);

    expect(screen.getByText('TarnishedChampion')).toBeInTheDocument();
    expect(screen.getByText('A True Masterpiece')).toBeInTheDocument();
    expect(screen.getByText('10 / 10')).toBeInTheDocument();

    // Check parsed markdown strong element
    expect(screen.getByText('unmatched')).toBeInTheDocument();
    // Check parsed list items
    expect(screen.getByText('Combat is deep')).toBeInTheDocument();

    // Second review
    expect(screen.getByText('GamerGirl99')).toBeInTheDocument();
    expect(screen.getByText('8 / 10')).toBeInTheDocument();
  });

  it('renders empty state when reviews array is empty', () => {
    render(<ReviewList reviews={[]} />);

    expect(screen.getByText(/No community reviews yet/i)).toBeInTheDocument();
    expect(screen.getByText(/Be the first player to share your rating/i)).toBeInTheDocument();
  });
});
