'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import {
  Trophy,
  Shield,
  Medal,
  ChevronUp,
  ChevronDown,
  X,
  Plus,
  Save,
  Check,
  Search,
  Sparkles,
  Gamepad2,
} from 'lucide-react';
import { RankedPosition } from '@/types/game';
import { useLibrary } from '@/context/LibraryContext';
import { fetchUserRankings, saveUserRankings } from '@/lib/api';
import { MOCK_SHELF_GAMES } from '@/lib/mockData';

export interface Top10BuilderProps {
  initialTitle?: string;
  initialPositions?: RankedPosition[];
  onSave?: (title: string, positions: RankedPosition[]) => Promise<void>;
}

export default function Top10Builder({
  initialTitle,
  initialPositions,
  onSave,
}: Top10BuilderProps) {
  const { items: libraryItems } = useLibrary();

  const [title, setTitle] = useState(initialTitle || 'My All-Time Top 10');
  // Array of 10 slots (indices 0..9 corresponding to ranks 1..10)
  const [slots, setSlots] = useState<(RankedPosition | null)[]>(() => {
    const arr: (RankedPosition | null)[] = Array(10).fill(null);
    if (initialPositions && initialPositions.length > 0) {
      initialPositions.slice(0, 10).forEach((pos) => {
        if (pos.rank >= 1 && pos.rank <= 10) {
          arr[pos.rank - 1] = pos;
        }
      });
    }
    return arr;
  });

  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [pickerSlotIndex, setPickerSlotIndex] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Initial load if initialPositions was not provided
  useEffect(() => {
    if (!initialPositions) {
      let isMounted = true;
      fetchUserRankings().then((res) => {
        if (!isMounted) return;
        if (res.title) setTitle(res.title);
        if (res.positions && res.positions.length > 0) {
          const arr: (RankedPosition | null)[] = Array(10).fill(null);
          res.positions.slice(0, 10).forEach((pos) => {
            if (pos.rank >= 1 && pos.rank <= 10) {
              arr[pos.rank - 1] = pos;
            }
          });
          setSlots(arr);
        }
      });
      return () => {
        isMounted = false;
      };
    }
  }, [initialPositions]);

  // Compute available games for the picker dialog
  const availableGames = useMemo(() => {
    const list: { id: string; title: string; cover_url?: string }[] = [];
    const seen = new Set<string>();

    // 1. From User Library
    Object.values(libraryItems).forEach((item) => {
      const idStr = String(item.game_id);
      if (!seen.has(idStr)) {
        seen.add(idStr);
        list.push({
          id: idStr,
          title: item.game_title || `Game ${idStr}`,
          cover_url: item.game_cover_url,
        });
      }
    });

    // 2. From catalog mock games
    const catalog = [
      ...(MOCK_SHELF_GAMES.top_rated || []),
      ...(MOCK_SHELF_GAMES.trending || []),
      ...(MOCK_SHELF_GAMES.new_releases || []),
      ...(MOCK_SHELF_GAMES.hidden_gems || []),
    ];

    catalog.forEach((g) => {
      const idStr = String(g.id || g.steam_appid);
      if (!seen.has(idStr)) {
        seen.add(idStr);
        list.push({
          id: idStr,
          title: g.title,
          cover_url: g.capsule_image || g.header_image,
        });
      }
    });

    return list;
  }, [libraryItems]);

  const filteredCatalog = useMemo(() => {
    if (!searchQuery.trim()) return availableGames;
    const q = searchQuery.toLowerCase().trim();
    return availableGames.filter((g) => g.title.toLowerCase().includes(q));
  }, [availableGames, searchQuery]);

  // Swap slots up
  const handleMoveUp = (index: number) => {
    if (index <= 0) return;
    setSlots((prev) => {
      const updated = [...prev];
      const temp = updated[index - 1];
      updated[index - 1] = updated[index]
        ? { ...updated[index]!, rank: index }
        : null;
      updated[index] = temp
        ? { ...temp, rank: index + 1 }
        : null;
      return updated;
    });
  };

  // Swap slots down
  const handleMoveDown = (index: number) => {
    if (index >= 9) return;
    setSlots((prev) => {
      const updated = [...prev];
      const temp = updated[index + 1];
      updated[index + 1] = updated[index]
        ? { ...updated[index]!, rank: index + 2 }
        : null;
      updated[index] = temp
        ? { ...temp, rank: index + 1 }
        : null;
      return updated;
    });
  };

  // Remove slot
  const handleRemove = (index: number) => {
    setSlots((prev) => {
      const updated = [...prev];
      updated[index] = null;
      return updated;
    });
  };

  // Assign game to slot
  const handleSelectGame = (game: { id: string; title: string; cover_url?: string }) => {
    if (pickerSlotIndex === null) return;
    setSlots((prev) => {
      const updated = [...prev];
      // If game is already in another slot, remove it from that slot first
      for (let i = 0; i < 10; i++) {
        if (updated[i]?.game_id === game.id) {
          updated[i] = null;
        }
      }
      updated[pickerSlotIndex] = {
        game_id: game.id,
        rank: pickerSlotIndex + 1,
        title: game.title,
        cover_url: game.cover_url,
      };
      return updated;
    });
    setPickerSlotIndex(null);
    setSearchQuery('');
  };

  // Save rankings
  const handleSave = async () => {
    setIsSaving(true);
    setSaveSuccess(false);

    // Build dense ranked positions with sequential ranks
    const validPositions: RankedPosition[] = [];
    slots.forEach((item, idx) => {
      if (item) {
        validPositions.push({
          game_id: item.game_id,
          rank: idx + 1,
          title: item.title,
          cover_url: item.cover_url,
        });
      }
    });

    try {
      if (onSave) {
        await onSave(title, validPositions);
      } else {
        await saveUserRankings(title, validPositions);
      }
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to save rankings', err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-8 select-none">
      {/* 1. Header & Title Input */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-slate-900/60 border border-white/10 backdrop-blur-md">
        <div className="space-y-1.5 flex-1 max-w-xl">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-400">
            <Trophy className="w-4 h-4" />
            <span>Personal Hall of Fame</span>
          </div>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            aria-label="Ranked list title"
            className="w-full text-2xl sm:text-3xl font-extrabold text-white bg-transparent border-b border-white/10 focus:border-amber-400 focus:outline-none transition-colors pb-1"
            placeholder="My All-Time Top 10"
          />
          <p className="text-xs text-slate-400">
            Rank and reorder your top 10 masterpieces. Changes can be saved anytime.
          </p>
        </div>

        <button
          onClick={handleSave}
          disabled={isSaving}
          className={`inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm transition-all shadow-lg ${
            saveSuccess
              ? 'bg-emerald-600 text-white shadow-emerald-600/30 ring-2 ring-emerald-400'
              : 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold shadow-amber-500/20 active:scale-95'
          } disabled:opacity-50`}
        >
          {isSaving ? (
            <>
              <span className="w-4 h-4 border-2 border-slate-900 border-t-transparent rounded-full animate-spin" />
              <span>Saving...</span>
            </>
          ) : saveSuccess ? (
            <>
              <Check className="w-4 h-4" />
              <span>Saved!</span>
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              <span>Save Top 10 Rankings</span>
            </>
          )}
        </button>
      </div>

      {/* 2. 10 Stacked Rank Slots */}
      <div className="space-y-3">
        {slots.map((item, index) => {
          const rank = index + 1;

          // Prestige Styling
          let tierBadgeClass = 'bg-slate-800 text-slate-300 border-white/10';
          let borderGlowClass = 'border-white/10 bg-slate-900/40 hover:border-white/20';
          let rankLabel = `#${rank}`;
          let rankIcon: React.ReactNode = null;

          if (rank === 1) {
            tierBadgeClass = 'bg-amber-500 text-slate-950 ring-2 ring-amber-300 font-black';
            borderGlowClass =
              'border-amber-400/50 bg-gradient-to-r from-amber-500/15 via-amber-950/20 to-slate-900/60 shadow-lg shadow-amber-500/10 ring-1 ring-amber-400/30';
            rankLabel = '#1 Champion';
            rankIcon = <Trophy className="w-4 h-4" />;
          } else if (rank === 2) {
            tierBadgeClass = 'bg-slate-300 text-slate-950 ring-2 ring-slate-200 font-black';
            borderGlowClass =
              'border-slate-300/40 bg-gradient-to-r from-slate-400/15 via-slate-800/20 to-slate-900/60 ring-1 ring-slate-300/20';
            rankLabel = '#2 Runner Up';
            rankIcon = <Shield className="w-4 h-4" />;
          } else if (rank === 3) {
            tierBadgeClass = 'bg-amber-700 text-amber-100 ring-2 ring-amber-600 font-black';
            borderGlowClass =
              'border-amber-700/40 bg-gradient-to-r from-amber-700/15 via-amber-950/20 to-slate-900/60 ring-1 ring-amber-700/20';
            rankLabel = '#3 Third Place';
            rankIcon = <Medal className="w-4 h-4" />;
          }

          return (
            <div
              key={rank}
              data-testid={`rank-slot-${rank}`}
              className={`flex items-center justify-between gap-4 p-4 rounded-xl border transition-all ${borderGlowClass}`}
            >
              {/* Rank Badge & Game Information */}
              <div className="flex items-center gap-4 flex-1 min-w-0">
                {/* Badge */}
                <div
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold shrink-0 ${tierBadgeClass}`}
                >
                  {rankIcon}
                  <span>{rankLabel}</span>
                </div>

                {/* Game Details or Vacant Placeholder */}
                {item ? (
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    {item.cover_url && (
                      <div className="relative w-14 h-9 rounded-md overflow-hidden bg-slate-800 shrink-0 border border-white/10">
                        <Image
                          src={item.cover_url}
                          alt={item.title || 'Game Cover'}
                          fill
                          className="object-cover"
                          unoptimized
                        />
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <h4 className="text-base font-bold text-white truncate">
                        {item.title || `Game ${item.game_id}`}
                      </h4>
                      <p className="text-xs text-slate-400">ID: {item.game_id}</p>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setPickerSlotIndex(index)}
                    className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors py-1.5 px-3 rounded-lg border border-dashed border-white/10 hover:border-amber-400/50 hover:bg-white/5"
                  >
                    <Plus className="w-4 h-4 text-amber-400" />
                    <span>Assign game to slot #{rank}</span>
                  </button>
                )}
              </div>

              {/* Slot Actions */}
              <div className="flex items-center gap-1.5 shrink-0">
                {/* Move Up */}
                <button
                  onClick={() => handleMoveUp(index)}
                  disabled={index === 0}
                  aria-label={`Move rank ${rank} up`}
                  className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white disabled:opacity-20 disabled:hover:bg-slate-800 disabled:hover:text-slate-300 transition-colors"
                >
                  <ChevronUp className="w-4 h-4" />
                </button>

                {/* Move Down */}
                <button
                  onClick={() => handleMoveDown(index)}
                  disabled={index === 9}
                  aria-label={`Move rank ${rank} down`}
                  className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white disabled:opacity-20 disabled:hover:bg-slate-800 disabled:hover:text-slate-300 transition-colors"
                >
                  <ChevronDown className="w-4 h-4" />
                </button>

                {/* Replace or Remove */}
                {item ? (
                  <>
                    <button
                      onClick={() => setPickerSlotIndex(index)}
                      className="text-xs font-semibold px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                    >
                      Change
                    </button>
                    <button
                      onClick={() => handleRemove(index)}
                      aria-label={`Remove game from rank ${rank}`}
                      className="p-2 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>

      {/* 3. Game Selector Modal */}
      {pickerSlotIndex !== null && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md"
        >
          <div className="w-full max-w-lg rounded-2xl bg-slate-900 border border-white/10 shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-5 border-b border-white/10">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-400" />
                <h3 className="text-lg font-bold text-white">
                  Select Game for Rank #{pickerSlotIndex + 1}
                </h3>
              </div>
              <button
                onClick={() => setPickerSlotIndex(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Search Input */}
            <div className="p-4 border-b border-white/5">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search catalog or your library..."
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-800/80 border border-white/10 text-white placeholder-slate-400 text-sm focus:outline-none focus:border-amber-400"
                  autoFocus
                />
              </div>
            </div>

            {/* Game Options List */}
            <div className="overflow-y-auto p-4 space-y-2 flex-1">
              {filteredCatalog.length > 0 ? (
                filteredCatalog.map((g) => (
                  <button
                    key={g.id}
                    onClick={() => handleSelectGame(g)}
                    className="w-full flex items-center gap-3 p-2.5 rounded-xl bg-slate-800/40 hover:bg-slate-800 border border-white/5 hover:border-amber-400/40 text-left transition-all group"
                  >
                    {g.cover_url ? (
                      <div className="relative w-12 h-8 rounded-md overflow-hidden bg-slate-700 shrink-0">
                        <Image
                          src={g.cover_url}
                          alt={g.title}
                          fill
                          className="object-cover"
                          unoptimized
                        />
                      </div>
                    ) : (
                      <div className="w-12 h-8 rounded-md bg-slate-700 flex items-center justify-center text-slate-400 shrink-0">
                        <Gamepad2 className="w-4 h-4" />
                      </div>
                    )}
                    <span className="text-sm font-semibold text-white group-hover:text-amber-400 transition-colors truncate">
                      {g.title}
                    </span>
                  </button>
                ))
              ) : (
                <div className="text-center py-8 text-sm text-slate-400">
                  No games match &quot;{searchQuery}&quot;
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-white/10 flex justify-end">
              <button
                onClick={() => setPickerSlotIndex(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-sm font-medium text-slate-200 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
