import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import MobileNav from '../components/layout/MobileNav';

vi.mock('next/navigation', () => ({
  usePathname: () => '/',
}));

describe('MobileNav Component', () => {
  it('renders the persistent bottom navigation bar with 5 tabs', () => {
    render(<MobileNav isOpen={false} onClose={vi.fn()} />);
    const bottomNav = screen.getByRole('navigation', { name: 'Mobile Bottom Navigation' });
    expect(bottomNav).toBeInTheDocument();

    expect(screen.getByRole('link', { name: /Home/i })).toHaveAttribute('href', '/');
    expect(screen.getByRole('link', { name: /Discover/i })).toHaveAttribute('href', '/discover');
    expect(screen.getByRole('link', { name: /Finder/i })).toHaveAttribute('href', '/finder');
    expect(screen.getByRole('link', { name: /GOTY/i })).toHaveAttribute('href', '/goty');
    expect(screen.getByRole('link', { name: /Library/i })).toHaveAttribute('href', '/library');
  });

  it('renders drawer dialog when isOpen is true', () => {
    render(<MobileNav isOpen={true} onClose={vi.fn()} />);
    const dialog = screen.getByRole('dialog', { name: 'Mobile Navigation Menu' });
    expect(dialog).toBeInTheDocument();
    expect(screen.getByLabelText('Close menu')).toBeInTheDocument();
  });

  it('calls onClose when the close button or backdrop is clicked', () => {
    const handleClose = vi.fn();
    render(<MobileNav isOpen={true} onClose={handleClose} />);

    // Click close button
    const closeBtn = screen.getByLabelText('Close menu');
    fireEvent.click(closeBtn);
    expect(handleClose).toHaveBeenCalledTimes(1);

    // Click backdrop
    const backdrop = screen.getByTestId('drawer-backdrop');
    fireEvent.click(backdrop);
    expect(handleClose).toHaveBeenCalledTimes(2);
  });

  it('triggers onOpenSearch and closes drawer when search option clicked in drawer', () => {
    const handleClose = vi.fn();
    const handleOpenSearch = vi.fn();
    render(<MobileNav isOpen={true} onClose={handleClose} onOpenSearch={handleOpenSearch} />);

    const searchBtn = screen.getByText('Search all games...');
    fireEvent.click(searchBtn);

    expect(handleClose).toHaveBeenCalledTimes(1);
    expect(handleOpenSearch).toHaveBeenCalledTimes(1);
  });
});
