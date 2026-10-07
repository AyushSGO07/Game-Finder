'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Gamepad2,
  Search,
  ArrowUpDown,
  Sparkles,
  Compass,
  Trophy,
  Flame,
  Layers,
  Heart,
  Clock,
} from 'lucide-react';
import { ShelfStatus } from '@/types/game';
import { useLibrary } from '@/context/LibraryContext';
import LibraryFilterTabs from '@/components/library/LibraryFilterTabs';
import LibraryGameCard from '@/components/library/LibraryGameCard';

type SortOption = 'recent' | 'title' | 'rating' | 'playtime';

export default function LibraryPage() {
  const { items, isLoading } = useLibrary();
  const [activeTab, setActiveTab] = useState<ShelfStatus | 'all'>('all');
  const [activeMainView, setActiveMainView] = useState<'shelves' | 'rankings'>('shelves');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('recent');

  const allItems = useMemo(() => Object.values(items), [items]);

  // Shelf counts
  const counts = useMemo(() => {
    const res: Record<ShelfStatus | 'all', number> = {
      all: allItems.length,
      playing: 0,
      wishlist: 0,
      backlog: 0,
      completed: 0,
      dropped: 0,
    };
    for (const item of allItems) {
      if (item.status && res[item.status] !== undefined) {
        res[item.status]++;
      }
    }
    return res;
  }, [allItems]);

  // Total summary stats
  const totalPlaytime = useMemo(() => {
    return allItems.reduce((acc, curr) => acc + (curr.playtime_hours || 0), 0);
  }, [allItems]);

  const favoritesCount = useMemo(() => {
    return allItems.filter((i) => i.is_favorite).length;
  }, [allItems]);

  // Filtered and sorted items for active shelf
  const filteredItems = useMemo(() => {
    let list = allItems;

    // Filter by shelf
    if (activeTab !== 'all') {
      list = list.filter((i) => i.status === activeTab);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      list = list.filter((i) => i.game_title?.toLowerCase().includes(q));
    }

    // Sort items
    return [...list].sort((a, b) => {
      if (sortBy === 'title') {
        return (a.game_title || '').localeCompare(b.game_title || '');
      }
      if (sortBy === 'rating') {
        return (b.personal_rating || 0) - (a.personal_rating || 0);
      }
      if (sortBy === 'playtime') {
        return (b.playtime_hours || 0) - (a.playtime_hours || 0);
      }
      // 'recent' by updated_at or created_at
      const dateA = new Date(a.updated_at || a.created_at || 0).getTime();
      const dateB = new Date(b.updated_at || b.created_at || 0).getTime();
      return dateB - dateA;
    });
  }, [allItems, activeTab, searchQuery, sortBy]);

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8 select-none">
      {/* 1. Header & Navigation Banner */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-white/10">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <Gamepad2 className="w-3.5 h-3.5" />
            <span>Personal Gaming Hub</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white">
            My Game Library
          </h1>
          <p className="text-sm sm:text-base text-slate-400 max-w-2xl">
            Organize your collection across status shelves, log your hours, and curate your personal gaming legacy.
          </p>
        </div>

        {/* View Switcher: Shelves vs Top 10 Rankings */}
        <div className="flex items-center p-1 rounded-xl bg-slate-900 border border-white/10 shrink-0">
          <button
            type="button"
            onClick={() => setActiveMainView('shelves')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
              activeMainView === 'shelves'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Game Shelves</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveMainView('rankings')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
              activeMainView === 'rankings'
                ? 'bg-amber-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Trophy className="w-4 h-4" />
            <span>Top 10 Rankings</span>
          </button>
        </div>
      </div>

      {activeMainView === 'shelves' ? (
        <>
          {/* 2. Library Quick Stats Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-slate-900/60 border border-white/5 backdrop-blur-md space-y-1">
              <span className="text-xs text-slate-400 font-medium">Total Shelved</span>
              <p className="text-2xl font-bold text-white">{allItems.length}</p>
            </div>
            <div className="p-4 rounded-xl bg-slate-900/60 border border-white/5 backdrop-blur-md space-y-1">
              <span className="text-xs text-slate-400 font-medium">Currently Playing</span>
              <p className="text-2xl font-bold text-emerald-400">{counts.playing}</p>
            </div>
            <div className="p-4 rounded-xl bg-slate-900/60 border border-white/5 backdrop-blur-md space-y-1">
              <span className="text-xs text-slate-400 font-medium">Time Logged</span>
              <p className="text-2xl font-bold text-indigo-400">{totalPlaytime.toFixed(1)} hrs</p>
            </div>
            <div className="p-4 rounded-xl bg-slate-900/60 border border-white/5 backdrop-blur-md space-y-1">
              <span className="text-xs text-slate-400 font-medium">Favorites</span>
              <p className="text-2xl font-bold text-rose-400">{favoritesCount}</p>
            </div>
          </div>

          {/* 3. Shelf Filter Tabs */}
          <LibraryFilterTabs
            activeTab={activeTab}
            onTabChange={setActiveTab}
            counts={counts}
          />

          {/* 4. Search and Sort Filter Toolbar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            {/* Search Input */}
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Filter games by title..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                aria-label="Filter games by title"
                className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-900/80 border border-white/10 text-white placeholder-slate-500 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
              />
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-2 self-end sm:self-auto">
              <span className="text-xs text-slate-400 flex items-center gap-1 font-medium">
                <ArrowUpDown className="w-3.5 h-3.5" />
                <span>Sort:</span>
              </span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                aria-label="Sort library games"
                className="px-3 py-2 rounded-xl bg-slate-900/80 border border-white/10 text-slate-300 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="recent">Recently Updated</option>
                <option value="title">Alphabetical (A-Z)</option>
                <option value="rating">Highest Personal Rating</option>
                <option value="playtime">Most Hours Played</option>
              </select>
            </div>
          </div>

          {/* 5. Games Grid or Empty State */}
          {filteredItems.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {filteredItems.map((item) => (
                <LibraryGameCard key={item.game_id} item={item} />
              ))}
            </div>
          ) : (
            <div className="rounded-2xl bg-slate-900/40 border border-white/5 p-12 text-center max-w-xl mx-auto space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center mx-auto text-indigo-400">
                <Gamepad2 className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-white">No games found on this shelf</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                {searchQuery
                  ? `No games match "${searchQuery}". Try a different title or clear your search query.`
                  : 'Start adding titles from our discovery showcase or use the AI Game Finder to discover your next adventure.'}
              </p>
              <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
                <Link
                  href="/"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs sm:text-sm transition-all shadow-md shadow-indigo-600/20"
                >
                  <Compass className="w-4 h-4" />
                  <span>Explore Games</span>
                </Link>
                <Link
                  href="/finder"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-white/10 text-slate-200 font-semibold text-xs sm:text-sm transition-all"
                >
                  <Sparkles className="w-4 h-4 text-cyan-400" />
                  <span>AI Game Matchmaker</span>
                </Link>
              </div>
            </div>
          )}
        </>
      ) : (
        /* Top 10 View Container (wired up in Plan 07-03) */
        <div id="top-10-container" className="space-y-6">
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-white/10 backdrop-blur-md">
            <div className="flex items-center gap-3 mb-2">
              <Trophy className="w-6 h-6 text-amber-400" />
              <h2 className="text-2xl font-bold text-white">All-Time Top 10 Rankings</h2>
            </div>
            <p className="text-sm text-slate-400">
              Curate and reorder your personal Top 10 masterpiece games. (Configurable in Phase 7 Plan 03).
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
