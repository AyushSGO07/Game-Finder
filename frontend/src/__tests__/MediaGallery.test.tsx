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
});
