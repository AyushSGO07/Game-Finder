'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  X,
  Home,
  Sparkles,
  Trophy,
  Library,
  User,
  Gamepad2,
  Search,
  LogOut,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

interface MobileNavProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenSearch?: () => void;
}

export const MOBILE_TABS = [
  { name: 'Home', href: '/', icon: Home },
  { name: 'Finder', href: '/finder', icon: Sparkles },
  { name: 'GOTY', href: '/goty', icon: Trophy },
  { name: 'Library', href: '/library', icon: Library },
];

export default function MobileNav({ isOpen, onClose, onOpenSearch }: MobileNavProps) {
  const pathname = usePathname() || '/';

  let auth = {
    isAuthenticated: false,
    user: null as any,
    profile: null as any,
    logout: async () => {},
  };
  try {
    auth = useAuth();
  } catch {
    // Fallback if rendered outside AuthProvider in isolated tests
  }
  const { isAuthenticated, user, profile, logout } = auth;

  // Prevent background scrolling when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    }
  }, [isOpen]);

  return (
    <>
      {/* 1. Slide-out Mobile Drawer */}
      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Mobile Navigation Menu"
          className="fixed inset-0 z-50 md:hidden flex justify-end"
        >
          {/* Backdrop overlay */}
          <div
            data-testid="drawer-backdrop"
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
          />

          {/* Drawer Content Panel */}
          <aside className="relative w-4/5 max-w-sm h-full bg-slate-950 border-l border-white/10 p-6 flex flex-col justify-between shadow-2xl z-10 overflow-y-auto">
            {/* Top header */}
            <div>
              <div className="flex items-center justify-between pb-6 border-b border-white/10">
                <Link
                  href="/"
                  onClick={onClose}
                  className="flex items-center gap-2"
                >
                  <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
                    <Gamepad2 className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-lg font-bold text-white">
                    Game<span className="text-indigo-400">Finder</span>
                  </span>
                </Link>

                <button
                  type="button"
                  onClick={onClose}
                  aria-label="Close menu"
                  className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Search button in mobile drawer */}
              <div className="pt-4">
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenSearch?.();
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-slate-900 border border-white/10 text-slate-300 hover:bg-slate-800 text-sm font-medium transition-all"
                >
                  <Search className="w-5 h-5 text-indigo-400" />
                  <span>Search all games...</span>
                </button>
              </div>

              {/* Navigation list */}
              <nav className="mt-6 flex flex-col gap-2" aria-label="Mobile Drawer Navigation">
                {MOBILE_TABS.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = pathname === tab.href;
                  return (
                    <Link
                      key={tab.href}
                      href={tab.href}
                      onClick={onClose}
                      className={`flex items-center gap-3.5 px-4 py-3 rounded-xl text-base font-medium transition-colors ${
                        isActive
                          ? 'bg-indigo-600/20 text-indigo-400 font-semibold border border-indigo-500/30'
                          : 'text-slate-300 hover:text-white hover:bg-white/5'
                      }`}
                      aria-current={isActive ? 'page' : undefined}
                    >
                      <Icon className="w-5 h-5" />
                      <span>{tab.name}</span>
                    </Link>
                  );
                })}
              </nav>
            </div>

            {/* Bottom Actions */}
            <div className="pt-6 border-t border-white/10 flex flex-col gap-3">
              {isAuthenticated ? (
                <>
                  <div className="px-1 text-xs text-slate-400">
                    Signed in as <span className="text-white font-medium">{profile?.display_name || user?.username}</span>
                  </div>
                  <Link
                    href="/profile"
                    onClick={onClose}
                    className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-slate-850 border border-white/10 hover:bg-slate-800 text-white font-medium transition-all"
                  >
                    <User className="w-5 h-5 text-indigo-400" />
                    <span>Profile & Settings</span>
                  </Link>
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      logout();
                    }}
                    className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 text-sm font-medium transition-all"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                </>
              ) : (
                <Link
                  href="/auth"
                  onClick={onClose}
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium shadow-lg shadow-indigo-600/25 transition-all"
                >
                  <User className="w-5 h-5" />
                  <span>Sign In / Sign Up</span>
                </Link>
              )}
            </div>
          </aside>
        </div>
      )}

      {/* 2. Persistent Mobile Bottom Navigation Bar */}
      <nav
        aria-label="Mobile Bottom Navigation"
        className="fixed bottom-0 left-0 right-0 h-16 md:hidden bg-slate-950/95 border-t border-white/10 backdrop-blur-md flex items-center justify-around px-2 z-40"
      >
        {MOBILE_TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = pathname === tab.href;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex flex-col items-center justify-center min-w-[54px] min-h-[48px] py-1 rounded-lg text-xs font-medium transition-colors ${
                isActive
                  ? 'text-indigo-400 font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              aria-current={isActive ? 'page' : undefined}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5]' : 'stroke-2'}`} />
              <span className="mt-0.5">{tab.name}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
