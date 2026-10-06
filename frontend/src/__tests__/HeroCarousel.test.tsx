import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import React from 'react';
import HeroCarousel from '../components/discovery/HeroCarousel';
import { MOCK_HERO_SLIDES } from '../lib/mockData';

describe('HeroCarousel Component', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders initial slide title, rating, genres, and synopsis', () => {
    render(<HeroCarousel slides={MOCK_HERO_SLIDES} />);
    const first = MOCK_HERO_SLIDES[0];

    expect(screen.getByRole('heading', { level: 2, name: first.title })).toBeInTheDocument();
    expect(screen.getByText(first.synopsis)).toBeInTheDocument();
    expect(screen.getByText(first.rating.toFixed(1))).toBeInTheDocument();
    expect(screen.getByText(first.genres[0])).toBeInTheDocument();
  });

  it('navigates to next and previous slides via chevron controls', () => {
    render(<HeroCarousel slides={MOCK_HERO_SLIDES} />);

    // Click next slide
    const nextButton = screen.getByLabelText('Next slide');
    fireEvent.click(nextButton);

    const second = MOCK_HERO_SLIDES[1];
    expect(screen.getByRole('heading', { level: 2, name: second.title })).toBeInTheDocument();

    // Click prev slide
    const prevButton = screen.getByLabelText('Previous slide');
    fireEvent.click(prevButton);

    const first = MOCK_HERO_SLIDES[0];
    expect(screen.getByRole('heading', { level: 2, name: first.title })).toBeInTheDocument();
  });

  it('advances slides automatically via timer when not hovered', () => {
    render(<HeroCarousel slides={MOCK_HERO_SLIDES} autoPlayInterval={3000} />);

    act(() => {
      vi.advanceTimersByTime(3000);
    });

    const second = MOCK_HERO_SLIDES[1];
    expect(screen.getByRole('heading', { level: 2, name: second.title })).toBeInTheDocument();
  });

  it('pauses auto-play on mouse enter and resumes on mouse leave', () => {
    render(<HeroCarousel slides={MOCK_HERO_SLIDES} autoPlayInterval={3000} />);
    const carouselRegion = screen.getByRole('region', { name: 'Featured Games Carousel' });

    // Hover pauses timer
    fireEvent.mouseEnter(carouselRegion);
    act(() => {
      vi.advanceTimersByTime(6000);
    });
    // Should still be on the first slide
    expect(screen.getByRole('heading', { level: 2, name: MOCK_HERO_SLIDES[0].title })).toBeInTheDocument();

    // Mouse leave resumes timer
    fireEvent.mouseLeave(carouselRegion);
    act(() => {
      vi.advanceTimersByTime(3000);
    });
    expect(screen.getByRole('heading', { level: 2, name: MOCK_HERO_SLIDES[1].title })).toBeInTheDocument();
  });

  it('toggles favorite state on button click', () => {
    const handleFavorite = vi.fn();
    render(<HeroCarousel slides={MOCK_HERO_SLIDES} onFavorite={handleFavorite} />);

    const favButton = screen.getByRole('button', { name: 'Add to favorites' });
    fireEvent.click(favButton);

    expect(handleFavorite).toHaveBeenCalledWith(MOCK_HERO_SLIDES[0]);
    expect(screen.getByRole('button', { name: 'Remove from favorites' })).toBeInTheDocument();
  });
});
