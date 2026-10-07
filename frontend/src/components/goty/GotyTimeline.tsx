'use client';

import React, { useRef, useEffect } from 'react';
import { Trophy, Sparkles } from 'lucide-react';

export interface GotyTimelineProps {
  years: number[];
  selectedYear: number;
  onSelectYear: (year: number) => void;
  className?: string;
}

export default function GotyTimeline({
  years,
  selectedYear,
  onSelectYear,
  className = '',
}: GotyTimelineProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const activeBtnRef = useRef<HTMLButtonElement>(null);

  // Auto-scroll selected button into view horizontally smoothly
  useEffect(() => {
    if (
      activeBtnRef.current &&
      containerRef.current &&
      typeof activeBtnRef.current.scrollIntoView === 'function'
    ) {
      activeBtnRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'center',
      });
    }
  }, [selectedYear]);

  // Keyboard navigation across tabs
  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    let targetIndex: number | null = null;

    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault();
      targetIndex = (index + 1) % years.length;
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault();
      targetIndex = (index - 1 + years.length) % years.length;
    } else if (e.key === 'Home') {
      e.preventDefault();
      targetIndex = 0;
    } else if (e.key === 'End') {
      e.preventDefault();
      targetIndex = years.length - 1;
    }

    if (targetIndex !== null) {
      onSelectYear(years[targetIndex]);
    }
  };

  return (
    <div className={`relative w-full ${className}`}>
      {/* Scrollable Timeline Track */}
      <div
        ref={containerRef}
        role="tablist"
        aria-label="Game of the Year Archive Timeline"
        className="flex items-center gap-2 overflow-x-auto pb-2 pt-1 px-1 scrollbar-thin scrollbar-thumb-white/10 hover:scrollbar-thumb-white/20 select-none"
      >
        {years.map((year, index) => {
          const isSelected = year === selectedYear;

          return (
            <button
              key={year}
              ref={isSelected ? activeBtnRef : null}
              role="tab"
              aria-selected={isSelected}
              tabIndex={isSelected ? 0 : -1}
              onClick={() => onSelectYear(year)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all shrink-0 cursor-pointer ${
                isSelected
                  ? 'bg-amber-500/20 text-amber-300 ring-2 ring-amber-400 shadow-lg shadow-amber-500/20 scale-105'
                  : 'bg-slate-900/60 text-slate-400 hover:text-white hover:bg-slate-800/80 border border-white/5 hover:border-white/20'
              }`}
            >
              {isSelected ? (
                <Trophy className="w-4 h-4 text-amber-400 animate-pulse" />
              ) : (
                <span className="w-1.5 h-1.5 rounded-full bg-slate-600 group-hover:bg-slate-400" />
              )}
              <span>{year}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
