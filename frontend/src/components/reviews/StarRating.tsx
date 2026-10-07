'use client';

import React, { useState } from 'react';
import { Star } from 'lucide-react';

export interface StarRatingProps {
  value: number; // 1 to 10
  onChange?: (rating: number) => void;
  readOnly?: boolean;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
}

const RATING_LABELS: Record<number, string> = {
  1: 'Poor (1/10)',
  2: 'Poor (2/10)',
  3: 'Mediocre (3/10)',
  4: 'Mediocre (4/10)',
  5: 'Decent (5/10)',
  6: 'Decent (6/10)',
  7: 'Good (7/10)',
  8: 'Great (8/10)',
  9: 'Superb (9/10)',
  10: 'Masterpiece (10/10)',
};

export default function StarRating({
  value,
  onChange,
  readOnly = false,
  size = 'md',
  showLabel = true,
  className = '',
}: StarRatingProps) {
  const [hoverValue, setHoverValue] = useState<number | null>(null);

  const activeValue = hoverValue !== null ? hoverValue : value;

  const sizeClasses = {
    sm: 'w-3.5 h-3.5',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  }[size];

  const handleKeyDown = (e: React.KeyboardEvent, star: number) => {
    if (readOnly) return;
    if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
      e.preventDefault();
      const next = Math.min(10, star + 1);
      onChange?.(next);
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
      e.preventDefault();
      const prev = Math.max(1, star - 1);
      onChange?.(prev);
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onChange?.(star);
    }
  };

  return (
    <div className={`flex flex-wrap items-center gap-2 select-none ${className}`}>
      <div
        role="radiogroup"
        aria-label="Rating from 1 to 10 stars"
        className="flex items-center gap-1"
        onMouseLeave={() => !readOnly && setHoverValue(null)}
      >
        {Array.from({ length: 10 }, (_, i) => i + 1).map((star) => {
          const isFilled = star <= activeValue;

          return (
            <button
              key={star}
              type="button"
              role="radio"
              aria-checked={value === star}
              aria-label={`${star} of 10 stars`}
              disabled={readOnly}
              tabIndex={readOnly ? -1 : 0}
              onClick={() => !readOnly && onChange?.(star)}
              onMouseEnter={() => !readOnly && setHoverValue(star)}
              onKeyDown={(e) => handleKeyDown(e, star)}
              className={`p-0.5 rounded focus:outline-none focus:ring-1 focus:ring-amber-400 transition-transform ${
                readOnly
                  ? 'cursor-default'
                  : 'cursor-pointer hover:scale-110 active:scale-95'
              }`}
            >
              <Star
                className={`${sizeClasses} transition-colors ${
                  isFilled
                    ? 'fill-amber-400 text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]'
                    : 'text-slate-600 hover:text-slate-400'
                }`}
              />
            </button>
          );
        })}
      </div>

      {showLabel && activeValue > 0 && (
        <span className="text-xs sm:text-sm font-semibold text-amber-300 ml-1">
          {RATING_LABELS[activeValue] || `${activeValue}/10`}
        </span>
      )}
    </div>
  );
}
