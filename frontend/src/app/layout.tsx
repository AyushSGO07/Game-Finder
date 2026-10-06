import type { Metadata } from 'next';
import './globals.css';
import AppShell from '@/components/layout/AppShell';

export const metadata: Metadata = {
  title: 'Game Finder — Discover Your Next Great Game',
  description: 'AI-powered game recommendations, store discovery, and personal gaming library tracking.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-[#090a0f] text-slate-100 antialiased selection:bg-indigo-500/30 selection:text-indigo-200">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
