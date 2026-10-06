import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import DifficultyAgeSelector from '../components/finder/DifficultyAgeSelector';

describe('DifficultyAgeSelector Component', () => {
  it('renders all 5 difficulty cards and 5 age rating options', () => {
    const onSelectDifficulty = vi.fn();
    const onSelectAge = vi.fn();

    render(
      <DifficultyAgeSelector
        selectedDifficulty="Normal"
        selectedAge="Teen"
        onSelectDifficulty={onSelectDifficulty}
        onSelectAge={onSelectAge}
      />
    );

    // Difficulty cards
    expect(screen.getByRole('button', { name: /Casual/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Normal/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Hard/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Punishing/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Any Difficulty/i })).toBeInTheDocument();

    // Age rating options
    expect(screen.getByRole('button', { name: /Everyone \(E\)/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Teen \(T\)/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Mature \(M\)/i })).toBeInTheDocument();
  });

  it('triggers onSelectDifficulty when a difficulty card is clicked', () => {
    const onSelectDifficulty = vi.fn();
    const onSelectAge = vi.fn();

    render(
      <DifficultyAgeSelector
        selectedDifficulty="Normal"
        selectedAge="Teen"
        onSelectDifficulty={onSelectDifficulty}
        onSelectAge={onSelectAge}
      />
    );

    const punishingBtn = screen.getByRole('button', { name: /Punishing/i });
    fireEvent.click(punishingBtn);
    expect(onSelectDifficulty).toHaveBeenCalledWith('Punishing');
  });

  it('triggers onSelectAge when an age rating pill is clicked', () => {
    const onSelectDifficulty = vi.fn();
    const onSelectAge = vi.fn();

    render(
      <DifficultyAgeSelector
        selectedDifficulty="Normal"
        selectedAge="Teen"
        onSelectDifficulty={onSelectDifficulty}
        onSelectAge={onSelectAge}
      />
    );

    const matureBtn = screen.getByRole('button', { name: /Mature \(M\)/i });
    fireEvent.click(matureBtn);
    expect(onSelectAge).toHaveBeenCalledWith('Mature');
  });
});
