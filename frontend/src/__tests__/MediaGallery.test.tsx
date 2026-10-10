import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import MediaGallery from '../components/game/MediaGallery';
import { MovieItem, ScreenshotItem } from '@/types/game';

describe('MediaGallery Component', () => {
  const sampleMovies: MovieItem[] = [
    {
      id: 101,
      name: 'Trailer 1',
      thumbnail: 'movie_thumb.jpg',
      mp4_url: 'movie.mp4',
    },
  ];

  const sampleScreenshots: ScreenshotItem[] = [
    { id: 1, path_thumbnail: 'ss_thumb1.jpg', path_full: 'ss_full1.jpg' },
    { id: 2, path_thumbnail: 'ss_thumb2.jpg', path_full: 'ss_full2.jpg' },
  ];

  beforeEach(() => {
    window.HTMLMediaElement.prototype.play = vi.fn().mockResolvedValue(undefined);
    window.HTMLMediaElement.prototype.pause = vi.fn();
  });

  it('renders trailer by default when movies are available', () => {
    render(
      <MediaGallery
        movies={sampleMovies}
        screenshots={sampleScreenshots}
        gameTitle="Elden Ring"
      />
    );

    expect(screen.getByText('Trailer 1')).toBeInTheDocument();
  });

  it('switches main viewport to screenshot when screenshot thumbnail is clicked', () => {
    render(
      <MediaGallery
        movies={sampleMovies}
        screenshots={sampleScreenshots}
        gameTitle="Elden Ring"
      />
    );

    const ssThumb = screen.getByLabelText('Select screenshot 1');
    fireEvent.click(ssThumb);

    expect(screen.getByAltText('Elden Ring screenshot 1')).toBeInTheDocument();
  });

  it('opens screenshot lightbox modal on expand button click', () => {
    render(
      <MediaGallery
        movies={sampleMovies}
        screenshots={sampleScreenshots}
        gameTitle="Elden Ring"
      />
    );

    // Switch to screenshot first
    const ssThumb = screen.getByLabelText('Select screenshot 1');
    fireEvent.click(ssThumb);

    const expandButton = screen.getByLabelText('Expand screenshot in fullscreen');
    fireEvent.click(expandButton);

    expect(screen.getByRole('dialog', { name: 'Screenshot lightbox' })).toBeInTheDocument();
  });

  it('limits to a maximum of ONE trailer in thumbnail strip when multiple trailers are provided', () => {
    const multiMovies: MovieItem[] = [
      { id: 1, name: 'Launch Trailer', thumbnail: 'launch_thumb.jpg', mp4_url: 'launch.mp4' },
      { id: 2, name: 'Gameplay Trailer', thumbnail: 'gameplay_thumb.jpg', mp4_url: 'gameplay.mp4' },
      { id: 3, name: 'Teaser Trailer', thumbnail: 'teaser_thumb.jpg', mp4_url: 'teaser.mp4' },
    ];

    render(
      <MediaGallery
        movies={multiMovies}
        screenshots={sampleScreenshots}
        gameTitle="Elden Ring"
      />
    );

    // Exactly one trailer button should be rendered in tablist
    expect(screen.getByLabelText(/Select trailer: Launch Trailer/i)).toBeInTheDocument();
    expect(screen.queryByLabelText(/Select trailer: Gameplay Trailer/i)).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/Select trailer: Teaser Trailer/i)).not.toBeInTheDocument();
  });

  it('deduplicates identical screenshot URLs and excludes trailer thumbnail from screenshots', () => {
    const trailerPoster = 'https://example.com/trailer_poster.jpg';
    const moviesWithPoster: MovieItem[] = [
      { id: 1, name: 'Main Trailer', thumbnail: trailerPoster, mp4_url: 'trailer.mp4' },
    ];

    const duplicateScreenshots: ScreenshotItem[] = [
      { id: 1, path_thumbnail: trailerPoster, path_full: trailerPoster }, // matches trailer poster
      { id: 2, path_thumbnail: 'ss1_thumb.jpg', path_full: 'ss1_full.jpg' },
      { id: 3, path_thumbnail: 'ss1_thumb.jpg', path_full: 'ss1_full.jpg' }, // exact duplicate
      { id: 4, path_thumbnail: 'ss2_thumb.jpg', path_full: 'ss2_full.jpg' },
    ];

    render(
      <MediaGallery
        movies={moviesWithPoster}
        screenshots={duplicateScreenshots}
        gameTitle="Elden Ring"
      />
    );

    // Trailer is present
    expect(screen.getByLabelText(/Select trailer: Main Trailer/i)).toBeInTheDocument();
    // Screenshot 1 and 2 are present
    expect(screen.getByLabelText('Select screenshot 1')).toBeInTheDocument();
    expect(screen.getByLabelText('Select screenshot 2')).toBeInTheDocument();
    // Screenshot 3 was duplicate, and trailer poster was excluded
    expect(screen.queryByLabelText('Select screenshot 3')).not.toBeInTheDocument();
  });
});

