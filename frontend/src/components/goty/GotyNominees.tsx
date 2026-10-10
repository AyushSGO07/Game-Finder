'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Award, Gamepad2, Building2 } from 'lucide-react';
import { GotyNominee } from '@/types/game';
import ShelfSelector from '@/components/library/ShelfSelector';

export interface GotyNomineesProps {
  nominees: GotyNominee[];
  year: number;
  className?: string;
}

function NomineeCard({ nominee }: { nominee: GotyNominee }) {
  const [imageError, setImageError] = useState(false);

  const hasImage = !imageError && Boolean(nominee.cover_url);

  return (
    <div
      data-testid={`nominee-card-${nominee.game_id}`}
      className="group flex flex-col rounded-2xl bg-slate-900/60 hover:bg-slate-900 border border-white/5 hover:border-white/20 transition-all overflow-hidden shadow-lg hover:shadow-2xl hover:-translate-y-1 min-w-0"
    >
      {/* Cover Image Container */}
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-950 shrink-0">
        {hasImage ? (
          <Image
            src={nominee.cover_url!}
            alt={nominee.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            onError={() => setImageError(true)}
            unoptimized
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 to-indigo-950/40 text-slate-500">
            <Gamepad2 className="w-8 h-8 text-indigo-400/60 mb-1" />
            <span className="text-[11px] font-medium text-slate-400">Artwork Pending</span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-black/30 pointer-events-none" />

        {/* Nominee Ribbon Badge */}
        <div className="absolute top-3 left-3 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-900/80 backdrop-blur-md border border-white/10 text-slate-300 text-[11px] font-bold z-10 pointer-events-none shadow-sm">
          <Award className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span>Nominee</span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 flex-1 flex flex-col justify-between gap-3 min-w-0">
        <div className="space-y-1.5 min-w-0">
          <Link
            href={`/games/${nominee.game_id}`}
            title={nominee.title}
            className="text-base font-bold text-white hover:text-amber-400 transition-colors line-clamp-1 block truncate"
          >
            {nominee.title}
          </Link>

          {nominee.developer && (
            <div className="flex items-center gap-1 text-xs text-slate-400 min-w-0">
              <Building2 className="w-3.5 h-3.5 text-slate-500 shrink-0" />
              <span className="truncate">{nominee.developer}</span>
            </div>
          )}

          {nominee.genres && nominee.genres.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {nominee.genres.slice(0, 2).map((g) => (
                <span
                  key={g}
                  className="px-2 py-0.5 rounded text-[10px] font-medium bg-white/5 text-slate-300 truncate max-w-full"
                >
                  {g}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Bottom Actions Footer: Separated with space-between, flex-wrap and clean gap */}
        <div className="pt-3 border-t border-white/5 flex flex-wrap items-center justify-between gap-2.5 min-w-0 mt-auto">
          <Link
            href={`/games/${nominee.game_id}`}
            className="text-xs font-semibold text-slate-400 hover:text-white flex items-center gap-1.5 transition-colors shrink-0 py-1 focus:outline-none focus:underline"
            aria-label={`View details for ${nominee.title}`}
          >
            <Gamepad2 className="w-3.5 h-3.5 shrink-0 text-indigo-400" />
            <span>Details</span>
          </Link>
          <div className="shrink-0 max-w-full">
            <ShelfSelector
              game={{
                id: nominee.game_id,
                title: nominee.title,
                capsule_image: nominee.cover_url,
              }}
              size="sm"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function GotyNominees({
  nominees,
  year,
  className = '',
}: GotyNomineesProps) {
  if (!nominees || nominees.length === 0) {
    return null;
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center gap-2">
        <Award className="w-5 h-5 text-amber-400" />
        <h3 className="text-xl sm:text-2xl font-bold text-white">
          Official Nominees for {year}
        </h3>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {nominees.map((nominee) => (
          <NomineeCard key={nominee.game_id} nominee={nominee} />
        ))}
      </div>
    </div>
  );
}
