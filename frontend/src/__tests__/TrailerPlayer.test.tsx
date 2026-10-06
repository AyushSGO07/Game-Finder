import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import TrailerPlayer from '../components/game/TrailerPlayer';
import { MovieItem } from '@/types/game';

describe('TrailerPlayer Component', () => {
  const sampleMovie: MovieItem = {
    id: 12345,
    name: 'ELDEN RING — Official Gameplay Preview',
    thumbnail: 'https://cdn.akamai.steamstatic.com/steam/apps/12345/movie.jpg',
    mp4_url: 'https://video.akamai.steamstatic.com/trailers/12345/movie.mp4',
    webm_url: 'https://video.akamai.steamstatic.com/trailers/12345/movie.webm',
  };

  beforeEach(() => {
    // Mock HTMLMediaElement play and pause in jsdom
    window.HTMLMediaElement.prototype.play = vi.fn().mockResolvedValue(undefined);
    window.HTMLMediaElement.prototype.pause = vi.fn();
  });

  it('renders video element, poster thumbnail, and title overlay', () => {
    const { container } = render(<TrailerPlayer movie={sampleMovie} />);

    expect(screen.getByText(sampleMovie.name)).toBeInTheDocument();
    const video = container.querySelector('video');
    expect(video).not.toBeNull();
    expect(video).toHaveAttribute('poster', sampleMovie.thumbnail);

    const sources = container.querySelectorAll('source');
    expect(sources.length).toBe(2);
    expect(sources[0]).toHaveAttribute('src', sampleMovie.mp4_url);
    expect(sources[1]).toHaveAttribute('src', sampleMovie.webm_url);
  });

  it('toggles play and pause on control click', () => {
    render(<TrailerPlayer movie={sampleMovie} />);

    // Initially paused -> click Play
    const playButton = screen.getByLabelText('Play video');
    fireEvent.click(playButton);

    expect(window.HTMLMediaElement.prototype.play).toHaveBeenCalled();
  });

  it('toggles mute audio on volume button click', () => {
    render(<TrailerPlayer movie={sampleMovie} />);

    const muteButton = screen.getByLabelText('Mute audio');
    fireEvent.click(muteButton);

    expect(screen.getByLabelText('Unmute audio')).toBeInTheDocument();
  });
});
