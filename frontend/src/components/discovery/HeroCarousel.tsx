'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, Star, Bookmark, ExternalLink } from 'lucide-react';
import { HeroSlide } from '@/types/game';

interface HeroCarouselProps {
  slides: HeroSlide[];
  onExplore?: (slide: HeroSlide) => void;
  onFavorite?: (slide: HeroSlide) => void;
  autoPlayInterval?: number;
}

export default function HeroCarousel({
  slides,
  onExplore,
  onFavorite,
  autoPlayInterval = 5000,
}: HeroCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isFavorited, setIsFavorited] = useState<Record<string, boolean>>({});

  const count = slides.length;

  const nextSlide = useCallback(() => {
    if (count <= 1) return;
    setCurrentIndex((prev) => (prev + 1) % count);
  }, [count]);

  const prevSlide = useCallback(() => {
    if (count <= 1) return;
    setCurrentIndex((prev) => (prev - 1 + count) % count);
  }, [count]);

  // Auto-play interval timer
  useEffect(() => {
    if (count <= 1 || isPaused) return;

    const timer = setInterval(() => {
      nextSlide();
    }, autoPlayInterval);

    return () => clearInterval(timer);
  }, [count, isPaused, autoPlayInterval, nextSlide]);

  if (!slides || slides.length === 0) {
    return (
      <div className="w-full h-96 rounded-2xl bg-slate-900 flex items-center justify-center text-slate-500">
        No featured titles available.
      </div>
    );
  }

  const current = slides[currentIndex];

  const handleFavoriteClick = () => {
    setIsFavorited((prev) => ({
      ...prev,
      [current.id]: !prev[current.id],
    }));
    onFavorite?.(current);
  };

  return (
    <section
      role="region"
      aria-roledescription="carousel"
      aria-label="Featured Games Carousel"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocus={() => setIsPaused(true)}
      onBlur={() => setIsPaused(false)}
      className="relative w-full min-h-[460px] md:h-[540px] rounded-3xl overflow-hidden shadow-2xl border border-white/10 select-none group"
    >
      {/* Background Backdrop Artwork with Multi-directional Gradients */}
      <div className="absolute inset-0">
        <img
          src={current.backdrop_url}
          alt={current.title}
          className="w-full h-full object-cover object-top transition-transform duration-700 ease-out transform group-hover:scale-105"
        />

        {/* Left-to-right gradient for text contrast */}
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/70 to-transparent w-full md:w-3/4" />

        {/* Bottom vignette to blend into page canvas */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
      </div>

      {/* Content Overlay */}
      <div className="relative z-10 h-full flex flex-col justify-end p-6 sm:p-10 md:p-14 max-w-3xl">
        {/* Rating and Genre Pills */}
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 border border-amber-500/40 text-amber-300 shadow-sm backdrop-blur-md">
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            <span>{current.rating.toFixed(1)}</span>
          </span>

          {current.genres.map((genre) => (
            <span
              key={genre}
              className="px-3 py-1 rounded-full text-xs font-medium bg-slate-900/80 border border-white/10 text-slate-300 backdrop-blur-md"
            >
              {genre}
            </span>
          ))}

          {current.release_date && (
            <span className="text-xs text-slate-400 ml-1">
              {current.release_date}
            </span>
          )}
        </div>

        {/* Game Title */}
        <h2 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white mb-3 text-glow leading-tight">
          {current.title}
        </h2>

        {/* Game Synopsis */}
        <p className="text-sm sm:text-base text-slate-300 line-clamp-2 max-w-2xl mb-6 leading-relaxed">
          {current.synopsis}
        </p>

        {/* Action CTAs */}
        <div className="flex flex-wrap items-center gap-3">
          <Link
            href={current.store_url || `/games/${current.steam_appid || current.id}`}
            onClick={() => onExplore?.(current)}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm sm:text-base shadow-xl shadow-indigo-600/30 hover:shadow-indigo-600/50 transition-all focus:outline-none focus:ring-2 focus:ring-indigo-400"
          >
            <span>Explore Game</span>
            <ExternalLink className="w-4 h-4" />
          </Link>

          <button
            type="button"
            onClick={handleFavoriteClick}
            aria-label={isFavorited[current.id] ? 'Remove from favorites' : 'Add to favorites'}
            className={`flex items-center gap-2 px-5 py-3 rounded-xl border text-sm sm:text-base font-medium backdrop-blur-md transition-all focus:outline-none focus:ring-2 focus:ring-indigo-400 ${
              isFavorited[current.id]
                ? 'bg-amber-500/20 border-amber-500/40 text-amber-300'
                : 'bg-white/10 hover:bg-white/20 border-white/15 text-slate-200'
            }`}
          >
            <Bookmark className={`w-4 h-4 ${isFavorited[current.id] ? 'fill-amber-400' : ''}`} />
            <span>{isFavorited[current.id] ? 'Saved' : 'Add to Favorites'}</span>
          </button>
        </div>
      </div>

      {/* Manual Chevron Arrows */}
      <button
        type="button"
        onClick={prevSlide}
        aria-label="Previous slide"
        className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-slate-950/60 hover:bg-indigo-600 border border-white/10 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all backdrop-blur-md focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>

      <button
        type="button"
        onClick={nextSlide}
        aria-label="Next slide"
        className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-slate-950/60 hover:bg-indigo-600 border border-white/10 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all backdrop-blur-md focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
      >
        <ChevronRight className="w-6 h-6" />
      </button>

      {/* Slide Pagination Pill Indicators */}
      <div className="absolute bottom-6 right-6 z-20 flex items-center gap-2 bg-slate-950/60 px-3 py-1.5 rounded-full border border-white/10 backdrop-blur-md">
        {slides.map((slide, idx) => {
          const isActive = idx === currentIndex;
          return (
            <button
              key={slide.id}
              type="button"
              onClick={() => setCurrentIndex(idx)}
              aria-label={`Jump to slide ${idx + 1}: ${slide.title}`}
              className={`h-2 rounded-full transition-all duration-300 ${
                isActive ? 'w-6 bg-indigo-500 shadow-glow' : 'w-2 bg-white/30 hover:bg-white/60'
              }`}
            />
          );
        })}
      </div>
    </section>
  );
}
