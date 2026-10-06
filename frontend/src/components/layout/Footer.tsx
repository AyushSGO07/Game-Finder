import React from 'react';
import Link from 'next/link';
import { Gamepad2, Heart } from 'lucide-react';
import { NAV_LINKS } from './Navbar';

export default function Footer() {
  return (
    <footer className="w-full bg-slate-950 border-t border-white/5 py-12 px-4 sm:px-6 lg:px-8 mt-auto">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        {/* Brand & Mission */}
        <div className="flex flex-col items-center md:items-start gap-2">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
              <Gamepad2 className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-bold text-white">
              Game<span className="text-indigo-400">Finder</span>
            </span>
          </Link>
          <p className="text-xs text-slate-500 max-w-sm text-center md:text-left">
            Discover the perfect game to play next through intelligent AI recommendations and rich game exploration.
          </p>
        </div>

        {/* Footer Navigation Links */}
        <div className="flex flex-wrap justify-center gap-6 text-sm text-slate-400">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="hover:text-indigo-400 transition-colors"
            >
              {link.name}
            </Link>
          ))}
        </div>

        {/* Copyright & Disclaimer */}
        <div className="text-xs text-slate-500 text-center md:text-right">
          <p className="flex items-center justify-center md:justify-end gap-1">
            Built with <Heart className="w-3 h-3 text-red-500 fill-red-500" /> for passionate gamers.
          </p>
          <p className="mt-1">© {new Date().getFullYear()} Game Finder. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
