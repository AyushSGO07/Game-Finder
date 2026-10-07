'use client';

import React, { useState } from 'react';
import Navbar from './Navbar';
import MobileNav from './MobileNav';
import SearchModal from './SearchModal';
import Footer from './Footer';
import { LibraryProvider } from '@/context/LibraryContext';

interface AppShellProps {
  children: React.ReactNode;
}

export default function AppShell({ children }: AppShellProps) {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <LibraryProvider>
      <div id="app-root" className="flex flex-col min-h-screen">
      <Navbar
        onOpenSearch={() => setIsSearchOpen(true)}
        onToggleMobileMenu={() => setIsMobileMenuOpen((prev) => !prev)}
      />
      <MobileNav
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        onOpenSearch={() => setIsSearchOpen(true)}
      />
      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
      />
      <main id="main-content" className="flex-1 pb-16 md:pb-8">
        {children}
      </main>
      <Footer />
    </div>
    </LibraryProvider>
  );
}
