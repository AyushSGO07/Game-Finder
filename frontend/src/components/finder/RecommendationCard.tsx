'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Sparkles, Bookmark, Check, ArrowUpRight, Star } from 'lucide-react';
import { EnrichedRecommendation } from '@/types/game';

interface RecommendationCardProps {
  recommendation: EnrichedRecommendation;
  index: number;
  onSave?: (rec: EnrichedRecommendation) => void;
}

export default function RecommendationCard({
  recommendation,
  index,
  onSave,
}: RecommendationCardProps) {
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsSaved((prev) => !prev);
    onSave?.(recommendation);
  };

  const imageSrc =
    recommendation.header_image ||
    recommendation.capsule_image ||
    recommendation.hero_image;

  const gameId = recommendation.steam_appid || recommendation.id || index + 1;

  return (
    <article
      className="bg-slate-900/60 backdrop-blur-md border border-white/10 rounded-2xl overflow-hidden hover:border-indigo-500/50 hover:shadow-2xl hover:shadow-indigo-500/10 transition-all duration-300 flex flex-col h-full group"
      aria-label={`Recommendation: ${recommendation.name}`}
    >
      {/* 1. Artwork Header with badges */}
      <div className="aspect-video w-full relative overflow-hidden bg-slate-950">
        {imageSrc ? (
          <Image
            src={imageSrc}
            alt={recommendation.name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            unoptimized
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-indigo-950 via-slate-900 to-slate-950 p-4 text-center">
            <span className="text-sm font-bold text-slate-400 truncate">
              {recommendation.name}
            </span>
          </div>
        )}

        {/* Gradient dark scrim overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-black/40" />

        {/* Top-Left: Match Index Badge */}
        <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-slate-900/80 backdrop-blur-md border border-white/15 text-[11px] font-bold text-cyan-300 flex items-center gap-1 shadow-md">
          <Sparkles className="w-3 h-3 text-cyan-400" />
          <span>#{index + 1} Match</span>
        </div>

        {/* Top-Right: Rating Laurel */}
        {recommendation.rating && (
          <div className="absolute top-3 right-3 px-2 py-0.5 rounded-full bg-amber-500/20 backdrop-blur-md border border-amber-500/30 text-[11px] font-bold text-amber-300 flex items-center gap-1 shadow-md">
            <Star className="w-3 h-3 fill-amber-300" />
            <span>{recommendation.rating}</span>
          </div>
        )}
      </div>

      {/* 2. Card Content Body */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-4">
        <div className="space-y-3">
          {/* Game Title */}
          <h3 className="text-base sm:text-lg font-bold text-white group-hover:text-indigo-300 transition-colors line-clamp-1">
            {recommendation.name}
          </h3>

          {/* Attributes tags cloud */}
          {recommendation.attributes && recommendation.attributes.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {recommendation.attributes.slice(0, 3).map((attr, idx) => (
                <span
                  key={idx}
                  className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-white/5 border border-white/10 text-slate-300 truncate"
                >
                  {attr}
                </span>
              ))}
            </div>
          )}

          {/* AI Match Rationale Box */}
          <div className="bg-indigo-950/40 border border-indigo-500/25 rounded-xl p-3 text-xs leading-relaxed text-indigo-200/90 shadow-inner">
            <div className="flex items-center gap-1.5 text-indigo-300 font-bold mb-1">
              <Sparkles className="w-3 h-3 text-cyan-400" />
              <span>Why this matches:</span>
            </div>
            <p className="line-clamp-3 text-[11px] sm:text-xs text-indigo-100/80">
              {recommendation.match_reason}
            </p>
          </div>
        </div>

        {/* 3. Action Buttons Row */}
        <div className="flex items-center gap-2 pt-3 border-t border-white/10">
          {/* Quick-Save Library Button */}
          <button
            type="button"
            onClick={handleSave}
            aria-label={isSaved ? 'Saved to library' : 'Save to Library'}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-1.5 border ${
              isSaved
                ? 'bg-emerald-600/20 border-emerald-500/50 text-emerald-300'
                : 'bg-slate-800/80 hover:bg-slate-700/80 border-white/10 text-slate-300 hover:text-white'
            }`}
          >
            {isSaved ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span>Saved</span>
              </>
            ) : (
              <>
                <Bookmark className="w-3.5 h-3.5 text-slate-400" />
                <span>Save to Library</span>
              </>
            )}
          </button>

          {/* Explore Details CTA */}
          <Link
            href={`/games/${gameId}`}
            className="py-2 px-3.5 rounded-xl bg-indigo-600/20 hover:bg-indigo-600 border border-indigo-500/40 hover:border-indigo-500 text-indigo-300 hover:text-white text-xs font-semibold transition-all flex items-center justify-center gap-1 group/link"
            aria-label="Explore Details"
          >
            <span>Explore Details</span>
            <ArrowUpRight className="w-3.5 h-3.5 group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5 transition-transform" />
          </Link>
        </div>
      </div>
    </article>
  );
}
