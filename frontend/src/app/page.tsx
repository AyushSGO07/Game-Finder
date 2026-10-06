import React from 'react';
import HeroCarousel from '@/components/discovery/HeroCarousel';
import GameShelf from '@/components/discovery/GameShelf';
import GenreHub from '@/components/discovery/GenreHub';
import {
  fetchHeroGames,
  fetchShelfGames,
  fetchGenres,
} from '@/lib/api';

export default async function HomePage() {
  const [heroSlides, trendingGames, newReleases, genres, topRated, hiddenGems] =
    await Promise.all([
      fetchHeroGames(),
      fetchShelfGames('trending'),
      fetchShelfGames('new_releases'),
      fetchGenres(),
      fetchShelfGames('top_rated'),
      fetchShelfGames('hidden_gems'),
    ]);

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-12 sm:space-y-16">
      {/* 1. Store Hero Carousel */}
      <section aria-label="Featured Showcase">
        <HeroCarousel slides={heroSlides} />
      </section>

      {/* 2. Trending Now Shelf */}
      <section aria-label="Trending Shelf">
        <GameShelf
          title="Trending Now"
          subtitle="The most played and talked about games this week"
          games={trendingGames}
          category="trending"
          accentDotColor="bg-indigo-500"
        />
      </section>

      {/* 3. New Releases Shelf */}
      <section aria-label="New Releases Shelf">
        <GameShelf
          title="New Releases"
          subtitle="Fresh titles and major expansions recently launched"
          games={newReleases}
          category="new_releases"
          accentDotColor="bg-emerald-500"
        />
      </section>

      {/* 4. 12-Tile Genre Hub */}
      <section aria-label="Genre Categories">
        <GenreHub genres={genres} />
      </section>

      {/* 5. Top Rated All-Time Shelf */}
      <section aria-label="Top Rated Shelf">
        <GameShelf
          title="Top Rated of All Time"
          subtitle="Universally acclaimed masterpieces and player favorites"
          games={topRated}
          category="top_rated"
          accentDotColor="bg-amber-400"
        />
      </section>

      {/* 6. Hidden Gems Shelf */}
      <section aria-label="Hidden Gems Shelf">
        <GameShelf
          title="Hidden Gems"
          subtitle="Exceptional indie triumphs and overlooked masterworks"
          games={hiddenGems}
          category="hidden_gems"
          accentDotColor="bg-purple-500"
        />
      </section>
    </div>
  );
}
