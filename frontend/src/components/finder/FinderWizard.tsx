'use client';

import React, { useState } from 'react';
import { ArrowLeft, ArrowRight, Sparkles, RefreshCcw } from 'lucide-react';
import { WizardPreferences } from '@/types/game';
import WizardStepper from './WizardStepper';
import GenreMoodSelector from './GenreMoodSelector';
import DifficultyAgeSelector from './DifficultyAgeSelector';
import ConversationalPrompt from './ConversationalPrompt';

interface FinderWizardProps {
  initialPreferences?: Partial<WizardPreferences>;
  onSubmit: (preferences: WizardPreferences) => void;
  isLoading?: boolean;
}

const DEFAULT_PREFERENCES: WizardPreferences = {
  genre: 'RPG',
  mood: 'Deep Story',
  difficulty: 'Normal',
  age: 'Teen',
  prompt: '',
};

export default function FinderWizard({
  initialPreferences,
  onSubmit,
  isLoading = false,
}: FinderWizardProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [preferences, setPreferences] = useState<WizardPreferences>({
    ...DEFAULT_PREFERENCES,
    ...initialPreferences,
  });

  const handleNext = () => {
    if (currentStep < 3) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(preferences);
  };

  const handleReset = () => {
    setPreferences(DEFAULT_PREFERENCES);
    setCurrentStep(1);
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
      {/* 1. Header Hero Title */}
      <div className="text-center space-y-3 mb-8">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-semibold tracking-wide shadow-sm">
          <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
          <span>Google Gemini AI Matchmaker</span>
        </div>
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-white">
          Discover Your <span className="bg-gradient-to-r from-indigo-400 via-cyan-300 to-indigo-200 bg-clip-text text-transparent">Next Obsession</span>
        </h1>
        <p className="text-sm sm:text-base text-slate-400 max-w-xl mx-auto leading-relaxed">
          Tell our AI agent what you crave in gameplay, pacing, and tone. We'll unearth the top 8 tailored games for you.
        </p>
      </div>

      {/* 2. Visual Stepper Navigation */}
      <WizardStepper
        currentStep={currentStep}
        onStepClick={(step) => setCurrentStep(step)}
      />

      {/* 3. Interactive Step Panel Container */}
      <form
        onSubmit={handleSubmit}
        className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-3xl p-6 sm:p-10 shadow-2xl relative overflow-hidden"
      >
        {/* Subtle decorative glow */}
        <div className="absolute top-0 right-0 w-72 h-72 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none -z-0" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-cyan-600/10 rounded-full blur-3xl pointer-events-none -z-0" />

        <div className="relative z-10 space-y-8">
          {/* STEP 1: Genre & Vibe */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div className="border-b border-white/10 pb-4">
                <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                  Choose Your Genre & Vibe
                </h2>
                <p className="text-xs sm:text-sm text-slate-400 mt-1">
                  Pick a core gameplay framework and optional atmosphere.
                </p>
              </div>

              <GenreMoodSelector
                selectedGenre={preferences.genre}
                selectedMood={preferences.mood}
                onSelectGenre={(genre) =>
                  setPreferences((prev) => ({ ...prev, genre }))
                }
                onSelectMood={(mood) =>
                  setPreferences((prev) => ({ ...prev, mood }))
                }
              />
            </div>
          )}

          {/* STEP 2: Difficulty & Age Rating */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="border-b border-white/10 pb-4">
                <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                  Tune Challenge & Rating
                </h2>
                <p className="text-xs sm:text-sm text-slate-400 mt-1">
                  Set gameplay intensity and age rating boundaries.
                </p>
              </div>

              <DifficultyAgeSelector
                selectedDifficulty={preferences.difficulty}
                selectedAge={preferences.age}
                onSelectDifficulty={(difficulty) =>
                  setPreferences((prev) => ({ ...prev, difficulty }))
                }
                onSelectAge={(age) =>
                  setPreferences((prev) => ({ ...prev, age }))
                }
              />
            </div>
          )}

          {/* STEP 3: Conversational Prompt */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div className="border-b border-white/10 pb-4">
                <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                  Personalize Your Match
                </h2>
                <p className="text-xs sm:text-sm text-slate-400 mt-1">
                  Add optional themes, art styles, or specific mechanics.
                </p>
              </div>

              <ConversationalPrompt
                prompt={preferences.prompt}
                onChangePrompt={(prompt) =>
                  setPreferences((prev) => ({ ...prev, prompt }))
                }
              />
            </div>
          )}

          {/* Navigation Controls Footer */}
          <div className="flex items-center justify-between pt-6 border-t border-white/10 gap-4">
            <div>
              {currentStep > 1 ? (
                <button
                  type="button"
                  onClick={handleBack}
                  className="px-5 py-2.5 rounded-xl border border-white/10 bg-slate-800/80 hover:bg-slate-700 text-slate-200 text-sm font-semibold transition-all flex items-center gap-2 group"
                >
                  <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                  <span>Back</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleReset}
                  className="px-4 py-2.5 rounded-xl text-xs font-medium text-slate-400 hover:text-white transition-colors flex items-center gap-1.5"
                >
                  <RefreshCcw className="w-3.5 h-3.5" />
                  <span>Reset defaults</span>
                </button>
              )}
            </div>

            <div>
              {currentStep === 1 && (
                <button
                  type="button"
                  onClick={handleNext}
                  className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold transition-all shadow-lg shadow-indigo-600/30 flex items-center gap-2 group"
                >
                  <span>Next: Difficulty & Age</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              )}

              {currentStep === 2 && (
                <button
                  type="button"
                  onClick={handleNext}
                  className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold transition-all shadow-lg shadow-indigo-600/30 flex items-center gap-2 group"
                >
                  <span>Next: Guidance Prompt</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              )}

              {currentStep === 3 && (
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-8 py-3 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white text-sm font-bold transition-all shadow-xl shadow-indigo-600/40 hover:scale-[1.02] flex items-center gap-2.5 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  <Sparkles className="w-4 h-4 animate-spin text-cyan-200" />
                  <span>Find My Games ✨</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
