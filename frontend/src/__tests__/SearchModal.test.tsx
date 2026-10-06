import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import SearchModal from '../components/layout/SearchModal';

describe('SearchModal Component', () => {
  it('does not render when isOpen is false', () => {
    render(<SearchModal isOpen={false} onClose={vi.fn()} />);
    expect(screen.queryByRole('dialog', { name: 'Quick Search' })).not.toBeInTheDocument();
  });

  it('renders correctly when isOpen is true and shows suggested searches', () => {
    render(<SearchModal isOpen={true} onClose={vi.fn()} />);
    expect(screen.getByRole('dialog', { name: 'Quick Search' })).toBeInTheDocument();
    expect(screen.getByLabelText('Search input')).toBeInTheDocument();
    expect(screen.getByText('Suggested Searches')).toBeInTheDocument();
    expect(screen.getByText('Elden Ring')).toBeInTheDocument();
  });

  it('calls onClose when backdrop or ESC button is clicked', () => {
    const handleClose = vi.fn();
    render(<SearchModal isOpen={true} onClose={handleClose} />);

    // Click backdrop
    const backdrop = screen.getByTestId('search-backdrop');
    fireEvent.click(backdrop);
    expect(handleClose).toHaveBeenCalledTimes(1);

    // Click ESC button
    const escButton = screen.getByLabelText('Close search');
    fireEvent.click(escButton);
    expect(handleClose).toHaveBeenCalledTimes(2);
  });

  it('populates search query when a suggested query pill is clicked', async () => {
    render(<SearchModal isOpen={true} onClose={vi.fn()} />);
    const suggestion = screen.getByRole('button', { name: 'Cyberpunk' });
    fireEvent.click(suggestion);

    const input = screen.getByLabelText('Search input') as HTMLInputElement;
    expect(input.value).toBe('Cyberpunk');
  });

  it('searches and displays matching results and handles game selection', async () => {
    const handleSelectGame = vi.fn();
    const handleClose = vi.fn();

    render(
      <SearchModal
        isOpen={true}
        onClose={handleClose}
        onSelectGame={handleSelectGame}
      />
    );

    const input = screen.getByLabelText('Search input');
    fireEvent.change(input, { target: { value: 'elden' } });

    await waitFor(
      () => {
        expect(screen.getByText('Elden Ring')).toBeInTheDocument();
      },
      { timeout: 1500 }
    );

    const resultCard = screen.getByText('Elden Ring');
    fireEvent.click(resultCard);

    expect(handleSelectGame).toHaveBeenCalledTimes(1);
    expect(handleClose).toHaveBeenCalledTimes(1);
  });
});
