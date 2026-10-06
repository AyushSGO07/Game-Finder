import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import GenreMoodSelector from '../components/finder/GenreMoodSelector';

describe('GenreMoodSelector Component', () => {
  it('renders all 12 primary genre options and mood vibe tags', () => {
    const onSelectGenre = vi.fn();
    const onSelectMood = vi.fn();

    render(
      <GenreMoodSelector
        selectedGenre="RPG"
        selectedMood="Cozy & Chill"
        onSelectGenre={onSelectGenre}
        onSelectMood={onSelectMood}
      />
    );

    // Verify primary genres rendered
    expect(screen.getByRole('button', { name: /RPG/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Action/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Horror/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Strategy/i })).toBeInTheDocument();

    // Verify mood vibe tags rendered
    expect(screen.getByRole('button', { name: /Cozy & Chill/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /High Adrenaline/i })).toBeInTheDocument();
  });

  it('triggers onSelectGenre when a genre button is clicked', () => {
    const onSelectGenre = vi.fn();
    const onSelectMood = vi.fn();

    render(
      <GenreMoodSelector
        selectedGenre="Action"
        selectedMood=""
        onSelectGenre={onSelectGenre}
        onSelectMood={onSelectMood}
      />
    );

    const horrorBtn = screen.getByRole('button', { name: /Horror/i });
    fireEvent.click(horrorBtn);
    expect(onSelectGenre).toHaveBeenCalledWith('Horror');
  });

  it('triggers onSelectMood when a mood tag is clicked', () => {
    const onSelectGenre = vi.fn();
    const onSelectMood = vi.fn();

    render(
      <GenreMoodSelector
        selectedGenre="Action"
        selectedMood="Cozy & Chill"
        onSelectGenre={onSelectGenre}
        onSelectMood={onSelectMood}
      />
    );

    const deepStoryBtn = screen.getByRole('button', { name: /Deep Story/i });
    fireEvent.click(deepStoryBtn);
    expect(onSelectMood).toHaveBeenCalledWith('Deep Story');
  });
});
