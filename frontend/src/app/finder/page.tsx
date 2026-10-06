'use client';

import React, { useState } from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { WizardPreferences, EnrichedRecommendation } from '@/types/game';
import { fetchRecommendations } from '@/lib/api';
import FinderWizard from '@/components/finder/FinderWizard';
import FinderSkeleton from '@/components/finder/FinderSkeleton';
import FinderResults from '@/components/finder/FinderResults';

type FinderStatus = 'idle' | 'loading' | 'results' | 'error';

const INITIAL_PREFERENCES: WizardPreferences = {
  genre: 'RPG',
  mood: 'Deep Story',
  difficulty: 'Normal',
  age: 'Teen',
  prompt: '',
};

export default function FinderPage() {
  const [status, setStatus] = useState<FinderStatus>('idle');
  const [preferences, setPreferences] = useState<WizardPreferences>(INITIAL_PREFERENCES);
  const [recommendations, setRecommendations] = useState<EnrichedRecommendation[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSearch = async (userPrefs: WizardPreferences) => {
    setPreferences(userPrefs);
    setStatus('loading');
    setErrorMessage(null);

    try {
      const results = await fetchRecommendations({
        genre: userPrefs.genre,
        age: userPrefs.age,
        difficulty: userPrefs.difficulty,
        prompt: userPrefs.mood
          ? `Mood/Vibe: ${userPrefs.mood}. ${userPrefs.prompt || ''}`.trim()
          : userPrefs.prompt,
      });

      if (results && results.length > 0) {
        setRecommendations(results);
        setStatus('results');
      } else {
        throw new Error('No recommendations could be generated.');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to generate recommendations';
      setErrorMessage(msg);
      setStatus('error');
    }
  };

  const handleTweakPreferences = () => {
    setStatus('idle');
  };

  const handleNewSearch = () => {
    setPreferences(INITIAL_PREFERENCES);
    setRecommendations([]);
    setStatus('idle');
  };

  return (
    <main className="min-h-screen bg-[#090a0f] text-slate-100 flex flex-col justify-start">
      {status === 'idle' && (
        <FinderWizard
          initialPreferences={preferences}
          onSubmit={handleSearch}
          isLoading={false}
        />
      )}

      {status === 'loading' && <FinderSkeleton />}

      {status === 'results' && (
        <FinderResults
          recommendations={recommendations}
          preferences={preferences}
          onTweakPreferences={handleTweakPreferences}
          onNewSearch={handleNewSearch}
        />
      )}

      {status === 'error' && (
        <div className="w-full max-w-xl mx-auto px-4 py-20 text-center space-y-6">
          <div className="w-16 h-16 rounded-full bg-rose-500/10 border border-rose-500/30 flex items-center justify-center mx-auto text-rose-400">
            <AlertCircle className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-white">Matching Service Error</h2>
            <p className="text-sm text-slate-400">
              {errorMessage || 'An error occurred while generating your recommendations.'}
            </p>
          </div>
          <div className="flex items-center justify-center gap-4">
            <button
              type="button"
              onClick={() => handleSearch(preferences)}
              className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm transition-all flex items-center gap-2 shadow-lg shadow-indigo-600/30"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Retry Search</span>
            </button>
            <button
              type="button"
              onClick={handleNewSearch}
              className="px-5 py-2.5 rounded-xl border border-white/10 bg-slate-800 text-slate-300 hover:text-white text-sm font-medium transition-all"
            >
              Back to Wizard
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
