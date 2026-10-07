import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import Top10Builder from '@/components/library/Top10Builder';
import { RankedPosition } from '@/types/game';

// Mock dependencies
vi.mock('@/context/LibraryContext', () => ({
  useLibrary: () => ({
    items: {
      '1245620': {
        game_id: '1245620',
        game_title: 'Elden Ring',
        game_cover_url: 'https://cdn.example.com/elden-ring.jpg',
        status: 'completed',
        is_favorite: true,
      },
      '1086940': {
        game_id: '1086940',
        game_title: "Baldur's Gate 3",
        game_cover_url: 'https://cdn.example.com/bg3.jpg',
        status: 'playing',
        is_favorite: true,
      },
    },
    isLoading: false,
  }),
}));

vi.mock('@/lib/api', () => ({
  fetchUserRankings: vi.fn().mockResolvedValue({
    id: 'rank-1',
    user_id: 'user-1',
    title: 'My All-Time Top 10',
    positions: [],
  }),
  saveUserRankings: vi.fn().mockResolvedValue({
    id: 'rank-1',
    user_id: 'user-1',
    title: 'My All-Time Top 10',
    positions: [],
  }),
}));

describe('Top10Builder Component', () => {
  const initialPositions: RankedPosition[] = [
    {
      game_id: '1245620',
      rank: 1,
      title: 'Elden Ring',
      cover_url: 'https://cdn.example.com/elden-ring.jpg',
    },
    {
      game_id: '1086940',
      rank: 2,
      title: "Baldur's Gate 3",
      cover_url: 'https://cdn.example.com/bg3.jpg',
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders all 10 rank slots and prestige tier badges', () => {
    render(<Top10Builder initialPositions={initialPositions} />);

    // Check all 10 slots
    for (let i = 1; i <= 10; i++) {
      expect(screen.getByTestId(`rank-slot-${i}`)).toBeInTheDocument();
    }

    // Check prestige labels
    expect(screen.getByText('#1 Champion')).toBeInTheDocument();
    expect(screen.getByText('#2 Runner Up')).toBeInTheDocument();
    expect(screen.getByText('#3 Third Place')).toBeInTheDocument();
    expect(screen.getByText('#4')).toBeInTheDocument();
    expect(screen.getByText('#10')).toBeInTheDocument();

    // Check pre-populated games
    expect(screen.getByText('Elden Ring')).toBeInTheDocument();
    expect(screen.getByText("Baldur's Gate 3")).toBeInTheDocument();
  });

  it('allows editing the list title', () => {
    render(<Top10Builder initialTitle="Ayush's Masterpieces" initialPositions={initialPositions} />);

    const input = screen.getByLabelText('Ranked list title') as HTMLInputElement;
    expect(input.value).toBe("Ayush's Masterpieces");

    fireEvent.change(input, { target: { value: 'Greatest of All Time' } });
    expect(input.value).toBe('Greatest of All Time');
  });

  it('supports reordering items up and down', () => {
    render(<Top10Builder initialPositions={initialPositions} />);

    // In slot #1: Elden Ring, in slot #2: Baldur's Gate 3
    const slot1 = screen.getByTestId('rank-slot-1');
    const slot2 = screen.getByTestId('rank-slot-2');
    expect(slot1).toHaveTextContent('Elden Ring');
    expect(slot2).toHaveTextContent("Baldur's Gate 3");

    // Click Move Up on slot 2
    const moveUpRank2Btn = screen.getByLabelText('Move rank 2 up');
    fireEvent.click(moveUpRank2Btn);

    // Now slot #1 should have Baldur's Gate 3 and slot #2 should have Elden Ring
    expect(screen.getByTestId('rank-slot-1')).toHaveTextContent("Baldur's Gate 3");
    expect(screen.getByTestId('rank-slot-2')).toHaveTextContent('Elden Ring');
  });

  it('supports removing a game from a slot', () => {
    render(<Top10Builder initialPositions={initialPositions} />);

    expect(screen.getByTestId('rank-slot-1')).toHaveTextContent('Elden Ring');

    const removeBtn = screen.getByLabelText('Remove game from rank 1');
    fireEvent.click(removeBtn);

    expect(screen.getByTestId('rank-slot-1')).toHaveTextContent('Assign game to slot #1');
    expect(screen.getByTestId('rank-slot-1')).not.toHaveTextContent('Elden Ring');
  });

  it('triggers onSave callback with title and ranked positions', async () => {
    const onSaveMock = vi.fn().mockResolvedValue(undefined);
    render(
      <Top10Builder
        initialTitle="My Top 10"
        initialPositions={initialPositions}
        onSave={onSaveMock}
      />
    );

    const saveButton = screen.getByRole('button', { name: /Save Top 10 Rankings/i });
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(onSaveMock).toHaveBeenCalledTimes(1);
    });

    expect(onSaveMock).toHaveBeenCalledWith('My Top 10', [
      {
        game_id: '1245620',
        rank: 1,
        title: 'Elden Ring',
        cover_url: 'https://cdn.example.com/elden-ring.jpg',
      },
      {
        game_id: '1086940',
        rank: 2,
        title: "Baldur's Gate 3",
        cover_url: 'https://cdn.example.com/bg3.jpg',
      },
    ]);

    expect(await screen.findByText('Saved!')).toBeInTheDocument();
  });
});
