'use client';

import React from 'react';
import Image from 'next/image';
import { Star, MessageSquare, User, Calendar } from 'lucide-react';
import { GameReview } from '@/types/game';
import MarkdownRenderer from './MarkdownRenderer';

export interface ReviewListProps {
  reviews: GameReview[];
  className?: string;
}

export default function ReviewList({ reviews, className = '' }: ReviewListProps) {
  const count = reviews.length;
  const avgRating =
    count > 0
      ? (reviews.reduce((acc, r) => acc + (r.rating || 0), 0) / count).toFixed(1)
      : null;

  return (
    <div className={`space-y-6 ${className}`}>
      {/* 1. Header Banner & Aggregate Summary */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-5 rounded-2xl bg-slate-900/60 border border-white/10 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Community Reviews</h3>
            <p className="text-xs text-slate-400">
              {count} {count === 1 ? 'review' : 'reviews'} from Game Finder players
            </p>
          </div>
        </div>

        {avgRating && (
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 font-bold text-sm">
            <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
            <span>{avgRating} / 10 Average Score</span>
          </div>
        )}
      </div>

      {/* 2. Reviews Feed or Empty State */}
      {count > 0 ? (
        <div className="space-y-4">
          {reviews.map((rev) => {
            const avatar =
              rev.avatar_url ||
              `https://ui-avatars.com/api/?name=${encodeURIComponent(
                rev.username || 'Gamer'
              )}&background=1e293b&color=cbd5e1`;

            const formattedDate = rev.created_at
              ? new Date(rev.created_at).toLocaleDateString(undefined, {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                })
              : 'Recently';

            return (
              <article
                key={rev.id}
                className="p-5 sm:p-6 rounded-2xl bg-slate-900/60 border border-white/5 backdrop-blur-md space-y-3.5 hover:border-white/10 transition-colors"
                aria-label={`Review by ${rev.username || 'Gamer'}`}
              >
                {/* Author Info & Rating Row */}
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="relative w-9 h-9 rounded-full overflow-hidden bg-slate-800 border border-white/10 shrink-0">
                      <Image
                        src={avatar}
                        alt={rev.username || 'Reviewer avatar'}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white">
                        {rev.username || 'Gamer'}
                      </p>
                      <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                        <Calendar className="w-3 h-3 text-slate-500" />
                        <span>{formattedDate}</span>
                      </div>
                    </div>
                  </div>

                  {/* Rating Pill */}
                  <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/25 text-amber-300 text-xs font-bold">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    <span>{rev.rating} / 10</span>
                  </div>
                </div>

                {/* Review Title */}
                {rev.title && (
                  <h4 className="text-base font-bold text-white tracking-tight">
                    {rev.title}
                  </h4>
                )}

                {/* Markdown Review Body */}
                <div className="pt-1 border-t border-white/5">
                  <MarkdownRenderer content={rev.body} />
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <div className="p-8 rounded-2xl bg-slate-900/40 border border-white/5 text-center space-y-2">
          <p className="text-sm font-medium text-slate-300">No community reviews yet.</p>
          <p className="text-xs text-slate-500">
            Be the first player to share your rating and review for this game!
          </p>
        </div>
      )}
    </div>
  );
}
