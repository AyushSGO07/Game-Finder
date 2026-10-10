'use client';

import React, { useRef } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import { GameCard as GameCardType, ShelfCategory } from '@/types/game';
import GameCard from './GameCard';

interface GameShelfProps {
  title: string;
  subtitle?: string;
  games: GameCardType[];
  category?: ShelfCategory;
  viewAllHref?: string;
  onGameClick?: (game: GameCardType) => void;
  accentDotColor?: string;
}

export default function GameShelf({
  title,
  subtitle,
  games,
  category,
  viewAllHref,
  onGameClick,
  accentDotColor = 'bg-indigo-500',
}: GameShelfProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scrollLeft = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: -580, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: 580, behavior: 'smooth' });
    }
  };

  const targetHref = viewAllHref || (category ? `/games?category=${category}` : '/games');

  return (
    <section
      role="region"
      aria-label={`Game shelf: ${title}`}
      className="w-full flex flex-col gap-4 select-none"
    >
      {/* Shelf Header */}
      <div className="flex items-end justify-between px-1">
        <div className="flex items-center gap-3">
          <span className={`w-2.5 h-2.5 rounded-full ${accentDotColor} shadow-glow`} />
          <div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
              {title}
            </h2>
            {subtitle && (
              <p className="text-xs sm:text-sm text-slate-400 mt-0.5">{subtitle}</p>
            )}
          </div>
        </div>

        {/* Action Controls: View All + Prev/Next Chevrons */}
        <div className="flex items-center gap-3">
          <Link
            href={targetHref}
            className="flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-indigo-400 hover:text-indigo-300 transition-colors group"
          >
            <span>View All</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>

          <div className="hidden sm:flex items-center gap-1.5 ml-2">
            <button
              type="button"
              onClick={scrollLeft}
              aria-label={`Scroll left on ${title}`}
              className="w-8 h-8 rounded-lg bg-slate-900 border border-white/10 hover:border-indigo-500/40 text-slate-300 hover:text-white flex items-center justify-center transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={scrollRight}
              aria-label={`Scroll right on ${title}`}
              className="w-8 h-8 rounded-lg bg-slate-900 border border-white/10 hover:border-indigo-500/40 text-slate-300 hover:text-white flex items-center justify-center transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Horizontal Carousel Shelf Container */}
      <div
        ref={scrollRef}
        className="flex gap-4 sm:gap-5 overflow-x-auto scrollbar-none snap-x snap-mandatory pb-3 pt-1 px-1 focus:outline-none"
        tabIndex={0}
      >
        {games.map((game) => (
          <GameCard
            key={game.id}
            game={game}
            onClick={onGameClick}
          />
        ))}

        {(!games || games.length === 0) && (
          <div className="w-full py-12 rounded-xl bg-slate-900/40 border border-white/5 flex items-center justify-center text-slate-500 text-sm">
            No games currently listed in this category.
          </div>
        )}
      </div>
    </section>
  );
}
