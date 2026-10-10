'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  User,
  Mail,
  Shield,
  Save,
  LogOut,
  Library,
  Sparkles,
  Gamepad2,
  CheckCircle2,
  AlertCircle,
  Eye,
  Sliders,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { ALLOWED_GENRES, ALLOWED_DIFFICULTIES } from '@/types/game';

const AVAILABLE_PLATFORMS = ['PC', 'PlayStation', 'Xbox', 'Nintendo Switch', 'Steam Deck'];

export default function ProfilePage() {
  const router = useRouter();
  const { user, profile, isAuthenticated, isLoading, updateProfile, logout } = useAuth();

  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [favoriteGenres, setFavoriteGenres] = useState<string[]>([]);
  const [preferredPlatforms, setPreferredPlatforms] = useState<string[]>([]);
  const [defaultDifficulty, setDefaultDifficulty] = useState('Normal');
  const [isPublic, setIsPublic] = useState(true);
  const [showLibrary, setShowLibrary] = useState(true);
  const [showFavorites, setShowFavorites] = useState(true);

  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Synchronize state with current profile
  useEffect(() => {
    if (profile) {
      setDisplayName(profile.display_name || user?.username || '');
      setBio(profile.bio || '');
      setFavoriteGenres(profile.favorite_genres || []);
      setPreferredPlatforms(profile.preferred_platforms || ['PC']);
      setDefaultDifficulty(profile.default_difficulty || 'Normal');
      setIsPublic(profile.is_public ?? true);
      setShowLibrary(profile.show_library ?? true);
      setShowFavorites(profile.show_favorites ?? true);
    } else if (user) {
      setDisplayName(user.username || '');
    }
  }, [profile, user]);

  const toggleGenre = (genre: string) => {
    if (favoriteGenres.includes(genre)) {
      setFavoriteGenres(favoriteGenres.filter((g) => g !== genre));
    } else {
      if (favoriteGenres.length < 5) {
        setFavoriteGenres([...favoriteGenres, genre]);
      }
    }
  };

  const togglePlatform = (plat: string) => {
    if (preferredPlatforms.includes(plat)) {
      setPreferredPlatforms(preferredPlatforms.filter((p) => p !== plat));
    } else {
      setPreferredPlatforms([...preferredPlatforms, plat]);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveSuccess(false);
    setErrorMessage(null);

    try {
      await updateProfile({
        display_name: displayName.trim() || undefined,
        bio: bio.trim() || undefined,
        favorite_genres: favoriteGenres,
        preferred_platforms: preferredPlatforms,
        default_difficulty: defaultDifficulty,
        is_public: isPublic,
        show_library: showLibrary,
        show_favorites: showFavorites,
      });

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'An unexpected error occurred while saving.';
      setErrorMessage(msg);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-slate-900/80 border border-white/10 rounded-3xl p-8 text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center mx-auto">
            <User className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-white">Sign In Required</h2>
          <p className="text-sm text-slate-400">
            Please log in or create an account to view and customize your gaming profile.
          </p>
          <div className="pt-2">
            <Link
              href="/auth?redirect=/profile"
              className="inline-flex items-center justify-center px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm transition-all shadow-lg shadow-indigo-600/25"
            >
              Sign In to Continue
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 animate-fadeIn">
      {/* Top Profile Header Card */}
      <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-3xl p-6 sm:p-8 relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row items-center sm:items-start justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-indigo-600 to-indigo-400 p-0.5 shadow-xl shadow-indigo-500/20">
              <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center text-2xl font-black text-indigo-300">
                {profile?.avatar_url ? (
                  <img
                    src={profile.avatar_url}
                    alt=""
                    className="w-full h-full object-cover rounded-[14px]"
                  />
                ) : (
                  (displayName || user.username || 'G')[0].toUpperCase()
                )}
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-center sm:justify-start gap-2">
                <h1 className="text-2xl font-bold text-white">
                  {displayName || user.username}
                </h1>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
                  {user.role || 'Member'}
                </span>
              </div>
              <p className="text-xs text-slate-400 flex items-center justify-center sm:justify-start gap-1.5">
                <Mail className="w-3.5 h-3.5 text-slate-500" />
                <span>{user.email}</span>
              </p>
              {bio && <p className="text-sm text-slate-300 mt-2 max-w-lg">{bio}</p>}
            </div>
          </div>

          {/* Quick Hub Navigation & Sign Out */}
          <div className="flex flex-wrap items-center justify-center sm:justify-end gap-2.5">
            <Link
              href="/library"
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 border border-white/10 text-xs font-medium text-slate-200 transition-all"
            >
              <Library className="w-3.5 h-3.5 text-emerald-400" />
              <span>Library</span>
            </Link>
            <button
              type="button"
              onClick={() => {
                logout();
                router.push('/');
              }}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-xs font-medium text-rose-300 transition-all"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </div>

      {/* Profile Edit Form */}
      <form onSubmit={handleSave} className="space-y-6">
        {/* Feedback alerts */}
        {saveSuccess && (
          <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-3 text-emerald-300 text-sm">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <span>Profile and gaming preferences successfully updated!</span>
          </div>
        )}
        {errorMessage && (
          <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center gap-3 text-rose-300 text-sm">
            <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Column 1 & 2: Main Personalization Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Identity Info Panel */}
            <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-3xl p-6 space-y-4">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <User className="w-4 h-4 text-indigo-400" />
                <span>Personal Identity</span>
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="text-xs font-medium text-slate-300 block mb-1.5">
                    Display Name
                  </label>
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="e.g. CyberValkyrie"
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950/70 border border-white/10 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-slate-300 block mb-1.5">
                    Bio / Gaming Philosophy
                  </label>
                  <textarea
                    rows={3}
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Tell other gamers what kind of adventures you love..."
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950/70 border border-white/10 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                  />
                </div>
              </div>
            </div>

            {/* AI Preferences: Favorite Genres */}
            <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-3xl p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-indigo-400" />
                  <span>Favorite Genres (Up to 5)</span>
                </h2>
                <span className="text-xs text-slate-400">
                  {favoriteGenres.length}/5 selected
                </span>
              </div>

              <div className="flex flex-wrap gap-2">
                {ALLOWED_GENRES.filter((g) => g !== 'Any').map((genre) => {
                  const isSelected = favoriteGenres.includes(genre);
                  return (
                    <button
                      key={genre}
                      type="button"
                      onClick={() => toggleGenre(genre)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${
                        isSelected
                          ? 'bg-indigo-600/30 text-indigo-300 border-indigo-500/50 shadow-sm shadow-indigo-500/20'
                          : 'bg-slate-950/50 text-slate-400 border-white/5 hover:border-white/20 hover:text-white'
                      }`}
                    >
                      {genre}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Preferred Platforms */}
            <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-3xl p-6 space-y-4">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Gamepad2 className="w-4 h-4 text-indigo-400" />
                <span>Preferred Platforms</span>
              </h2>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {AVAILABLE_PLATFORMS.map((plat) => {
                  const isSelected = preferredPlatforms.includes(plat);
                  return (
                    <button
                      key={plat}
                      type="button"
                      onClick={() => togglePlatform(plat)}
                      className={`p-3 rounded-xl border text-center text-xs font-semibold transition-all ${
                        isSelected
                          ? 'bg-indigo-600/25 border-indigo-500/50 text-indigo-200'
                          : 'bg-slate-950/50 border-white/5 text-slate-400 hover:text-white hover:border-white/20'
                      }`}
                    >
                      {plat}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Column 3: Playstyle & Privacy Settings */}
          <div className="space-y-6">
            {/* Playstyle Challenge */}
            <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-3xl p-6 space-y-4">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Sliders className="w-4 h-4 text-indigo-400" />
                <span>Default Challenge</span>
              </h2>

              <div className="space-y-2">
                {ALLOWED_DIFFICULTIES.filter((d) => d !== 'Any').map((diff) => {
                  const isSelected = defaultDifficulty === diff;
                  return (
                    <button
                      key={diff}
                      type="button"
                      onClick={() => setDefaultDifficulty(diff)}
                      className={`w-full p-3 rounded-xl border text-left text-xs font-medium transition-all flex items-center justify-between ${
                        isSelected
                          ? 'bg-indigo-600/25 border-indigo-500/50 text-white'
                          : 'bg-slate-950/50 border-white/5 text-slate-400 hover:text-white'
                      }`}
                    >
                      <span>{diff}</span>
                      {isSelected && <CheckCircle2 className="w-4 h-4 text-indigo-400" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Privacy Toggles */}
            <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-3xl p-6 space-y-4">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Eye className="w-4 h-4 text-indigo-400" />
                <span>Privacy & Sharing</span>
              </h2>

              <div className="space-y-3">
                <label className="flex items-center justify-between p-3 rounded-xl bg-slate-950/50 border border-white/5 cursor-pointer">
                  <span className="text-xs text-slate-300">Public Profile</span>
                  <input
                    type="checkbox"
                    checked={isPublic}
                    onChange={(e) => setIsPublic(e.target.checked)}
                    className="w-4 h-4 rounded text-indigo-600 bg-slate-900 border-white/20 focus:ring-indigo-500"
                  />
                </label>

                <label className="flex items-center justify-between p-3 rounded-xl bg-slate-950/50 border border-white/5 cursor-pointer">
                  <span className="text-xs text-slate-300">Display Library</span>
                  <input
                    type="checkbox"
                    checked={showLibrary}
                    onChange={(e) => setShowLibrary(e.target.checked)}
                    className="w-4 h-4 rounded text-indigo-600 bg-slate-900 border-white/20 focus:ring-indigo-500"
                  />
                </label>

                <label className="flex items-center justify-between p-3 rounded-xl bg-slate-950/50 border border-white/5 cursor-pointer">
                  <span className="text-xs text-slate-300">Display Favorites</span>
                  <input
                    type="checkbox"
                    checked={showFavorites}
                    onChange={(e) => setShowFavorites(e.target.checked)}
                    className="w-4 h-4 rounded text-indigo-600 bg-slate-900 border-white/20 focus:ring-indigo-500"
                  />
                </label>
              </div>
            </div>

            {/* Save Button */}
            <button
              type="submit"
              disabled={isSaving}
              className="w-full py-3.5 px-4 rounded-2xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold text-sm shadow-xl shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all"
            >
              {isSaving ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Save Preferences</span>
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
