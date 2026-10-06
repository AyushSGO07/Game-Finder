'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Search, X, Star, ArrowRight, CornerDownLeft } from 'lucide-react';
import { GameCard } from '@/types/game';
import { searchGames } from '@/lib/api';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectGame?: (game: GameCard) => void;
}

const SUGGESTED_QUERIES = ['Elden Ring', 'Cyberpunk', 'RPG', 'Roguelike', 'GOTY'];

export default function SearchModal({ isOpen, onClose, onSelectGame }: SearchModalProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<GameCard[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Global keyboard shortcut listener for Ctrl+K / Cmd+K and Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && (e.key === 'k' || e.key === 'K')) {
        e.preventDefault();
        if (isOpen) {
          onClose();
        }
      } else if (e.key === 'Escape' && isOpen) {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
      setQuery('');
      setResults([]);
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Handle search query with debounce
  useEffect(() => {
    const sanitized = query.trim();
    if (!sanitized) {
      setResults([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const timer = setTimeout(async () => {
      try {
        const data = await searchGames(sanitized);
        setResults(data);
      } finally {
        setIsLoading(false);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [query]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Quick Search"
      className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-black/80 backdrop-blur-sm transition-opacity"
    >
      {/* Backdrop dismissal */}
      <div
        data-testid="search-backdrop"
        onClick={onClose}
        className="fixed inset-0 -z-10"
      />

      {/* Modal Dialog Card */}
      <div className="w-full max-w-2xl bg-slate-900 border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-white/10 bg-slate-950/60">
          <Search className="w-5 h-5 text-indigo-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search games, genres, developers..."
            className="flex-1 bg-transparent border-none text-slate-100 placeholder-slate-500 text-base focus:outline-none focus:ring-0"
            aria-label="Search input"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              aria-label="Clear search query"
              className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-white/10"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            aria-label="Close search"
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 text-xs font-medium"
          >
            ESC
          </button>
        </div>

        {/* Content Body: Suggestions or Results */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {!query && (
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                Suggested Searches
              </p>
              <div className="flex flex-wrap gap-2">
                {SUGGESTED_QUERIES.map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setQuery(item)}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 text-slate-300 hover:text-white hover:bg-indigo-600/30 border border-white/5 hover:border-indigo-500/30 transition-all"
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>
          )}

          {isLoading && (
            <div className="py-8 text-center text-slate-400 text-sm">
              Searching games catalog...
            </div>
          )}

          {!isLoading && query && results.length === 0 && (
            <div className="py-8 text-center text-slate-400 text-sm">
              No games found matching &quot;{query}&quot;. Try exploring a genre or different title.
            </div>
          )}

          {!isLoading && results.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                Results ({results.length})
              </p>
              {results.map((game) => (
                <div
                  key={game.id}
                  onClick={() => {
                    onSelectGame?.(game);
                    onClose();
                  }}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/50 hover:bg-indigo-950/30 border border-white/5 hover:border-indigo-500/40 cursor-pointer transition-all group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {game.header_image ? (
                      <img
                        src={game.header_image}
                        alt={game.title}
                        className="w-16 h-10 object-cover rounded-md shrink-0 border border-white/10"
                      />
                    ) : (
                      <div className="w-16 h-10 bg-slate-800 rounded-md flex items-center justify-center text-[10px] text-slate-500">
                        GAME
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-white group-hover:text-indigo-300 truncate">
                        {game.title}
                      </p>
                      <p className="text-xs text-slate-400 truncate">
                        {game.genres.slice(0, 2).join(' • ')}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0 ml-2">
                    {game.rating && (
                      <div className="flex items-center gap-1 text-xs text-amber-400 font-semibold">
                        <Star className="w-3.5 h-3.5 fill-amber-400" />
                        <span>{game.rating}</span>
                      </div>
                    )}
                    <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-indigo-400 transition-colors" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer info bar */}
        <div className="px-4 py-2.5 border-t border-white/10 bg-slate-950/80 flex items-center justify-between text-xs text-slate-500">
          <span className="flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-[10px] text-slate-300">
              ESC
            </kbd>{' '}
            to close
          </span>
          <span className="flex items-center gap-1">
            Select to explore <CornerDownLeft className="w-3 h-3 text-slate-400" />
          </span>
        </div>
      </div>
    </div>
  );
}
