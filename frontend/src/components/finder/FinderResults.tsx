'use client';

import React from 'react';
import { Sparkles, SlidersHorizontal, RotateCcw, Quote } from 'lucide-react';
import { EnrichedRecommendation, WizardPreferences } from '@/types/game';
import RecommendationCard from './RecommendationCard';

interface FinderResultsProps {
  recommendations: EnrichedRecommendation[];
  preferences: WizardPreferences;
  onTweakPreferences: () => void;
  onNewSearch: () => void;
  onSaveGame?: (rec: EnrichedRecommendation) => void;
}

export default function FinderResults({
  recommendations,
  preferences,
  onTweakPreferences,
  onNewSearch,
  onSaveGame,
}: FinderResultsProps) {
  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-10 animate-fadeIn">
      {/* 1. Header & Controls Bar */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-white/10">
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>Gemini AI Match Results</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Your Curated <span className="bg-gradient-to-r from-indigo-400 via-cyan-300 to-indigo-200 bg-clip-text text-transparent">Top 8 Games</span>
          </h1>

          {/* Active criteria summary badges */}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <span className="text-xs text-slate-400 font-medium mr-1">Matched criteria:</span>
            {preferences.genre && (
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-indigo-600/20 text-indigo-300 border border-indigo-500/30">
                {preferences.genre}
              </span>
            )}
            {preferences.mood && (
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-cyan-500/20 text-cyan-300 border border-cyan-400/30">
                {preferences.mood}
              </span>
            )}
            {preferences.difficulty && (
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-white/5 text-slate-300 border border-white/10">
                {preferences.difficulty}
              </span>
            )}
            {preferences.age && (
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-white/5 text-slate-300 border border-white/10">
                {preferences.age}
              </span>
            )}
          </div>

          {/* Prompt quote snippet */}
          {preferences.prompt && (
            <div className="flex items-center gap-2 text-xs text-slate-400 italic bg-slate-900/40 border border-white/5 rounded-lg px-3 py-1.5 max-w-xl">
              <Quote className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
              <span className="truncate">&ldquo;{preferences.prompt}&rdquo;</span>
            </div>
          )}
        </div>

        {/* Action Buttons: Tweak / New Search */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={onTweakPreferences}
            className="px-4 py-2.5 rounded-xl border border-white/10 bg-slate-900/80 hover:bg-slate-800 text-slate-200 hover:text-white text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 shadow-sm"
          >
            <SlidersHorizontal className="w-4 h-4 text-indigo-400" />
            <span>Tweak Preferences</span>
          </button>

          <button
            type="button"
            onClick={onNewSearch}
            className="px-4 py-2.5 rounded-xl border border-white/10 bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white text-xs sm:text-sm font-medium transition-all flex items-center gap-2 shadow-sm"
          >
            <RotateCcw className="w-4 h-4 text-slate-400" />
            <span>New Search</span>
          </button>
        </div>
      </div>

      {/* 2. Responsive 8-Card Showcase Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {recommendations.map((rec, index) => (
          <RecommendationCard
            key={rec.steam_appid || rec.id || index}
            recommendation={rec}
            index={index}
            onSave={onSaveGame}
          />
        ))}
      </div>
    </div>
  );
}
