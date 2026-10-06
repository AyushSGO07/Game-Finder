'use client';

import React, { useState, useEffect } from 'react';
import { Sparkles, Brain, Database, Cpu } from 'lucide-react';

const STATUS_MESSAGES = [
  { text: 'Analyzing your gaming preferences and atmosphere...', icon: Sparkles },
  { text: 'Querying Google Gemini AI recommendation model...', icon: Brain },
  { text: 'Scanning 10,000+ catalog titles and Steam metadata...', icon: Database },
  { text: 'Synthesizing tailored match rationales and attributes...', icon: Cpu },
  { text: 'Assembling your top 8 personalized recommendations...', icon: Sparkles },
];

export default function FinderSkeleton() {
  const [msgIndex, setMsgIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setMsgIndex((prev) => (prev + 1) % STATUS_MESSAGES.length);
    }, 1800);
    return () => clearInterval(timer);
  }, []);

  const CurrentIcon = STATUS_MESSAGES[msgIndex].icon;

  return (
    <div
      className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-10 animate-fadeIn"
      aria-busy="true"
      aria-label="Generating Game Recommendations"
    >
      {/* 1. Header Status Ticker */}
      <div className="text-center space-y-4 max-w-xl mx-auto">
        <div className="relative inline-flex items-center justify-center">
          <div className="w-16 h-16 rounded-full bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center animate-pulse shadow-lg shadow-indigo-600/30">
            <CurrentIcon className="w-8 h-8 text-indigo-400 animate-spin" />
          </div>
          <div className="absolute inset-0 rounded-full bg-cyan-500/10 blur-xl animate-ping" />
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Consulting Gemini AI
          </h2>
          <div
            role="status"
            aria-live="polite"
            className="text-sm sm:text-base font-medium text-indigo-300 h-6 flex items-center justify-center gap-2 transition-all"
          >
            <span className="inline-block w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            <span>{STATUS_MESSAGES[msgIndex].text}</span>
          </div>
        </div>

        {/* Indeterminate progress bar */}
        <div className="w-full max-w-md mx-auto h-1.5 bg-slate-800 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-indigo-500 via-cyan-400 to-indigo-500 rounded-full animate-indeterminate" />
        </div>
      </div>

      {/* 2. Responsive 8-Card Skeleton Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            data-testid="finder-skeleton-card"
            className="bg-slate-900/60 border border-white/10 rounded-2xl overflow-hidden p-0 flex flex-col h-[420px] animate-pulse shadow-lg"
          >
            {/* Aspect 16:9 Image Shimmer */}
            <div className="aspect-video w-full bg-slate-800/80 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full animate-shimmer" />
            </div>

            {/* Card Body Shimmer */}
            <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                {/* Title skeleton */}
                <div className="h-5 bg-slate-800 rounded-md w-3/4" />

                {/* Tags skeleton */}
                <div className="flex gap-1.5 flex-wrap">
                  <div className="h-4 bg-slate-800/80 rounded-full w-14" />
                  <div className="h-4 bg-slate-800/80 rounded-full w-16" />
                  <div className="h-4 bg-slate-800/80 rounded-full w-12" />
                </div>

                {/* AI Rationale box skeleton */}
                <div className="bg-slate-950/50 border border-white/5 rounded-xl p-3 space-y-2 mt-2">
                  <div className="h-3 bg-indigo-500/20 rounded w-1/3" />
                  <div className="h-3 bg-slate-800 rounded w-full" />
                  <div className="h-3 bg-slate-800 rounded w-5/6" />
                </div>
              </div>

              {/* Action buttons skeleton */}
              <div className="flex items-center gap-2 pt-2 border-t border-white/5">
                <div className="h-9 bg-slate-800 rounded-xl flex-1" />
                <div className="h-9 bg-slate-800 rounded-xl w-24" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
