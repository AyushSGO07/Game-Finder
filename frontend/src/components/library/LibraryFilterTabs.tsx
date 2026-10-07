'use client';

import React from 'react';
import { ShelfStatus } from '@/types/game';
import { Bookmark, Clock, Gamepad2, Layers, Trophy, ShieldAlert } from 'lucide-react';

export interface LibraryFilterTabsProps {
  activeTab: ShelfStatus | 'all';
  onTabChange: (tab: ShelfStatus | 'all') => void;
  counts: Record<ShelfStatus | 'all', number>;
}

interface TabConfig {
  id: ShelfStatus | 'all';
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  accentColor: string;
}

const TABS: TabConfig[] = [
  { id: 'all', label: 'All Games', icon: Layers, accentColor: 'indigo' },
  { id: 'playing', label: 'Currently Playing', icon: Gamepad2, accentColor: 'emerald' },
  { id: 'wishlist', label: 'Wishlist', icon: Bookmark, accentColor: 'indigo' },
  { id: 'backlog', label: 'Backlog', icon: Clock, accentColor: 'amber' },
  { id: 'completed', label: 'Completed', icon: Trophy, accentColor: 'cyan' },
  { id: 'dropped', label: 'Dropped', icon: ShieldAlert, accentColor: 'slate' },
];

export default function LibraryFilterTabs({
  activeTab,
  onTabChange,
  counts,
}: LibraryFilterTabsProps) {
  return (
    <div
      role="tablist"
      aria-label="Filter games by shelf"
      className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none select-none"
    >
      {TABS.map((tab) => {
        const isActive = activeTab === tab.id;
        const Icon = tab.icon;
        const count = counts[tab.id] || 0;

        return (
          <button
            key={tab.id}
            role="tab"
            aria-selected={isActive}
            aria-controls={`shelf-${tab.id}`}
            onClick={() => onTabChange(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all shrink-0 border focus:outline-none focus:ring-2 focus:ring-indigo-400 ${
              isActive
                ? 'bg-indigo-600 text-white border-indigo-500 shadow-lg shadow-indigo-600/30'
                : 'bg-slate-900/60 hover:bg-slate-800/80 text-slate-300 hover:text-white border-white/10'
            }`}
          >
            <Icon className="w-4 h-4 shrink-0" />
            <span>{tab.label}</span>
            <span
              className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                isActive
                  ? 'bg-white/20 text-white'
                  : 'bg-white/5 text-slate-400 border border-white/5'
              }`}
            >
              {count}
            </span>
          </button>
        );
      })}
    </div>
  );
}
