import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import RecommendationCard from '../components/finder/RecommendationCard';
import { EnrichedRecommendation } from '../types/game';
import { LibraryProvider } from '@/context/LibraryContext';

const mockRec: EnrichedRecommendation = {
  id: 1245620,
  steam_appid: 1245620,
  name: 'ELDEN RING',
  match_reason: 'Vast open world with punishing souls-like combat matching your Hard difficulty preference.',
  attributes: ['Open World', 'Souls-like', 'Dark Fantasy'],
  header_image: 'https://cdn.akamai.steamstatic.com/steam/apps/1245620/header.jpg',
  rating: 9.6,
  release_date: 'Feb 25, 2022',
};

describe('RecommendationCard Component', () => {
  it('renders game title, match index, attributes, and AI rationale callout', () => {
    render(
      <LibraryProvider>
        <RecommendationCard recommendation={mockRec} index={0} />
      </LibraryProvider>
    );

    expect(screen.getByText('ELDEN RING')).toBeInTheDocument();
    expect(screen.getByText('#1 Match')).toBeInTheDocument();
    expect(screen.getByText('Souls-like')).toBeInTheDocument();
    expect(screen.getByText(/Vast open world with punishing/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Explore Details/i })).toHaveAttribute(
      'href',
      '/games/1245620'
    );
  });

  it('handles quick-save library button toggle', () => {
    const onSave = vi.fn();
    const unsavedRec: EnrichedRecommendation = {
      ...mockRec,
      id: 888999,
      steam_appid: 888999,
      name: 'Unsaved Mystery Game',
    };
    render(
      <LibraryProvider>
        <RecommendationCard recommendation={unsavedRec} index={0} onSave={onSave} />
      </LibraryProvider>
    );

    const saveBtn = screen.getByRole('button', { name: /Save to Library/i });
    fireEvent.click(saveBtn);

    expect(onSave).toHaveBeenCalledWith(unsavedRec);
    expect(screen.getByRole('button', { name: /Saved/i })).toBeInTheDocument();
  });
});

