import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import GotyPage from '@/app/goty/page';
import { LibraryProvider } from '@/context/LibraryContext';

describe('GotyPage Route Integration', () => {
  it('renders page header and ceremony timeline', () => {
    render(
      <LibraryProvider>
        <GotyPage />
      </LibraryProvider>
    );

    expect(screen.getByText('Game of the Year Hall of Fame')).toBeInTheDocument();
    expect(screen.getByText(/The Game Awards Archive/i)).toBeInTheDocument();

    // Verify timeline has year tabs
    const tab2024 = screen.getByRole('tab', { name: /2024/i });
    expect(tab2024).toBeInTheDocument();
    expect(tab2024).toHaveAttribute('aria-selected', 'true');
  });

  it('renders default year winner and runner-up nominees', () => {
    render(
      <LibraryProvider>
        <GotyPage />
      </LibraryProvider>
    );

    // 2024 Winner is Astro Bot
    expect(screen.getByText('Astro Bot')).toBeInTheDocument();
    expect(screen.getByText(/2024 Game of the Year Winner/i)).toBeInTheDocument();

    // Nominees section for 2024
    expect(screen.getByText(/Official Nominees for 2024/i)).toBeInTheDocument();
    expect(screen.getByText('Balatro')).toBeInTheDocument();
    expect(screen.getByText('Black Myth: Wukong')).toBeInTheDocument();
  });

  it('switches winner and nominees when selecting another year', async () => {
    render(
      <LibraryProvider>
        <GotyPage />
      </LibraryProvider>
    );

    // Click 2023 tab
    const tab2023 = screen.getByRole('tab', { name: /2023/i });
    fireEvent.click(tab2023);

    // Now 2023 Winner Baldur's Gate 3 should be displayed
    await waitFor(() => {
      expect(screen.getByText("Baldur's Gate 3")).toBeInTheDocument();
    });
    expect(screen.getByText(/2023 Game of the Year Winner/i)).toBeInTheDocument();

    // Official nominees for 2023
    expect(screen.getByText(/Official Nominees for 2023/i)).toBeInTheDocument();
    expect(screen.getByText('Alan Wake 2')).toBeInTheDocument();
    expect(screen.getByText("Marvel's Spider-Man 2")).toBeInTheDocument();
  });
});
