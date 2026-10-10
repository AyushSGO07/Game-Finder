import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, Gamepad2, Star, Flame, Sparkles, Trophy, Gem, LayoutGrid } from 'lucide-react';
import { fetchShelfGames } from '@/lib/api';
import { GameCard as GameCardType, ShelfCategory } from '@/types/game';

interface GamesPageProps {
  searchParams: Promise<{ category?: string }>;
}

export async function generateMetadata({ searchParams }: GamesPageProps): Promise<Metadata> {
  const { category } = await searchParams;
  const categoryTitle = getCategoryTitle(category);
  return {
    title: `${categoryTitle} — Game Finder Catalog`,
    description: `Explore the complete collection of ${categoryTitle.toLowerCase()} available on Game Finder.`,
  };
}

const CATEGORIES: { id: string; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: 'all', label: 'All Catalog', icon: LayoutGrid },
  { id: 'trending', label: 'Trending Now', icon: Flame },
  { id: 'new_releases', label: 'New Releases', icon: Sparkles },
  { id: 'top_rated', label: 'Top Rated', icon: Trophy },
  { id: 'hidden_gems', label: 'Hidden Gems', icon: Gem },
];

function getCategoryTitle(category?: string): string {
  switch (category) {
    case 'trending':
      return 'Trending Now';
    case 'new_releases':
      return 'New Releases';
    case 'top_rated':
      return 'Top Rated Masterpieces';
    case 'hidden_gems':
      return 'Hidden Gems';
    default:
      return 'Full Games Catalog';
  }
}

function getCategorySubtitle(category?: string): string {
  switch (category) {
    case 'trending':
      return 'The most played, discussed, and active games across the community this week.';
    case 'new_releases':
      return 'Fresh titles, major content updates, and recent store launches.';
    case 'top_rated':
      return 'Universally acclaimed benchmark games and critical masterpieces of all time.';
    case 'hidden_gems':
      return 'Overlooked indie treasures and high-rated experiences waiting to be discovered.';
    default:
      return 'Browse all curated game collections and store shelves in one place.';
  }
}

export default async function GamesPage({ searchParams }: GamesPageProps) {
  const { category } = await searchParams;
  const activeCategory = category || 'all';

  let games: GameCardType[] = [];

  if (activeCategory === 'all') {
    const [trending, newReleases, topRated, hiddenGems] = await Promise.all([
      fetchShelfGames('trending'),
      fetchShelfGames('new_releases'),
      fetchShelfGames('top_rated'),
      fetchShelfGames('hidden_gems'),
    ]);
    const seen = new Set<string>();
    for (const g of [...trending, ...newReleases, ...topRated, ...hiddenGems]) {
      const gid = String(g.steam_appid || g.id);
      if (!seen.has(gid)) {
        seen.add(gid);
        games.push(g);
      }
    }
  } else {
    games = await fetchShelfGames(activeCategory as ShelfCategory);
  }

  const title = getCategoryTitle(category);
  const subtitle = getCategorySubtitle(category);

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 select-none">
      {/* Breadcrumb Navigation */}
      <div>
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-medium text-slate-400 hover:text-indigo-400 transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span>Back to Home</span>
        </Link>
      </div>

      {/* Page Header */}
      <div className="space-y-2">
        <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white flex items-center gap-3">
          <span>{title}</span>
          <span className="text-xs sm:text-sm px-2.5 py-1 rounded-full bg-indigo-600/20 text-indigo-300 font-semibold border border-indigo-500/30">
            {games.length} Games
          </span>
        </h1>
        <p className="text-slate-400 text-sm sm:text-base max-w-2xl">{subtitle}</p>
      </div>

      {/* Category Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-white/10 pb-4">
        {CATEGORIES.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeCategory === tab.id;
          const href = tab.id === 'all' ? '/games' : `/games?category=${tab.id}`;

          return (
            <Link
              key={tab.id}
              href={href}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                  : 'bg-slate-900/60 hover:bg-slate-800 text-slate-300 hover:text-white border border-white/5'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </Link>
          );
        })}
      </div>

      {/* Game Cards Grid */}
      {games.length === 0 ? (
        <div className="py-20 text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center mx-auto text-indigo-400">
            <Gamepad2 className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-white">No Games Found</h2>
          <p className="text-slate-400 text-sm max-w-md mx-auto">
            No titles are currently listed in this category shelf. Try browsing another collection.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {games.map((game) => {
            const canonicalId = String(game.steam_appid || game.id);
            const coverImage = game.capsule_image || game.header_image;

            return (
              <Link
                key={canonicalId}
                href={`/games/${canonicalId}`}
                className="group flex flex-col rounded-2xl bg-slate-900/60 border border-white/5 overflow-hidden hover:border-indigo-500/50 hover:shadow-xl hover:shadow-indigo-500/10 transition-all duration-300 hover:-translate-y-1.5 backdrop-blur-sm"
              >
                {/* 16:9 Aspect ratio Cover image */}
                <div className="relative aspect-[16/9] w-full bg-slate-950 overflow-hidden">
                  {coverImage ? (
                    <img
                      src={coverImage}
                      alt={game.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-slate-900 text-slate-500">
                      <Gamepad2 className="w-8 h-8 text-indigo-400/60" />
                    </div>
                  )}

                  {game.rating && (
                    <div className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-lg bg-black/70 backdrop-blur-md border border-white/10 flex items-center gap-1 text-xs text-amber-400 font-bold">
                      <Star className="w-3 h-3 fill-amber-400" />
                      <span>{game.rating}</span>
                    </div>
                  )}
                </div>

                {/* Card Details */}
                <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    <h3 className="text-base font-bold text-white group-hover:text-indigo-300 transition-colors line-clamp-1">
                      {game.title}
                    </h3>
                    <p className="text-xs text-slate-400 mt-1 line-clamp-1">
                      {game.developer || (game.genres && game.genres.length > 0 ? game.genres.join(' • ') : 'Featured Title')}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-white/5 text-xs text-slate-400">
                    <span className="truncate max-w-[150px]">
                      {game.genres.slice(0, 2).join(' • ')}
                    </span>
                    {game.price && (
                      <span className="font-semibold text-indigo-300">{game.price}</span>
                    )}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
