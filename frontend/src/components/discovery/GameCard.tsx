'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Star, Gamepad2 } from 'lucide-react';
import { GameCard as GameCardType } from '@/types/game';

interface GameCardProps {
  game: GameCardType;
  onClick?: (game: GameCardType) => void;
}

export default function GameCard({ game, onClick }: GameCardProps) {
  const [imageError, setImageError] = useState(false);

  const displayImage = !imageError && (game.capsule_image || game.header_image);

  return (
    <article
      onClick={() => onClick?.(game)}
      className="w-[250px] sm:w-[280px] shrink-0 snap-start rounded-2xl bg-slate-900/60 border border-white/5 overflow-hidden hover:border-indigo-500/50 hover:shadow-xl hover:shadow-indigo-500/10 transition-all duration-300 hover:-translate-y-1.5 cursor-pointer flex flex-col group backdrop-blur-sm"
      aria-label={`Game card: ${game.title}`}
    >
      {/* 16:9 Artwork Capsule Container */}
      <div className="relative aspect-[16/9] w-full bg-slate-950 overflow-hidden">
        {displayImage ? (
          <img
            src={displayImage}
            alt={game.title}
            onError={() => setImageError(true)}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 to-indigo-950/40 text-slate-500">
            <Gamepad2 className="w-8 h-8 text-indigo-400/60 mb-1" />
            <span className="text-xs font-medium text-slate-400">Artwork Pending</span>
          </div>
        )}

        {/* Top-right rating badge */}
        {game.rating && (
          <div className="absolute top-2.5 right-2.5 flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-950/80 border border-amber-500/30 text-amber-300 text-xs font-bold backdrop-blur-md shadow-sm">
            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
            <span>{game.rating.toFixed(1)}</span>
          </div>
        )}

        {/* Price tag in bottom-right if present */}
        {game.price && (
          <div className="absolute bottom-2.5 right-2.5 px-2 py-0.5 rounded-md bg-slate-950/90 text-[11px] font-semibold text-slate-200 border border-white/10 backdrop-blur-md">
            {game.price}
          </div>
        )}
      </div>

      {/* Card Info Details */}
      <div className="p-3.5 flex flex-col flex-1 justify-between gap-2">
        <div>
          <h3 className="font-bold text-sm sm:text-base text-slate-100 group-hover:text-indigo-300 transition-colors truncate">
            {game.title}
          </h3>

          {/* Genre Badges */}
          <div className="flex flex-wrap gap-1 mt-1.5">
            {game.genres.slice(0, 2).map((genre) => (
              <span
                key={genre}
                className="text-[11px] px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-white/5"
              >
                {genre}
              </span>
            ))}
          </div>
        </div>

        {/* Footer: Developer / Release date */}
        <div className="flex items-center justify-between text-xs text-slate-500 pt-1 border-t border-white/5">
          <span className="truncate max-w-[150px]">
            {game.developer || 'Featured Game'}
          </span>
          {game.release_date && (
            <span className="shrink-0 text-[11px]">{game.release_date}</span>
          )}
        </div>
      </div>
    </article>
  );
}
