'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { ScreenshotItem } from '@/types/game';

interface ScreenshotLightboxProps {
  isOpen: boolean;
  initialIndex?: number;
  screenshots: ScreenshotItem[];
  onClose: () => void;
}

export default function ScreenshotLightbox({
  isOpen,
  initialIndex = 0,
  screenshots,
  onClose,
}: ScreenshotLightboxProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  useEffect(() => {
    setCurrentIndex(initialIndex);
  }, [initialIndex, isOpen]);

  const count = screenshots.length;

  const nextImage = useCallback(() => {
    if (count <= 1) return;
    setCurrentIndex((prev) => (prev + 1) % count);
  }, [count]);

  const prevImage = useCallback(() => {
    if (count <= 1) return;
    setCurrentIndex((prev) => (prev - 1 + count) % count);
  }, [count]);

  // Keyboard navigation listener (ArrowLeft, ArrowRight, Escape)
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        nextImage();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        prevImage();
      }
    };

    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose, nextImage, prevImage]);

  if (!isOpen || count === 0) return null;

  const current = screenshots[currentIndex];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Screenshot lightbox"
      className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex flex-col justify-between p-4 sm:p-6 select-none animate-in fade-in duration-200"
    >
      {/* Top Header Bar */}
      <div className="w-full flex items-center justify-between text-white z-10">
        <span className="text-xs sm:text-sm font-semibold text-slate-300 bg-slate-900/80 px-3 py-1.5 rounded-full border border-white/10 backdrop-blur-md">
          Screenshot {currentIndex + 1} of {count}
        </span>

        <button
          type="button"
          onClick={onClose}
          aria-label="Close lightbox"
          className="p-2 rounded-full bg-slate-900/80 hover:bg-white/20 text-slate-300 hover:text-white border border-white/10 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-400"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Main Center Image Display with Backdrop Dismissal */}
      <div
        className="relative flex-1 flex items-center justify-center p-2 sm:p-4 min-h-0"
        onClick={onClose}
      >
        <img
          src={current.path_full}
          alt={`Screenshot preview ${currentIndex + 1}`}
          onClick={(e) => e.stopPropagation()}
          className="max-w-full max-h-[82vh] object-contain rounded-xl shadow-2xl border border-white/10 transition-transform duration-300"
        />
      </div>

      {/* Floating Prev / Next Navigation Buttons */}
      {count > 1 && (
        <>
          <button
            type="button"
            onClick={prevImage}
            aria-label="Previous screenshot"
            className="absolute left-4 sm:left-8 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-slate-950/70 hover:bg-indigo-600 text-white border border-white/15 flex items-center justify-center backdrop-blur-md transition-all hover:scale-105 focus:outline-none focus:ring-2 focus:ring-indigo-400 shadow-xl"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          <button
            type="button"
            onClick={nextImage}
            aria-label="Next screenshot"
            className="absolute right-4 sm:right-8 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-slate-950/70 hover:bg-indigo-600 text-white border border-white/15 flex items-center justify-center backdrop-blur-md transition-all hover:scale-105 focus:outline-none focus:ring-2 focus:ring-indigo-400 shadow-xl"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </>
      )}

      {/* Bottom Thumbnail Quick Strip */}
      {count > 1 && (
        <div className="w-full max-w-4xl mx-auto flex items-center justify-center gap-2 overflow-x-auto scrollbar-none py-2 px-4">
          {screenshots.map((s, idx) => (
            <button
              key={s.id || idx}
              type="button"
              onClick={() => setCurrentIndex(idx)}
              aria-label={`Jump to screenshot ${idx + 1}`}
              className={`w-14 sm:w-16 aspect-video rounded-md overflow-hidden border shrink-0 transition-all ${
                idx === currentIndex
                  ? 'border-indigo-400 ring-2 ring-indigo-400/50 scale-105'
                  : 'border-white/15 opacity-50 hover:opacity-100'
              }`}
            >
              <img
                src={s.path_thumbnail}
                alt={`Thumbnail ${idx + 1}`}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
