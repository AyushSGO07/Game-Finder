'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { Play, Maximize2, Image as ImageIcon, Film } from 'lucide-react';
import { MovieItem, ScreenshotItem } from '@/types/game';
import TrailerPlayer from './TrailerPlayer';
import ScreenshotLightbox from './ScreenshotLightbox';

interface MediaGalleryProps {
  movies: MovieItem[];
  screenshots: ScreenshotItem[];
  gameTitle: string;
}

export default function MediaGallery({ movies, screenshots, gameTitle }: MediaGalleryProps) {
  // 1. Identify at most ONE primary, valid playable trailer
  const primaryTrailer = useMemo(() => {
    if (!movies || movies.length === 0) return null;
    const playable = movies.find((m) => Boolean(m && (m.mp4_url || m.webm_url)));
    return playable || movies[0] || null;
  }, [movies]);

  // 2. Clean, deduplicate, and exclude trailer poster from screenshots
  const cleanScreenshots = useMemo(() => {
    if (!screenshots || screenshots.length === 0) return [];
    const seen = new Set<string>();
    const trailerThumb = primaryTrailer?.thumbnail?.trim();
    const result: ScreenshotItem[] = [];

    for (const ss of screenshots) {
      if (!ss) continue;
      const full = (ss.path_full || '').trim();
      const thumb = (ss.path_thumbnail || '').trim() || full;
      if (!full && !thumb) continue;

      const target = full || thumb;
      if (trailerThumb && (target === trailerThumb || thumb === trailerThumb)) continue;
      if (seen.has(target)) continue;
      seen.add(target);

      result.push({
        id: ss.id || result.length + 1,
        path_thumbnail: thumb || full,
        path_full: full || thumb,
      });
    }
    return result;
  }, [screenshots, primaryTrailer]);

  const hasTrailer = Boolean(primaryTrailer);
  const hasScreenshots = cleanScreenshots.length > 0;

  const [activeMedia, setActiveMedia] = useState<{
    type: 'movie' | 'screenshot';
    index: number;
  }>({
    type: hasTrailer ? 'movie' : 'screenshot',
    index: 0,
  });

  useEffect(() => {
    setActiveMedia({
      type: hasTrailer ? 'movie' : 'screenshot',
      index: 0,
    });
  }, [hasTrailer, gameTitle]);

  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({});
  const markImageFailed = (key: string) => {
    setFailedImages((prev) => ({ ...prev, [key]: true }));
  };

  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const openLightbox = (index: number) => {
    setLightboxIndex(index);
    setIsLightboxOpen(true);
  };

  const currentMovie = hasTrailer && activeMedia.type === 'movie' ? primaryTrailer : null;
  const currentScreenshot =
    hasScreenshots && activeMedia.type === 'screenshot' ? cleanScreenshots[activeMedia.index] : null;

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
            {!failedImages[currentScreenshot.path_full] ? (
              <img
                src={currentScreenshot.path_full}
                alt={`${gameTitle} screenshot ${activeMedia.index + 1}`}
                onClick={() => openLightbox(activeMedia.index)}
                onError={() => markImageFailed(currentScreenshot.path_full)}
                className="w-full h-full object-cover cursor-pointer transition-transform duration-500 group-hover:scale-102"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center bg-slate-900 text-slate-500">
                <ImageIcon className="w-12 h-12 text-slate-600 mb-2" />
                <span className="text-sm font-medium text-slate-400">Artwork unavailable</span>
              </div>
            )}

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

      {/* 2. Horizontal Thumbnail Strip: exactly ONE trailer + screenshots */}
      {(hasTrailer || hasScreenshots) && (
        <div
          className="flex items-center gap-3 overflow-x-auto scrollbar-none py-2 px-0.5"
          role="tablist"
          aria-label="Media thumbnails"
        >
          {/* Exactly ONE primary trailer thumbnail */}
          {primaryTrailer && (
            <button
              key={`movie-${primaryTrailer.id || 0}`}
              type="button"
              role="tab"
              aria-selected={activeMedia.type === 'movie'}
              aria-label={`Select trailer: ${primaryTrailer.name}`}
              onClick={() => setActiveMedia({ type: 'movie', index: 0 })}
              className={`relative w-28 sm:w-36 aspect-video rounded-xl overflow-hidden border shrink-0 transition-all ${
                activeMedia.type === 'movie'
                  ? 'border-indigo-500 ring-2 ring-indigo-500/50 scale-102 shadow-lg shadow-indigo-500/20'
                  : 'border-white/10 hover:border-white/30 opacity-70 hover:opacity-100'
              }`}
            >
              {primaryTrailer.thumbnail && !failedImages[`trailer-${primaryTrailer.id}`] ? (
                <img
                  src={primaryTrailer.thumbnail}
                  alt={primaryTrailer.name}
                  onError={() => markImageFailed(`trailer-${primaryTrailer.id}`)}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-slate-900 flex items-center justify-center">
                  <Film className="w-6 h-6 text-slate-500" />
                </div>
              )}
              <div className="absolute inset-0 bg-slate-950/40 flex items-center justify-center">
                <div className="w-6 h-6 rounded-full bg-indigo-600/90 text-white flex items-center justify-center shadow-md">
                  <Play className="w-3 h-3 fill-white ml-0.5" />
                </div>
              </div>
            </button>
          )}

          {/* Screenshot Thumbnails (artwork only) */}
          {cleanScreenshots.map((ss, idx) => {
            const isActive = activeMedia.type === 'screenshot' && activeMedia.index === idx;
            const isFailed = failedImages[`thumb-${ss.path_thumbnail}`];
            return (
              <button
                key={`screenshot-${ss.id}-${idx}`}
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
                {!isFailed ? (
                  <img
                    src={ss.path_thumbnail}
                    alt={`Screenshot thumb ${idx + 1}`}
                    onError={() => markImageFailed(`thumb-${ss.path_thumbnail}`)}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-slate-900 flex items-center justify-center text-slate-600">
                    <ImageIcon className="w-5 h-5" />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* 3. Fullscreen Screenshot Lightbox */}
      <ScreenshotLightbox
        isOpen={isLightboxOpen}
        initialIndex={lightboxIndex}
        screenshots={cleanScreenshots}
        onClose={() => setIsLightboxOpen(false)}
      />
    </section>
  );
}
