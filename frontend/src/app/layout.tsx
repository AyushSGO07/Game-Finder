import type { Metadata } from 'next';
import './globals.css';

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
      <body className="min-h-screen bg-[#090a0f] text-slate-100 antialiased selection:bg-indigo-500/30 selection:text-indigo-200 flex flex-col">
        <div id="app-root" className="flex flex-col min-h-screen">
          <main id="main-content" className="flex-1 pb-16">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
