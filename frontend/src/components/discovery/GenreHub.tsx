'use client';

import React from 'react';
import Link from 'next/link';
import {
  Swords,
  Sparkles,
  Compass,
  Crosshair,
  Skull,
  Brain,
  Cpu,
  Flame,
  Trophy,
  Gem,
  Puzzle,
  Gamepad2,
  LucideIcon,
  ArrowRight,
} from 'lucide-react';
import { GenreTile } from '@/types/game';

interface GenreHubProps {
  genres: GenreTile[];
}

const ICON_MAP: Record<string, LucideIcon> = {
  Swords,
  Sparkles,
  Compass,
  Crosshair,
  Skull,
  Brain,
  Cpu,
  Flame,
  Trophy,
  Gem,
  Puzzle,
  Gamepad2,
};

export default function GenreHub({ genres }: GenreHubProps) {
  return (
    <section
      role="region"
      aria-label="Genre Hub"
      className="w-full flex flex-col gap-5 select-none"
    >
      {/* Header */}
      <div className="flex items-end justify-between px-1">
        <div className="flex items-center gap-3">
          <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-glow-cyan" />
          <div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
              Browse by Genre
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
              Explore games tailored to your favorite playstyles
            </p>
          </div>
        </div>

        <Link
          href="/finder"
          className="flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-cyan-400 hover:text-cyan-300 transition-colors group"
        >
          <span>All Categories</span>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>

      {/* 12-Tile Category Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
        {genres.map((genre) => {
          const IconComponent = ICON_MAP[genre.iconName] || Gamepad2;

          return (
            <Link
              key={genre.id}
              href={`/finder?genre=${encodeURIComponent(genre.slug)}`}
              className="relative group rounded-2xl p-4 bg-slate-900/60 border border-white/5 hover:border-indigo-500/50 hover:shadow-xl hover:shadow-indigo-500/10 transition-all duration-300 hover:-translate-y-1.5 overflow-hidden flex flex-col justify-between min-h-[140px] backdrop-blur-sm"
              aria-label={`Genre: ${genre.name}`}
            >
              {/* Subtle Thematic Gradient Background */}
              <div
                className={`absolute inset-0 bg-gradient-to-br ${genre.gradient} opacity-40 group-hover:opacity-75 transition-opacity duration-300 pointer-events-none`}
              />

              {/* Upper Icon Container */}
              <div className="relative z-10 flex items-center justify-between">
                <div
                  className="w-10 h-10 rounded-xl bg-slate-900/90 border border-white/10 flex items-center justify-center text-slate-200 group-hover:text-white group-hover:scale-110 transition-all shadow-md"
                  style={{ color: genre.accentColor }}
                >
                  <IconComponent className="w-5 h-5" />
                </div>
              </div>

              {/* Bottom Label & Description */}
              <div className="relative z-10 mt-3">
                <h3 className="font-bold text-sm sm:text-base text-slate-100 group-hover:text-white transition-colors">
                  {genre.name}
                </h3>
                <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5 group-hover:text-slate-300 transition-colors">
                  {genre.description}
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
