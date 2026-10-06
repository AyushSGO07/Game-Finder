'use client';

import React from 'react';
import { Sparkles, X, MessageSquareQuote, Compass } from 'lucide-react';

interface ConversationalPromptProps {
  prompt: string;
  onChangePrompt: (prompt: string) => void;
  maxChars?: number;
}

const INSPIRATION_CHIPS = [
  'Cyberpunk detective mystery with synthwave vibes',
  'Cozy farming sim with deep crafting and secrets',
  'Fast-paced rogue-lite with incredible build variety',
  'Challenging souls-like set in feudal Japan with parry mechanics',
  'Atmospheric cosmic horror with clever puzzle solving',
  'Immersive space exploration with fleet combat and trade',
];

export default function ConversationalPrompt({
  prompt,
  onChangePrompt,
  maxChars = 300,
}: ConversationalPromptProps) {
  const charCount = prompt.length;
  const isNearLimit = charCount >= maxChars * 0.9;

  const handleChipClick = (chipText: string) => {
    onChangePrompt(chipText);
  };

  const handleClear = () => {
    onChangePrompt('');
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* 1. Main Text Input Area */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-sm font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
            <MessageSquareQuote className="w-4 h-4 text-indigo-400" />
            <span>Creative Prompt & Theme</span>
            <span className="text-xs font-normal text-slate-500">(Optional)</span>
          </label>
          <div className="flex items-center gap-3">
            {prompt && (
              <button
                type="button"
                onClick={handleClear}
                aria-label="Clear prompt"
                className="text-xs text-slate-400 hover:text-rose-400 transition-colors flex items-center gap-1 focus:outline-none"
              >
                <X className="w-3.5 h-3.5" />
                <span>Clear prompt</span>
              </button>
            )}
            <span
              className={`text-xs font-mono font-medium transition-colors ${
                isNearLimit ? 'text-amber-400' : 'text-slate-500'
              }`}
            >
              {charCount} / {maxChars}
            </span>
          </div>
        </div>

        <div className="relative group">
          <textarea
            value={prompt}
            onChange={(e) => onChangePrompt(e.target.value.slice(0, maxChars))}
            placeholder="Describe your dream game in freeform words (e.g., A melancholy sci-fi thriller about exploring a dying starship with zero gravity puzzles)..."
            rows={4}
            className="w-full bg-slate-900/80 border border-white/10 rounded-2xl p-4 text-sm sm:text-base text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/25 transition-all resize-none shadow-inner"
          />
        </div>
      </div>

      {/* 2. Inspiration Chips Carousel */}
      <div className="space-y-2.5">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
          <Compass className="w-3.5 h-3.5 text-cyan-400" />
          <span>Try an inspiration prompt:</span>
        </div>

        <div className="flex flex-wrap gap-2">
          {INSPIRATION_CHIPS.map((chip, index) => (
            <button
              key={index}
              type="button"
              onClick={() => handleChipClick(chip)}
              className="px-3.5 py-1.5 rounded-xl text-xs font-medium bg-slate-900/60 border border-white/10 text-slate-300 hover:border-indigo-500/50 hover:bg-indigo-600/10 hover:text-indigo-200 transition-all text-left flex items-center gap-1.5 group"
            >
              <Sparkles className="w-3 h-3 text-indigo-400 group-hover:rotate-12 transition-transform" />
              <span>{chip}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
