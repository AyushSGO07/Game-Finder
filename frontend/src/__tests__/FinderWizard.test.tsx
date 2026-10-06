import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import FinderWizard from '../components/finder/FinderWizard';

describe('FinderWizard Master Component', () => {
  it('renders Step 1 initially and advances through steps', () => {
    const onSubmit = vi.fn();

    render(<FinderWizard onSubmit={onSubmit} />);

    // Step 1: Genre & Vibe
    expect(screen.getByRole('heading', { name: /Choose Your Genre & Vibe/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Next: Difficulty & Age/i })).toBeInTheDocument();

    // Advance to Step 2
    fireEvent.click(screen.getByRole('button', { name: /Next: Difficulty & Age/i }));
    expect(screen.getByRole('heading', { name: /Tune Challenge & Rating/i })).toBeInTheDocument();

    // Advance to Step 3
    fireEvent.click(screen.getByRole('button', { name: /Next: Guidance Prompt/i }));
    expect(screen.getByRole('heading', { name: /Personalize Your Match/i })).toBeInTheDocument();

    // Back to Step 2
    fireEvent.click(screen.getByRole('button', { name: /Back/i }));
    expect(screen.getByRole('heading', { name: /Tune Challenge & Rating/i })).toBeInTheDocument();
  });

  it('submits preferences on Step 3 when clicking Find My Games button', () => {
    const onSubmit = vi.fn();

    render(<FinderWizard onSubmit={onSubmit} />);

    // Step 1 -> Step 2
    fireEvent.click(screen.getByRole('button', { name: /Next: Difficulty & Age/i }));

    // Step 2 -> Step 3
    fireEvent.click(screen.getByRole('button', { name: /Next: Guidance Prompt/i }));

    // Step 3 -> Submit
    const submitBtn = screen.getByRole('button', { name: /Find My Games/i });
    fireEvent.click(submitBtn);

    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        genre: expect.any(String),
        difficulty: expect.any(String),
        age: expect.any(String),
      })
    );
  });
});
