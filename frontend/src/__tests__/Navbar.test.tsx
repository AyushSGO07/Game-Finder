import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import Navbar from '../components/layout/Navbar';

let mockPathname = '/';

vi.mock('next/navigation', () => ({
  usePathname: () => mockPathname,
}));

describe('Navbar Component', () => {
  beforeEach(() => {
    mockPathname = '/';
  });

  it('renders the brand title and links to home', () => {
    render(<Navbar />);
    const brandLink = screen.getByLabelText('Game Finder Home');
    expect(brandLink).toBeInTheDocument();
    expect(brandLink).toHaveAttribute('href', '/');
    expect(screen.getByText('Game')).toBeInTheDocument();
    expect(screen.getByText('Finder')).toBeInTheDocument();
  });

  it('renders persistent navigation links with correct canonical hrefs', () => {
    render(<Navbar />);
    const homeLink = screen.getByRole('link', { name: /^Home$/ });
    const finderLink = screen.getByRole('link', { name: /^AI Finder$/ });
    const gotyLink = screen.getByRole('link', { name: /^GOTY$/ });
    const libraryLink = screen.getByRole('link', { name: /^My Library$/ });

    expect(homeLink).toHaveAttribute('href', '/');
    expect(screen.queryByRole('link', { name: /^Discover$/ })).not.toBeInTheDocument();
    expect(finderLink).toHaveAttribute('href', '/finder');
    expect(gotyLink).toHaveAttribute('href', '/goty');
    expect(libraryLink).toHaveAttribute('href', '/library');
  });

  it('highlights the active route based on current pathname', () => {
    mockPathname = '/finder';
    render(<Navbar />);
    const finderLink = screen.getByRole('link', { name: /^AI Finder$/ });
    expect(finderLink).toHaveAttribute('aria-current', 'page');
  });

  it('fires onOpenSearch when the search button is clicked', () => {
    const handleOpenSearch = vi.fn();
    render(<Navbar onOpenSearch={handleOpenSearch} />);

    const searchButton = screen.getByLabelText(/Search games/i);
    fireEvent.click(searchButton);

    expect(handleOpenSearch).toHaveBeenCalledTimes(1);
  });

  it('fires onToggleMobileMenu when the mobile menu button is clicked', () => {
    const handleToggleMobile = vi.fn();
    render(<Navbar onToggleMobileMenu={handleToggleMobile} />);

    const menuButton = screen.getByLabelText(/Open mobile navigation menu/i);
    fireEvent.click(menuButton);

    expect(handleToggleMobile).toHaveBeenCalledTimes(1);
  });
});
