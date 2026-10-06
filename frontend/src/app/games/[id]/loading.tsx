import React from 'react';

export default function GameDetailLoading() {
  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-pulse space-y-8">
      {/* Header Skeleton */}
      <div className="space-y-4 pb-6 border-b border-white/5">
        <div className="flex gap-2">
          <div className="w-20 h-6 bg-slate-800 rounded-full" />
          <div className="w-28 h-6 bg-slate-800 rounded-full" />
        </div>
        <div className="w-2/3 h-12 bg-slate-800 rounded-xl" />
        <div className="w-1/3 h-4 bg-slate-850 rounded" />
      </div>

      {/* Main Grid Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left 8 Columns */}
        <div className="lg:col-span-8 space-y-6">
          <div className="aspect-video w-full bg-slate-900 rounded-2xl border border-white/5" />
          <div className="flex gap-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="w-32 aspect-video bg-slate-900 rounded-xl" />
            ))}
          </div>
          <div className="h-40 bg-slate-900 rounded-2xl p-6" />
          <div className="h-64 bg-slate-900 rounded-2xl p-6" />
        </div>

        {/* Right 4 Columns */}
        <div className="lg:col-span-4 space-y-6">
          <div className="aspect-[4/3] w-full bg-slate-900 rounded-2xl" />
          <div className="h-48 bg-slate-900 rounded-2xl" />
          <div className="h-32 bg-slate-900 rounded-2xl" />
        </div>
      </div>
    </div>
  );
}
