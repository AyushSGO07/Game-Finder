'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Clock, Heart, Star, Trash2, ArrowUpRight, Check } from 'lucide-react';
import { ShelfStatus, UserLibraryItem } from '@/types/game';
import ShelfSelector from './ShelfSelector';
import { useLibrary } from '@/context/LibraryContext';

export interface LibraryGameCardProps {
  item: UserLibraryItem;
  onStatusChange?: (status: ShelfStatus | null) => void;
  onFavoriteToggle?: () => void;
  onPlaytimeChange?: (hours: number) => void;
  onDelete?: () => void;
}

export default function LibraryGameCard({
  item,
  onStatusChange,
  onFavoriteToggle,
  onPlaytimeChange,
  onDelete,
}: LibraryGameCardProps) {
  const { toggleFavorite, updatePlaytime, removeGame } = useLibrary();
  const [isEditingHours, setIsEditingHours] = useState(false);
  const [hoursInput, setHoursInput] = useState(String(item.playtime_hours || 0));

  const handleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onFavoriteToggle?.();
    await toggleFavorite(item.game_id);
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (confirm(`Remove "${item.game_title}" from your library?`)) {
      onDelete?.();
      await removeGame(item.game_id);
    }
  };

  const handleSaveHours = async () => {
    setIsEditingHours(false);
    const parsed = parseFloat(hoursInput);
    if (!isNaN(parsed) && parsed >= 0) {
      onPlaytimeChange?.(parsed);
      await updatePlaytime(item.game_id, parsed);
    } else {
      setHoursInput(String(item.playtime_hours || 0));
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSaveHours();
    } else if (e.key === 'Escape') {
      setIsEditingHours(false);
      setHoursInput(String(item.playtime_hours || 0));
    }
  };

  const gameData = {
    id: item.game_id,
    title: item.game_title,
    capsule_image: item.game_cover_url,
    slug: item.game_slug,
  };

  return (
    <article
      className="group bg-slate-900/60 border border-white/10 hover:border-indigo-500/40 rounded-2xl overflow-hidden backdrop-blur-md transition-all duration-300 flex flex-col justify-between shadow-lg hover:shadow-indigo-500/10"
      aria-label={`Library item: ${item.game_title}`}
    >
      {/* 1. Artwork Thumbnail */}
      <div className="relative aspect-video w-full bg-slate-950 overflow-hidden">
        {item.game_cover_url ? (
          <Image
            src={item.game_cover_url}
            alt={item.game_title || 'Game artwork'}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            unoptimized
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-slate-800 text-slate-500 text-xs">
            No Artwork
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-black/30" />

        {/* Top-Right Favorite Button */}
        <button
          type="button"
          onClick={handleFavorite}
          aria-label={item.is_favorite ? 'Remove from favorites' : 'Add to favorites'}
          className={`absolute top-2.5 right-2.5 p-2 rounded-xl backdrop-blur-md border transition-all ${
            item.is_favorite
              ? 'bg-rose-500/20 border-rose-500/50 text-rose-400'
              : 'bg-slate-900/80 border-white/10 text-slate-400 hover:text-white'
          }`}
        >
          <Heart className={`w-4 h-4 ${item.is_favorite ? 'fill-rose-500' : ''}`} />
        </button>

        {/* Personal Rating Badge (if set) */}
        {item.personal_rating && (
          <div className="absolute top-2.5 left-2.5 px-2.5 py-1 rounded-full bg-amber-500/20 backdrop-blur-md border border-amber-500/40 text-[11px] font-bold text-amber-300 flex items-center gap-1 shadow-md">
            <Star className="w-3 h-3 fill-amber-300" />
            <span>{item.personal_rating}/10</span>
          </div>
        )}
      </div>

      {/* 2. Content Body */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-4">
        <div className="space-y-2">
          {/* Title & Detail Link */}
          <Link
            href={`/games/${item.game_id}`}
            className="group/title flex items-start justify-between gap-2"
          >
            <h3 className="text-base sm:text-lg font-bold text-white group-hover/title:text-indigo-300 transition-colors line-clamp-1">
              {item.game_title}
            </h3>
            <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover/title:text-indigo-400 transition-colors shrink-0 mt-1" />
          </Link>

          {/* Playtime Display & Editor */}
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Clock className="w-3.5 h-3.5 text-slate-500" />
            {isEditingHours ? (
              <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                <input
                  type="number"
                  step="0.5"
                  min="0"
                  value={hoursInput}
                  onChange={(e) => setHoursInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  onBlur={handleSaveHours}
                  autoFocus
                  className="w-16 px-1.5 py-0.5 rounded bg-slate-800 border border-indigo-500 text-white text-xs focus:outline-none"
                  aria-label="Edit playtime hours"
                />
                <button
                  type="button"
                  onClick={handleSaveHours}
                  className="p-1 text-emerald-400 hover:text-emerald-300"
                  aria-label="Save playtime"
                >
                  <Check className="w-3 h-3" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setIsEditingHours(true)}
                className="hover:text-indigo-300 transition-colors underline decoration-dotted"
                title="Click to edit playtime"
              >
                {item.playtime_hours > 0 ? `${item.playtime_hours} hrs played` : 'No playtime logged'}
              </button>
            )}
          </div>
        </div>

        {/* 3. Bottom Controls Row */}
        <div className="pt-3 border-t border-white/5 flex items-center justify-between gap-2">
          {/* Shelf Selector Dropdown */}
          <ShelfSelector
            game={gameData}
            currentStatus={item.status}
            onStatusChange={onStatusChange}
            size="sm"
          />

          {/* Delete Button */}
          <button
            type="button"
            onClick={handleDelete}
            aria-label={`Remove ${item.game_title} from library`}
            className="p-2 rounded-xl text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 transition-all focus:outline-none focus:ring-2 focus:ring-rose-500/40"
            title="Remove from library"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </article>
  );
}
