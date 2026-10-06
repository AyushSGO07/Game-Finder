'use client';

import React from 'react';
import {
  Gamepad2,
  Sword,
  Compass,
  Crosshair,
  Skull,
  Brain,
  Cpu,
  Car,
  Trophy,
  Sparkles,
  Layers,
  Smile,
} from 'lucide-react';
import { ALLOWED_GENRES, MOOD_OPTIONS } from '@/types/game';

interface GenreMoodSelectorProps {
  selectedGenre: string;
  selectedMood: string;
  onSelectGenre: (genre: string) => void;
  onSelectMood: (mood: string) => void;
}

const GENRE_ICONS: Record<string, React.ElementType> = {
  Action: Sword,
  RPG: Sparkles,
  Adventure: Compass,
  Shooter: Crosshair,
  Horror: Skull,
  Strategy: Brain,
  Simulation: Cpu,
  Racing: Car,
  Sports: Trophy,
  Indie: Gamepad2,
  Puzzle: Layers,
  Platformer: Smile,
};

export default function GenreMoodSelector({
  selectedGenre,
  selectedMood,
  onSelectGenre,
  onSelectMood,
}: GenreMoodSelectorProps) {
  // Exclude 'Any' from the initial quick list for focused curated discovery
  const primaryGenres = ALLOWED_GENRES.filter((g) => g !== 'Any');

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* 1. Primary Genre Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-sm font-bold uppercase tracking-wider text-slate-300">
            Primary Genre <span className="text-rose-400">*</span>
          </label>
          <span className="text-xs text-slate-400">Select one primary genre</span>
        </div>

        <div
          className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5"
          role="group"
          aria-label="Genre Options"
        >
          {primaryGenres.map((genre) => {
            const Icon = GENRE_ICONS[genre] || Gamepad2;
            const isSelected = selectedGenre === genre;

            return (
              <button
                key={genre}
                type="button"
                onClick={() => onSelectGenre(genre)}
                aria-pressed={isSelected}
                className={`flex items-center gap-3 p-3.5 rounded-xl border text-left transition-all duration-200 group relative ${
                  isSelected
                    ? 'bg-indigo-600/20 border-indigo-500 text-white shadow-lg shadow-indigo-600/20 ring-2 ring-indigo-500/50'
                    : 'bg-slate-900/60 border-white/10 text-slate-300 hover:border-white/20 hover:bg-slate-800/60 hover:text-white'
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                    isSelected
                      ? 'bg-indigo-500 text-white'
                      : 'bg-white/5 text-slate-400 group-hover:text-indigo-400'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <span className="text-sm font-semibold truncate">{genre}</span>
                {isSelected && (
                  <span className="absolute right-3 top-3 w-2 h-2 rounded-full bg-indigo-400 animate-ping" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Mood & Vibe Atmosphere */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-sm font-bold uppercase tracking-wider text-slate-300">
            Mood & Atmosphere <span className="text-xs font-normal text-slate-500">(Optional)</span>
          </label>
          <span className="text-xs text-slate-400">What tone are you craving?</span>
        </div>

        <div
          className="flex flex-wrap gap-2"
          role="group"
          aria-label="Mood Atmosphere Options"
        >
          {MOOD_OPTIONS.map((mood) => {
            const isSelected = selectedMood === mood;

            return (
              <button
                key={mood}
                type="button"
                onClick={() => onSelectMood(isSelected ? '' : mood)}
                aria-pressed={isSelected}
                className={`px-4 py-2 rounded-full text-xs font-medium border transition-all duration-200 ${
                  isSelected
                    ? 'bg-cyan-500/20 border-cyan-400 text-cyan-200 shadow-md shadow-cyan-500/20 ring-1 ring-cyan-400/40'
                    : 'bg-slate-900/60 border-white/10 text-slate-400 hover:border-white/20 hover:text-slate-200 hover:bg-slate-800/40'
                }`}
              >
                {mood}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
