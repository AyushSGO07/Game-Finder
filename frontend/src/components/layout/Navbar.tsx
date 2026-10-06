'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Gamepad2, Search, User, Menu } from 'lucide-react';

interface NavbarProps {
  onOpenSearch?: () => void;
  onToggleMobileMenu?: () => void;
}

export const NAV_LINKS = [
  { name: 'Home', href: '/' },
  { name: 'Discover', href: '/discover' },
  { name: 'AI Finder', href: '/finder' },
  { name: 'GOTY', href: '/goty' },
  { name: 'My Library', href: '/library' },
];

export default function Navbar({ onOpenSearch, onToggleMobileMenu }: NavbarProps) {
  const pathname = usePathname() || '/';

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-slate-950/80 border-b border-white/5 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Left: Brand Logo */}
        <div className="flex items-center gap-6">
          <Link
            href="/"
            className="flex items-center gap-2.5 group focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded-lg p-1"
            aria-label="Game Finder Home"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-400 flex items-center justify-center shadow-lg shadow-indigo-500/25 group-hover:shadow-indigo-500/40 transition-shadow">
              <Gamepad2 className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight text-white group-hover:text-indigo-200 transition-colors">
              Game<span className="text-indigo-400">Finder</span>
            </span>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1" aria-label="Main Navigation">
            {NAV_LINKS.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? 'text-indigo-400 bg-indigo-500/10 font-semibold'
                      : 'text-slate-300 hover:text-white hover:bg-white/5'
                  }`}
                  aria-current={isActive ? 'page' : undefined}
                >
                  {link.name}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Right: Search Trigger & Auth CTA */}
        <div className="flex items-center gap-3">
          {/* Quick Search Button */}
          <button
            type="button"
            onClick={onOpenSearch}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-slate-900/80 hover:bg-slate-800 border border-white/10 text-slate-400 hover:text-slate-200 text-sm transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm"
            aria-label="Search games (Ctrl+K)"
          >
            <Search className="w-4 h-4 text-slate-400" />
            <span className="hidden sm:inline">Search games...</span>
            <kbd className="hidden sm:inline-flex items-center px-1.5 py-0.5 text-[11px] font-mono text-slate-400 bg-slate-800 border border-slate-700 rounded shadow-xs">
              ⌘K
            </kbd>
          </button>

          {/* User Sign In / Profile CTA */}
          <Link
            href="/auth"
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium shadow-md shadow-indigo-600/25 hover:shadow-indigo-600/40 transition-all focus:outline-none focus:ring-2 focus:ring-indigo-400"
            aria-label="Sign In or Account"
          >
            <User className="w-4 h-4" />
            <span className="hidden sm:inline">Sign In</span>
          </Link>

          {/* Mobile Menu Hamburger Toggle */}
          <button
            type="button"
            onClick={onToggleMobileMenu}
            className="md:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            aria-label="Open mobile navigation menu"
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </div>
    </header>
  );
}
