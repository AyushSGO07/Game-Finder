'use client';

import React, { useState } from 'react';
import { Star, Calendar, Bookmark, Heart, ExternalLink, ShieldCheck } from 'lucide-react';
import { GameDetail } from '@/types/game';

interface GameHeaderProps {
  game: GameDetail;
  onAddLibrary?: (game: GameDetail) => void;
  onFavorite?: (game: GameDetail) => void;
}

export default function GameHeader({ game, onAddLibrary, onFavorite }: GameHeaderProps) {
  const [isFavorited, setIsFavorited] = useState(false);
  const [isInLibrary, setIsInLibrary] = useState(false);

  const handleFavorite = () => {
    setIsFavorited((prev) => !prev);
    onFavorite?.(game);
  };

  const handleLibrary = () => {
    setIsInLibrary((prev) => !prev);
    onAddLibrary?.(game);
  };

  return (
    <div className="w-full flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-white/10">
      {/* Left: Title, Ratings, Release Date */}
      <div className="flex-1 space-y-3">
        {/* Rating and Verification Badges */}
        <div className="flex flex-wrap items-center gap-2.5">
          {game.rating && (
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs sm:text-sm font-bold bg-amber-500/20 border border-amber-500/40 text-amber-300 shadow-sm backdrop-blur-md">
              <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
              <span>{game.rating.toFixed(1)}</span>
              <span className="text-amber-400/60 font-normal">/ 10</span>
            </span>
          )}

          {game.release_date && (
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs sm:text-sm font-medium bg-slate-900 border border-white/10 text-slate-300">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>{game.release_date}</span>
            </span>
          )}

          <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Verified Title</span>
          </span>
        </div>

        {/* Official Game Title */}
        <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white text-glow leading-tight">
          {game.title}
        </h1>

        {/* Developer Credit Line */}
        {game.developers.length > 0 && (
          <p className="text-sm text-slate-400">
            Developed by{' '}
            <span className="text-slate-200 font-medium">
              {game.developers.join(', ')}
            </span>
            {game.publishers.length > 0 && (
              <>
                {' '}• Published by{' '}
                <span className="text-slate-300">
                  {game.publishers.join(', ')}
                </span>
              </>
            )}
          </p>
        )}
      </div>

      {/* Right: Quick Action CTAs */}
      <div className="flex flex-wrap items-center gap-3 shrink-0">
        <button
          type="button"
          onClick={handleLibrary}
          aria-label={isInLibrary ? 'In Library' : 'Add to Library'}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-400 ${
            isInLibrary
              ? 'bg-emerald-600/30 border border-emerald-500/50 text-emerald-300 shadow-emerald-500/10'
              : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/25 hover:shadow-indigo-600/40'
          }`}
        >
          <Bookmark className={`w-4 h-4 ${isInLibrary ? 'fill-emerald-400' : ''}`} />
          <span>{isInLibrary ? 'In Library' : 'Add to Library'}</span>
        </button>

        <button
          type="button"
          onClick={handleFavorite}
          aria-label={isFavorited ? 'Favorited' : 'Favorite game'}
          className={`p-2.5 rounded-xl border transition-all focus:outline-none focus:ring-2 focus:ring-indigo-400 ${
            isFavorited
              ? 'bg-rose-500/20 border-rose-500/40 text-rose-400'
              : 'bg-slate-900 hover:bg-slate-800 border-white/10 text-slate-300 hover:text-white'
          }`}
        >
          <Heart className={`w-5 h-5 ${isFavorited ? 'fill-rose-500 text-rose-500' : ''}`} />
        </button>

        {game.steam_url && (
          <a
            href={game.steam_url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-white/10 hover:border-indigo-500/30 text-slate-300 hover:text-white font-medium text-sm transition-all focus:outline-none focus:ring-2 focus:ring-indigo-400"
            aria-label={`View ${game.title} on Steam Store`}
          >
            <span>Steam Store</span>
            <ExternalLink className="w-4 h-4 text-slate-400" />
          </a>
        )}
      </div>
    </div>
  );
}
