'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Trophy,
  ExternalLink,
  Calendar,
  Building2,
  Gamepad2,
  Sparkles,
} from 'lucide-react';
import { GotyWinner } from '@/types/game';
import ShelfSelector from '@/components/library/ShelfSelector';

export interface GotyWinnerCardProps {
  winner: GotyWinner;
  year: number;
  awardName?: string;
  className?: string;
}

export default function GotyWinnerCard({
  winner,
  year,
  awardName = 'Game of the Year',
  className = '',
}: GotyWinnerCardProps) {
  const [imageError, setImageError] = useState(false);

  const displayImage =
    (!imageError && (winner.hero_image || winner.cover_url)) ||
    'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1200&q=80';

  const steamLink =
    winner.steam_url ||
    (winner.steam_appid
      ? `https://store.steampowered.com/app/${winner.steam_appid}/`
      : undefined);

  return (
    <div
      data-testid="goty-winner-card"
      className={`relative w-full rounded-3xl overflow-hidden border border-amber-500/30 bg-gradient-to-b from-slate-900/90 to-slate-950/95 shadow-2xl shadow-amber-500/10 backdrop-blur-xl transition-all ${className}`}
    >
      {/* Background Panoramic Backdrop */}
      <div className="absolute inset-0 h-64 sm:h-96 w-full overflow-hidden opacity-30 select-none pointer-events-none">
        <Image
          src={displayImage}
          alt={winner.title}
          fill
          className="object-cover object-center filter blur-sm scale-105"
          onError={() => setImageError(true)}
          unoptimized
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/70 to-transparent" />
      </div>

      <div className="relative p-6 sm:p-10 space-y-6">
        {/* Top Ribbon / Award Laurel Badge */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-amber-500/20 via-amber-400/10 to-transparent border border-amber-400/40 text-amber-300 font-bold text-xs sm:text-sm shadow-md shadow-amber-500/10">
            <Trophy className="w-4 h-4 text-amber-400 animate-pulse" />
            <span>
              {year} {awardName} Winner
            </span>
          </div>

          {/* Quick Shelf Action */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-medium hidden sm:inline">Add to Shelf:</span>
            <ShelfSelector
              game={{
                id: winner.game_id,
                title: winner.title,
                capsule_image: winner.cover_url,
                slug: winner.slug,
              }}
              size="sm"
            />
          </div>
        </div>

        {/* Hero Content Grid: Poster + Narrative */}
        <div className="flex flex-col md:flex-row gap-6 sm:gap-8 items-start">
          {/* Cover Art Capsule */}
          <div className="relative w-full sm:w-64 aspect-[16/10] sm:aspect-[3/4] rounded-2xl overflow-hidden bg-slate-800 border border-white/10 shrink-0 shadow-xl group">
            <Image
              src={displayImage}
              alt={winner.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
              onError={() => setImageError(true)}
              unoptimized
            />
          </div>

          {/* Details & Rationale */}
          <div className="flex-1 space-y-4">
            <div className="space-y-2">
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
                {winner.title}
              </h2>

              {/* Developer, Publisher, Release Date */}
              <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm text-slate-400">
                {winner.developer && (
                  <div className="flex items-center gap-1.5">
                    <Building2 className="w-4 h-4 text-slate-500" />
                    <span>{winner.developer}</span>
                  </div>
                )}
                {winner.release_date && (
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-slate-500" />
                    <span>{winner.release_date}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Genre Badges */}
            {winner.genres && winner.genres.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {winner.genres.map((g) => (
                  <span
                    key={g}
                    className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-white/5 border border-white/10 text-slate-300"
                  >
                    {g}
                  </span>
                ))}
              </div>
            )}

            {/* Description */}
            {winner.description && (
              <p className="text-sm text-slate-300 leading-relaxed max-w-3xl">
                {winner.description}
              </p>
            )}

            {/* Award Rationale / Legacy Quote */}
            {winner.award_rationale && (
              <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 max-w-3xl">
                <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400 mb-1">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Why It Won</span>
                </div>
                <p className="text-sm italic text-amber-100/90 leading-relaxed">
                  &ldquo;{winner.award_rationale}&rdquo;
                </p>
              </div>
            )}

            {/* Actions Bar */}
            <div className="pt-2 flex flex-wrap items-center gap-3">
              <Link
                href={`/games/${winner.game_id}`}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs sm:text-sm transition-all shadow-md shadow-amber-500/20 active:scale-95"
              >
                <Gamepad2 className="w-4 h-4" />
                <span>View Full Details</span>
              </Link>

              {steamLink && (
                <a
                  href={steamLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-white/10 text-slate-200 font-semibold text-xs sm:text-sm transition-all"
                >
                  <ExternalLink className="w-4 h-4 text-slate-400" />
                  <span>Steam Store</span>
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
