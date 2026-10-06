import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import FinderPage from '../app/finder/page';
import * as api from '../lib/api';

describe('FinderPage Full Route Integration', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('renders wizard on load and progresses to results on submit', async () => {
    // Mock recommendations response
    vi.spyOn(api, 'fetchRecommendations').mockResolvedValue(
      Array.from({ length: 8 }, (_, i) => ({
        id: 1000 + i,
        steam_appid: 1000 + i,
        name: `Recommended Game ${i + 1}`,
        match_reason: `Great match reason ${i + 1}`,
        attributes: ['RPG', 'Action'],
        header_image: 'https://example.com/cover.jpg',
      }))
    );

    render(<FinderPage />);

    // Initial state: Wizard Step 1
    expect(screen.getByRole('heading', { name: /Choose Your Genre & Vibe/i })).toBeInTheDocument();

    // Step 1 -> Step 2
    fireEvent.click(screen.getByRole('button', { name: /Next: Difficulty & Age/i }));

    // Step 2 -> Step 3
    fireEvent.click(screen.getByRole('button', { name: /Next: Guidance Prompt/i }));

    // Step 3 -> Submit
    fireEvent.click(screen.getByRole('button', { name: /Find My Games/i }));

    // Results view displayed
    await waitFor(() => {
      expect(screen.getByText('Recommended Game 1')).toBeInTheDocument();
      expect(screen.getByText('Recommended Game 8')).toBeInTheDocument();
    });
  });
});
