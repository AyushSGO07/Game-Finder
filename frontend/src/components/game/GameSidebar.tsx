'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Gamepad2,
  Calendar,
  Building,
  Globe,
  ExternalLink,
  Monitor,
  Apple,
  Terminal,
} from 'lucide-react';
import { GameDetail } from '@/types/game';

interface GameSidebarProps {
  game: GameDetail;
}

export default function GameSidebar({ game }: GameSidebarProps) {
  const [imageError, setImageError] = useState(false);

  const displayCover = !imageError && (game.capsule_image || game.header_image);

  const renderPlatformIcon = (platform: string) => {
    const p = platform.toLowerCase();
    if (p.includes('win') || p.includes('pc')) return <Monitor className="w-3.5 h-3.5" />;
    if (p.includes('mac') || p.includes('apple')) return <Apple className="w-3.5 h-3.5" />;
    if (p.includes('linux')) return <Terminal className="w-3.5 h-3.5" />;
    return <Gamepad2 className="w-3.5 h-3.5" />;
  };

  return (
    <aside
      aria-label="Game Metadata Sidebar"
      className="w-full flex flex-col gap-6 select-none"
    >
      {/* 1. Capsule Poster Container */}
      <div className="w-full aspect-[16/9] sm:aspect-[4/3] rounded-2xl overflow-hidden bg-slate-950 border border-white/10 shadow-xl relative group">
        {displayCover ? (
          <img
            src={displayCover}
            alt={`${game.title} cover`}
            onError={() => setImageError(true)}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-slate-900 text-slate-500">
            <Gamepad2 className="w-10 h-10 text-indigo-400/50 mb-2" />
            <span className="text-xs">No Cover Artwork</span>
          </div>
        )}

        {game.price && (
          <div className="absolute bottom-3 right-3 px-3 py-1 rounded-lg bg-slate-950/90 text-xs font-bold text-white border border-white/15 backdrop-blur-md shadow-lg">
            {game.price}
          </div>
        )}
      </div>

      {/* 2. Metadata Specification Card */}
      <div className="rounded-2xl p-5 bg-slate-900/60 border border-white/5 backdrop-blur-md space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-white/5 pb-2">
          Game Details
        </h3>

        {/* Developers */}
        <div>
          <span className="text-xs text-slate-500 block mb-1">Developer</span>
          <div className="flex flex-wrap gap-1.5">
            {game.developers.map((dev) => (
              <span
                key={dev}
                className="text-xs font-medium text-slate-200 bg-slate-800/80 px-2.5 py-1 rounded-md border border-white/5"
              >
                {dev}
              </span>
            ))}
          </div>
        </div>

        {/* Publishers */}
        {game.publishers.length > 0 && (
          <div>
            <span className="text-xs text-slate-500 block mb-1">Publisher</span>
            <div className="flex flex-wrap gap-1.5">
              {game.publishers.map((pub) => (
                <span
                  key={pub}
                  className="text-xs text-slate-300 bg-slate-800/50 px-2 py-0.5 rounded-md"
                >
                  {pub}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Release Date */}
        {game.release_date && (
          <div>
            <span className="text-xs text-slate-500 block mb-1">Release Date</span>
            <div className="flex items-center gap-1.5 text-xs text-slate-200 font-medium">
              <Calendar className="w-3.5 h-3.5 text-indigo-400" />
              <span>{game.release_date}</span>
            </div>
          </div>
        )}

        {/* Supported Platforms */}
        {game.platforms && game.platforms.length > 0 && (
          <div>
            <span className="text-xs text-slate-500 block mb-1.5">Platforms</span>
            <div className="flex flex-wrap gap-1.5">
              {game.platforms.map((plat) => (
                <span
                  key={plat}
                  className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-300 bg-slate-800/80 px-2.5 py-1 rounded-md border border-white/5"
                >
                  {renderPlatformIcon(plat)}
                  <span>{plat}</span>
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 3. Genres & Tags Card */}
      <div className="rounded-2xl p-5 bg-slate-900/60 border border-white/5 backdrop-blur-md space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-white/5 pb-2">
          Genres & Categories
        </h3>
        <div className="flex flex-wrap gap-1.5">
          {game.genres.map((genre) => (
            <Link
              key={genre}
              href={`/discover?genre=${encodeURIComponent(genre.toLowerCase())}`}
              className="text-xs font-medium text-cyan-300 bg-cyan-950/40 hover:bg-cyan-900/50 px-2.5 py-1 rounded-lg border border-cyan-800/30 hover:border-cyan-500/50 transition-colors"
            >
              {genre}
            </Link>
          ))}
        </div>
      </div>

      {/* 4. External Store & Official Links */}
      <div className="space-y-2">
        {game.steam_url && (
          <a
            href={game.steam_url}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-white/10 hover:border-indigo-500/40 text-slate-200 text-sm font-medium transition-all group"
          >
            <div className="flex items-center gap-2.5">
              <Gamepad2 className="w-4 h-4 text-indigo-400" />
              <span>Steam Store Page</span>
            </div>
            <ExternalLink className="w-4 h-4 text-slate-500 group-hover:text-indigo-400 transition-colors" />
          </a>
        )}

        {game.website && (
          <a
            href={game.website}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-slate-900/50 hover:bg-slate-800/80 border border-white/5 hover:border-white/15 text-slate-300 hover:text-white text-sm font-medium transition-all group"
          >
            <div className="flex items-center gap-2.5">
              <Globe className="w-4 h-4 text-slate-400" />
              <span>Official Website</span>
            </div>
            <ExternalLink className="w-4 h-4 text-slate-500 group-hover:text-white transition-colors" />
          </a>
        )}
      </div>
    </aside>
  );
}
