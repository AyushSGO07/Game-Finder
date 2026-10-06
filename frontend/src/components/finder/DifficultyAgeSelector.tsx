'use client';

import React from 'react';
import { Coffee, Shield, Zap, Skull, HelpCircle, ShieldCheck } from 'lucide-react';
import { ALLOWED_DIFFICULTIES } from '@/types/game';

interface DifficultyAgeSelectorProps {
  selectedDifficulty: string;
  selectedAge: string;
  onSelectDifficulty: (difficulty: string) => void;
  onSelectAge: (age: string) => void;
}

interface DifficultyOption {
  value: string;
  label: string;
  desc: string;
  icon: React.ElementType;
  badgeColor: string;
}

const DIFFICULTIES: DifficultyOption[] = [
  {
    value: 'Casual',
    label: 'Casual',
    desc: 'Relaxed, story-first, accessible mechanics with minimal stress.',
    icon: Coffee,
    badgeColor: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10',
  },
  {
    value: 'Normal',
    label: 'Normal',
    desc: 'Balanced gameplay loops, moderate skill checks, fair checkpoints.',
    icon: Shield,
    badgeColor: 'text-sky-400 border-sky-500/30 bg-sky-500/10',
  },
  {
    value: 'Hard',
    label: 'Hard',
    desc: 'Demanding combat, tactical precision, and deep mechanical mastery.',
    icon: Zap,
    badgeColor: 'text-amber-400 border-amber-500/30 bg-amber-500/10',
  },
  {
    value: 'Punishing',
    label: 'Punishing',
    desc: 'Uncompromising souls-like difficulty, strict death penalties, high stakes.',
    icon: Skull,
    badgeColor: 'text-rose-400 border-rose-500/30 bg-rose-500/10',
  },
  {
    value: 'Any',
    label: 'Any Difficulty',
    desc: 'Flexible range. Let AI match based on thematic tone and genre alone.',
    icon: HelpCircle,
    badgeColor: 'text-indigo-400 border-indigo-500/30 bg-indigo-500/10',
  },
];

const AGE_RATINGS = [
  { value: 'Everyone', label: 'Everyone (E)', desc: 'All ages' },
  { value: 'Everyone 10+', label: 'Everyone 10+ (E10+)', desc: 'Mild fantasy violence' },
  { value: 'Teen', label: 'Teen (T)', desc: '13+ audiences' },
  { value: 'Mature', label: 'Mature (M)', desc: '17+ intense themes' },
  { value: 'Any', label: 'Any Rating', desc: 'No restrictions' },
];

export default function DifficultyAgeSelector({
  selectedDifficulty,
  selectedAge,
  onSelectDifficulty,
  onSelectAge,
}: DifficultyAgeSelectorProps) {
  return (
    <div className="space-y-8 animate-fadeIn">
      {/* 1. Gameplay Difficulty Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-sm font-bold uppercase tracking-wider text-slate-300">
            Challenge & Difficulty
          </label>
          <span className="text-xs text-slate-400">Target gameplay intensity</span>
        </div>

        <div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3"
          role="group"
          aria-label="Gameplay Difficulty Options"
        >
          {DIFFICULTIES.map((diff) => {
            const isSelected = selectedDifficulty === diff.value;
            const Icon = diff.icon;

            return (
              <button
                key={diff.value}
                type="button"
                onClick={() => onSelectDifficulty(diff.value)}
                aria-pressed={isSelected}
                className={`p-4 rounded-xl border text-left transition-all duration-200 relative group flex flex-col justify-between ${
                  isSelected
                    ? 'bg-indigo-600/20 border-indigo-500 text-white shadow-lg shadow-indigo-600/20 ring-2 ring-indigo-500/50'
                    : 'bg-slate-900/60 border-white/10 text-slate-300 hover:border-white/20 hover:bg-slate-800/60'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-sm tracking-tight text-white flex items-center gap-2">
                      <Icon className="w-4 h-4 text-indigo-400" />
                      {diff.label}
                    </span>
                    <span
                      className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full border ${diff.badgeColor}`}
                    >
                      {diff.value}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed group-hover:text-slate-300 transition-colors">
                    {diff.desc}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Age / ESRB Rating Selector */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-sm font-bold uppercase tracking-wider text-slate-300">
            Age & Maturity Rating
          </label>
          <span className="text-xs text-slate-400">Content boundary guidance</span>
        </div>

        <div
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5"
          role="group"
          aria-label="Age Rating Options"
        >
          {AGE_RATINGS.map((rating) => {
            const isSelected = selectedAge === rating.value;

            return (
              <button
                key={rating.value}
                type="button"
                onClick={() => onSelectAge(rating.value)}
                aria-pressed={isSelected}
                className={`p-3 rounded-xl border text-left transition-all duration-200 flex flex-col justify-between ${
                  isSelected
                    ? 'bg-cyan-500/20 border-cyan-400 text-white shadow-md shadow-cyan-500/20 ring-1 ring-cyan-400/40'
                    : 'bg-slate-900/60 border-white/10 text-slate-300 hover:border-white/20 hover:bg-slate-800/40'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <ShieldCheck
                    className={`w-3.5 h-3.5 ${
                      isSelected ? 'text-cyan-400' : 'text-slate-500'
                    }`}
                  />
                  <span className="text-xs font-bold truncate">{rating.label}</span>
                </div>
                <span className="text-[10px] text-slate-400">{rating.desc}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
