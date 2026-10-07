import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, Gamepad2, Info } from 'lucide-react';
import { fetchGameDetails, fetchGameReviews } from '@/lib/api';
import GameHeader from '@/components/game/GameHeader';
import GameSidebar from '@/components/game/GameSidebar';
import MediaGallery from '@/components/game/MediaGallery';
import SystemRequirements from '@/components/game/SystemRequirements';
import GameReviewsSection from '@/components/reviews/GameReviewsSection';

interface GamePageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: GamePageProps): Promise<Metadata> {
  const { id } = await params;
  const game = await fetchGameDetails(id);

  if (!game) {
    return {
      title: 'Game Not Found — Game Finder',
    };
  }

  return {
    title: `${game.title} — Game Details & Media | Game Finder`,
    description: game.short_description || `Explore ${game.title} details, trailers, and screenshots.`,
    openGraph: {
      title: game.title,
      description: game.short_description,
      images: game.header_image ? [{ url: game.header_image }] : [],
    },
  };
}

export default async function GameDetailPage({ params }: GamePageProps) {
  const { id } = await params;
  const game = await fetchGameDetails(id);
  const reviews = await fetchGameReviews(id);

  if (!game) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center mx-auto text-indigo-400">
          <Gamepad2 className="w-8 h-8" />
        </div>
        <h1 className="text-3xl font-bold text-white">Game Not Found</h1>
        <p className="text-slate-400 text-sm max-w-md mx-auto">
          We couldn&apos;t locate the requested game in our catalog. It may not be available on Steam or the ID was incorrect.
        </p>
        <div>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm transition-all shadow-lg shadow-indigo-600/25"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Store Home</span>
          </Link>
        </div>
      </div>
    );
  }

  const aboutText = game.about_the_game || game.detailed_description || game.short_description;

  return (
    <article className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 select-none">
      {/* Back to discovery breadcrumb link */}
      <div>
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-medium text-slate-400 hover:text-indigo-400 transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span>Back to Store Discovery</span>
        </Link>
      </div>

      {/* 1. Game Header Banner */}
      <GameHeader game={game} />

      {/* 2. Main Two-Column Master Detail Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column (8 cols): Media Showcase, Synopsis, System Requirements */}
        <div className="lg:col-span-8 space-y-8">
          {/* Media Showcase (Video Player & Screenshot Gallery) */}
          <MediaGallery
            movies={game.movies}
            screenshots={game.screenshots}
            gameTitle={game.title}
          />

          {/* About This Game Section */}
          <section
            aria-label="About the game"
            className="rounded-2xl bg-slate-900/60 border border-white/5 p-6 backdrop-blur-md space-y-4"
          >
            <div className="flex items-center gap-2 border-b border-white/5 pb-3">
              <Info className="w-4 h-4 text-indigo-400" />
              <h2 className="text-xl font-bold tracking-tight text-white">
                About This Game
              </h2>
            </div>

            <div className="prose prose-invert max-w-none text-slate-300 text-sm sm:text-base leading-relaxed space-y-3">
              <p>{aboutText}</p>
            </div>
          </section>

          {/* PC System Requirements */}
          <SystemRequirements pcRequirements={game.pc_requirements} />

          {/* Ratings & Community Reviews */}
          <GameReviewsSection gameId={id} initialReviews={reviews} />
        </div>

        {/* Right Column (4 cols): Metadata Sidebar */}
        <div className="lg:col-span-4 sticky top-24">
          <GameSidebar game={game} />
        </div>
      </div>
    </article>
  );
}
