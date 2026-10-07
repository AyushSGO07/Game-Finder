'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Bookmark, Check, ChevronDown, Clock, Gamepad2, Trophy, X, ShieldAlert } from 'lucide-react';
import { ShelfStatus } from '@/types/game';
import { useLibrary } from '@/context/LibraryContext';

export interface ShelfOption {
  status: ShelfStatus | 'remove';
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  colorClass: string;
  badgeClass: string;
}

export const SHELF_OPTIONS: ShelfOption[] = [
  {
    status: 'playing',
    label: 'Currently Playing',
    icon: Gamepad2,
    colorClass: 'text-emerald-400',
    badgeClass: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
  },
  {
    status: 'wishlist',
    label: 'Wishlist',
    icon: Bookmark,
    colorClass: 'text-indigo-400',
    badgeClass: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40',
  },
  {
    status: 'backlog',
    label: 'Backlog',
    icon: Clock,
    colorClass: 'text-amber-400',
    badgeClass: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
  },
  {
    status: 'completed',
    label: 'Completed',
    icon: Trophy,
    colorClass: 'text-cyan-400',
    badgeClass: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
  },
  {
    status: 'dropped',
    label: 'Dropped',
    icon: ShieldAlert,
    colorClass: 'text-slate-400',
    badgeClass: 'bg-slate-500/20 text-slate-300 border-slate-500/40',
  },
  {
    status: 'remove',
    label: 'Remove from Library',
    icon: X,
    colorClass: 'text-rose-400',
    badgeClass: 'text-rose-300 hover:bg-rose-500/10',
  },
];

interface GameLike {
  id: string | number;
  title?: string;
  header_image?: string;
  capsule_image?: string;
  slug?: string;
}

export interface ShelfSelectorProps {
  game: GameLike;
  currentStatus?: ShelfStatus | null;
  onStatusChange?: (status: ShelfStatus | null) => void;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export default function ShelfSelector({
  game,
  currentStatus: propStatus,
  onStatusChange,
  size = 'md',
  className = '',
}: ShelfSelectorProps) {
  const { getGameItem, shelveGame, removeGame } = useLibrary();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const libraryItem = getGameItem(game.id);
  const effectiveStatus = propStatus !== undefined ? propStatus : libraryItem?.status || null;

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleSelect = async (opt: ShelfOption, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsOpen(false);

    if (opt.status === 'remove') {
      onStatusChange?.(null);
      await removeGame(game.id);
    } else {
      onStatusChange?.(opt.status as ShelfStatus);
      await shelveGame(game, opt.status as ShelfStatus);
    }
  };

  const handleToggleOpen = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsOpen((prev) => !prev);
  };

  const currentOption = SHELF_OPTIONS.find((opt) => opt.status === effectiveStatus);

  const sizeClasses = {
    sm: 'text-xs px-2.5 py-1.5 gap-1.5',
    md: 'text-sm px-4 py-2 gap-2',
    lg: 'text-base px-5 py-2.5 gap-2.5',
  }[size];

  return (
    <div
      ref={containerRef}
      className={`relative inline-block text-left select-none ${className}`}
      onClick={(e) => e.stopPropagation()}
    >
      <button
        type="button"
        onClick={handleToggleOpen}
        aria-haspopup="true"
        aria-expanded={isOpen}
        aria-label={currentOption ? `Shelf: ${currentOption.label}` : 'Add to Shelf'}
        className={`flex items-center justify-between font-semibold rounded-xl border transition-all shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-400 ${sizeClasses} ${
          currentOption
            ? `${currentOption.badgeClass} backdrop-blur-md`
            : 'bg-indigo-600 hover:bg-indigo-500 border-indigo-500/50 text-white shadow-indigo-600/25'
        }`}
      >
        <div className="flex items-center gap-1.5 truncate">
          {currentOption ? (
            <>
              <currentOption.icon className="w-4 h-4 shrink-0" />
              <span className="truncate">{currentOption.label}</span>
            </>
          ) : (
            <>
              <Bookmark className="w-4 h-4 shrink-0" />
              <span>+ Add to Shelf</span>
            </>
          )}
        </div>
        <ChevronDown
          className={`w-3.5 h-3.5 shrink-0 transition-transform duration-200 ml-1.5 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {isOpen && (
        <div
          role="menu"
          aria-orientation="vertical"
          className="absolute left-0 mt-2 w-56 rounded-xl bg-slate-900/95 border border-white/10 shadow-2xl backdrop-blur-xl p-1.5 z-50 ring-1 ring-black/50 animate-in fade-in zoom-in-95 duration-100"
        >
          <div className="px-2 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400 border-b border-white/5 mb-1">
            Choose Shelf
          </div>
          {SHELF_OPTIONS.map((opt) => {
            if (opt.status === 'remove' && !effectiveStatus) {
              return null; // Don't show "Remove" if not on any shelf
            }

            const isSelected = effectiveStatus === opt.status;
            const Icon = opt.icon;

            return (
              <button
                key={opt.status}
                type="button"
                role="menuitem"
                onClick={(e) => handleSelect(opt, e)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
                  isSelected
                    ? 'bg-white/10 text-white font-semibold'
                    : 'text-slate-300 hover:bg-white/5 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2 truncate">
                  <Icon className={`w-4 h-4 ${opt.colorClass}`} />
                  <span className="truncate">{opt.label}</span>
                </div>
                {isSelected && <Check className="w-4 h-4 text-emerald-400 shrink-0" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
