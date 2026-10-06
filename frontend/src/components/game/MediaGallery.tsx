'use client';

import React, { useState } from 'react';
import { Play, Maximize2, Image as ImageIcon } from 'lucide-react';
import { MovieItem, ScreenshotItem } from '@/types/game';
import TrailerPlayer from './TrailerPlayer';
import ScreenshotLightbox from './ScreenshotLightbox';

interface MediaGalleryProps {
  movies: MovieItem[];
  screenshots: ScreenshotItem[];
  gameTitle: string;
}

export default function MediaGallery({ movies, screenshots, gameTitle }: MediaGalleryProps) {
  const hasMovies = movies && movies.length > 0;
  const hasScreenshots = screenshots && screenshots.length > 0;

  const [activeMedia, setActiveMedia] = useState<{
    type: 'movie' | 'screenshot';
    index: number;
  }>({
    type: hasMovies ? 'movie' : 'screenshot',
    index: 0,
  });

  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const openLightbox = (index: number) => {
    setLightboxIndex(index);
    setIsLightboxOpen(true);
  };

  const currentMovie = hasMovies && activeMedia.type === 'movie' ? movies[activeMedia.index] : null;
  const currentScreenshot =
    hasScreenshots && activeMedia.type === 'screenshot' ? screenshots[activeMedia.index] : null;

  return (
    <section
      aria-label="Media Showcase"
      className="w-full flex flex-col gap-3 select-none"
    >
      {/* 1. Main Viewport (16:9 Aspect Ratio) */}
      <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-slate-950 border border-white/10 shadow-2xl">
        {currentMovie ? (
          <TrailerPlayer movie={currentMovie} />
        ) : currentScreenshot ? (
          <div className="relative w-full h-full group">
            <img
              src={currentScreenshot.path_full}
              alt={`${gameTitle} screenshot ${activeMedia.index + 1}`}
              onClick={() => openLightbox(activeMedia.index)}
              className="w-full h-full object-cover cursor-pointer transition-transform duration-500 group-hover:scale-102"
            />

            {/* Expand Fullscreen Button */}
            <button
              type="button"
              onClick={() => openLightbox(activeMedia.index)}
              aria-label="Expand screenshot in fullscreen"
              className="absolute top-4 right-4 p-2.5 rounded-xl bg-slate-950/80 hover:bg-indigo-600 text-white border border-white/10 backdrop-blur-md opacity-0 group-hover:opacity-100 transition-all focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-indigo-400 shadow-lg"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-slate-500">
            <ImageIcon className="w-12 h-12 text-indigo-400/50 mb-2" />
            <span className="text-sm">No media available</span>
          </div>
        )}
      </div>

      {/* 2. Horizontal Thumbnail Strip */}
      <div
        className="flex items-center gap-3 overflow-x-auto scrollbar-none py-2 px-0.5"
        role="tablist"
        aria-label="Media thumbnails"
      >
        {/* Movie Thumbnails */}
        {movies.map((movie, idx) => {
          const isActive = activeMedia.type === 'movie' && activeMedia.index === idx;
          return (
            <button
              key={`movie-${movie.id || idx}`}
              type="button"
              role="tab"
              aria-selected={isActive}
              aria-label={`Select trailer: ${movie.name}`}
              onClick={() => setActiveMedia({ type: 'movie', index: idx })}
              className={`relative w-28 sm:w-36 aspect-video rounded-xl overflow-hidden border shrink-0 transition-all ${
                isActive
                  ? 'border-indigo-500 ring-2 ring-indigo-500/50 scale-102 shadow-lg shadow-indigo-500/20'
                  : 'border-white/10 hover:border-white/30 opacity-70 hover:opacity-100'
              }`}
            >
              <img
                src={movie.thumbnail}
                alt={movie.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-slate-950/40 flex items-center justify-center">
                <div className="w-6 h-6 rounded-full bg-indigo-600/90 text-white flex items-center justify-center shadow-md">
                  <Play className="w-3 h-3 fill-white ml-0.5" />
                </div>
              </div>
            </button>
          );
        })}

        {/* Screenshot Thumbnails */}
        {screenshots.map((ss, idx) => {
          const isActive = activeMedia.type === 'screenshot' && activeMedia.index === idx;
          return (
            <button
              key={`screenshot-${ss.id || idx}`}
              type="button"
              role="tab"
              aria-selected={isActive}
              aria-label={`Select screenshot ${idx + 1}`}
              onClick={() => setActiveMedia({ type: 'screenshot', index: idx })}
              className={`relative w-28 sm:w-36 aspect-video rounded-xl overflow-hidden border shrink-0 transition-all ${
                isActive
                  ? 'border-indigo-500 ring-2 ring-indigo-500/50 scale-102 shadow-lg shadow-indigo-500/20'
                  : 'border-white/10 hover:border-white/30 opacity-70 hover:opacity-100'
              }`}
            >
              <img
                src={ss.path_thumbnail}
                alt={`Screenshot thumb ${idx + 1}`}
                className="w-full h-full object-cover"
              />
            </button>
          );
        })}
      </div>

      {/* 3. Fullscreen Screenshot Lightbox */}
      <ScreenshotLightbox
        isOpen={isLightboxOpen}
        initialIndex={lightboxIndex}
        screenshots={screenshots}
        onClose={() => setIsLightboxOpen(false)}
      />
    </section>
  );
}
