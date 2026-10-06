import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import GameDetailPage from '../app/games/[id]/page';

describe('GameDetailPage Dynamic Route Integration', () => {
  beforeEach(() => {
    window.HTMLMediaElement.prototype.play = vi.fn().mockResolvedValue(undefined);
    window.HTMLMediaElement.prototype.pause = vi.fn();
  });

  it('renders complete game detail page for Elden Ring (1245620)', async () => {
    const PageComponent = await GameDetailPage({
      params: Promise.resolve({ id: '1245620' }),
    });

    render(PageComponent);

    // 1. Header
    expect(screen.getByRole('heading', { level: 1, name: 'ELDEN RING' })).toBeInTheDocument();
    expect(screen.getByText('9.6')).toBeInTheDocument();

    // 2. Media Showcase
    expect(screen.getByRole('region', { name: 'Media Showcase' })).toBeInTheDocument();

    // 3. About This Game
    expect(screen.getByRole('region', { name: 'About the game' })).toBeInTheDocument();
    expect(screen.getByText(/A vast world full of excitement/i)).toBeInTheDocument();

    // 4. System Requirements
    expect(screen.getByLabelText('PC System Requirements')).toBeInTheDocument();

    // 5. Sidebar
    expect(screen.getByLabelText('Game Metadata Sidebar')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Steam Store Page/i })).toHaveAttribute(
      'href',
      'https://store.steampowered.com/app/1245620/ELDEN_RING/'
    );
  });
});
