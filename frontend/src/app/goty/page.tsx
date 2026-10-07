'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Trophy, Sparkles, Flame, History } from 'lucide-react';
import { GotyYearArchive } from '@/types/game';
import { fetchGotyArchive } from '@/lib/api';
import { MOCK_GOTY_ARCHIVE } from '@/lib/mockData';
import GotyTimeline from '@/components/goty/GotyTimeline';
import GotyWinnerCard from '@/components/goty/GotyWinnerCard';
import GotyNominees from '@/components/goty/GotyNominees';

export default function GotyPage() {
  const [archive, setArchive] = useState<GotyYearArchive[]>(MOCK_GOTY_ARCHIVE);
  const [selectedYear, setSelectedYear] = useState<number>(2024);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);
    fetchGotyArchive()
      .then((data) => {
        if (!isMounted) return;
        if (data && data.length > 0) {
          setArchive(data);
          // Default to latest year if current selectedYear isn't available
          if (!data.some((d) => d.year === selectedYear)) {
            setSelectedYear(data[0].year);
          }
        }
      })
      .catch((err) => {
        console.error('Failed to load GOTY archive', err);
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const years = useMemo(() => {
    return [...archive.map((a) => a.year)].sort((a, b) => b - a); // 2024 down to 2014
  }, [archive]);

  const activeEntry = useMemo(() => {
    return archive.find((a) => a.year === selectedYear) || archive[0];
  }, [archive, selectedYear]);

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-10 select-none">
      {/* 1. Page Header & Hero Banner */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-white/10">
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-300 border border-amber-500/30 shadow-sm shadow-amber-500/10">
            <Trophy className="w-3.5 h-3.5 text-amber-400" />
            <span>The Game Awards Archive</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            Game of the Year Hall of Fame
          </h1>
          <p className="text-sm sm:text-base text-slate-400 max-w-2xl leading-relaxed">
            Relive gaming history from 2014 to present. Explore legendary winners, official nominees,
            and seamlessly add all-time masterpieces to your personal library.
          </p>
        </div>

        <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-slate-900/60 border border-white/10 text-xs text-slate-300 self-start md:self-auto shrink-0">
          <History className="w-4 h-4 text-amber-400" />
          <span>Curated Era: 2014 – Present</span>
        </div>
      </div>

      {/* 2. Interactive Year Timeline */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs text-slate-400 px-1">
          <span className="font-semibold uppercase tracking-wider text-slate-400">
            Select Ceremony Year:
          </span>
          <span className="text-amber-400 font-medium">
            Active: {selectedYear}
          </span>
        </div>
        <GotyTimeline
          years={years}
          selectedYear={selectedYear}
          onSelectYear={setSelectedYear}
        />
      </div>

      {/* 3. Winner Spotlight Hero Card */}
      {activeEntry && (
        <div className="space-y-8">
          <GotyWinnerCard
            winner={activeEntry.winner}
            year={activeEntry.year}
            awardName={activeEntry.award_name}
          />

          {/* 4. Official Nominees Section */}
          <GotyNominees
            nominees={activeEntry.nominees}
            year={activeEntry.year}
          />
        </div>
      )}
    </div>
  );
}
