import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import FinderResults from '../components/finder/FinderResults';
import { EnrichedRecommendation, WizardPreferences } from '../types/game';

const mockRecommendations: EnrichedRecommendation[] = Array.from({ length: 8 }, (_, i) => ({
  id: 1000 + i,
  steam_appid: 1000 + i,
  name: `Game Title ${i + 1}`,
  match_reason: `AI Match reason for Game ${i + 1}`,
  attributes: ['Action', 'RPG'],
  header_image: 'https://example.com/header.jpg',
  rating: 9.0 + i * 0.1,
}));

const mockPreferences: WizardPreferences = {
  genre: 'RPG',
  mood: 'Deep Story',
  difficulty: 'Hard',
  age: 'Mature',
  prompt: 'epic fantasy quest',
};

describe('FinderResults Component', () => {
  it('renders all 8 recommendation cards and active criteria badges', () => {
    const onTweak = vi.fn();
    const onReset = vi.fn();

    render(
      <FinderResults
        recommendations={mockRecommendations}
        preferences={mockPreferences}
        onTweakPreferences={onTweak}
        onNewSearch={onReset}
      />
    );

    // Criteria pills
    expect(screen.getAllByText('RPG')[0]).toBeInTheDocument();
    expect(screen.getByText('Deep Story')).toBeInTheDocument();
    expect(screen.getByText('Hard')).toBeInTheDocument();
    expect(screen.getByText('Mature')).toBeInTheDocument();

    // 8 cards
    expect(screen.getByText('Game Title 1')).toBeInTheDocument();
    expect(screen.getByText('Game Title 8')).toBeInTheDocument();

    // Tweak action
    const tweakBtn = screen.getByRole('button', { name: /Tweak Preferences/i });
    fireEvent.click(tweakBtn);
    expect(onTweak).toHaveBeenCalledTimes(1);

    // New search action
    const newSearchBtn = screen.getByRole('button', { name: /New Search/i });
    fireEvent.click(newSearchBtn);
    expect(onReset).toHaveBeenCalledTimes(1);
  });
});
