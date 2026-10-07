'use client';

import React, { useState } from 'react';
import { Edit3, Eye, Send, CheckCircle2, AlertCircle } from 'lucide-react';
import StarRating from './StarRating';
import MarkdownRenderer from './MarkdownRenderer';

export interface ReviewFormProps {
  gameId: string | number;
  initialRating?: number;
  onSubmit: (review: { rating: number; title: string; body: string }) => Promise<void>;
  onCancel?: () => void;
  className?: string;
}

export default function ReviewForm({
  gameId,
  initialRating = 10,
  onSubmit,
  onCancel,
  className = '',
}: ReviewFormProps) {
  const [rating, setRating] = useState<number>(initialRating);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [mode, setMode] = useState<'write' | 'preview'>('write');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!rating || rating < 1 || rating > 10) {
      setError('Please select a star rating between 1 and 10.');
      return;
    }

    if (!body.trim()) {
      setError('Review body cannot be empty.');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit({
        rating,
        title: title.trim(),
        body: body.trim(),
      });
      setIsSuccess(true);
      setTitle('');
      setBody('');
      setTimeout(() => setIsSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit review.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      aria-label="Write a game review"
      className={`rounded-2xl bg-slate-900/60 border border-white/10 p-5 sm:p-6 backdrop-blur-md space-y-5 ${className}`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/5 pb-4">
        <div>
          <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
            <Edit3 className="w-4 h-4 text-indigo-400" />
            <span>Write a Review</span>
          </h3>
          <p className="text-xs text-slate-400">
            Share your honest thoughts and gameplay critique with the community.
          </p>
        </div>

        {/* Rating Selector */}
        <div className="flex items-center gap-2">
          <StarRating value={rating} onChange={setRating} size="md" />
        </div>
      </div>

      {/* Review Title Input */}
      <div className="space-y-1.5">
        <label htmlFor="review-title" className="block text-xs font-semibold text-slate-300">
          Headline / Summary Title (Optional)
        </label>
        <input
          id="review-title"
          type="text"
          maxLength={150}
          placeholder="e.g. A masterpiece of atmospheric world-building"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full px-4 py-2.5 rounded-xl bg-slate-950/80 border border-white/10 text-white placeholder-slate-500 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
        />
      </div>

      {/* Tab Switcher: Write vs Preview */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center p-1 rounded-xl bg-slate-950/80 border border-white/5">
            <button
              type="button"
              role="tab"
              aria-selected={mode === 'write'}
              onClick={() => setMode('write')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                mode === 'write'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Write</span>
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={mode === 'preview'}
              onClick={() => setMode('preview')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                mode === 'preview'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Preview</span>
            </button>
          </div>

          <span className="text-[11px] text-slate-400">
            {body.length} / 5000 chars • Markdown supported
          </span>
        </div>

        {/* Write Textarea or Preview Panel */}
        {mode === 'write' ? (
          <textarea
            id="review-body"
            rows={5}
            maxLength={5000}
            placeholder="Write your review here. You can use markdown like **bold**, *italic*, # headings, and - bullet lists..."
            value={body}
            onChange={(e) => setBody(e.target.value)}
            className="w-full px-4 py-3 rounded-xl bg-slate-950/80 border border-white/10 text-white placeholder-slate-500 text-xs sm:text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
            aria-label="Review content in markdown"
          />
        ) : (
          <div className="min-h-[140px] px-4 py-3 rounded-xl bg-slate-950/60 border border-white/5 overflow-y-auto">
            {body.trim() ? (
              <MarkdownRenderer content={body} />
            ) : (
              <p className="text-xs text-slate-500 italic">Nothing to preview yet. Switch to &quot;Write&quot; to begin composing.</p>
            )}
          </div>
        )}
      </div>

      {/* Error or Success feedback banner */}
      {error && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-500/10 border border-rose-500/25 text-rose-300 text-xs">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {isSuccess && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-300 text-xs">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>Your review was successfully submitted!</span>
        </div>
      )}

      {/* Action Footer */}
      <div className="flex items-center justify-end gap-3 pt-2">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-slate-400 hover:text-white transition-colors"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-500 text-white font-semibold text-xs sm:text-sm transition-all shadow-md shadow-indigo-600/25"
        >
          <Send className="w-4 h-4" />
          <span>{isSubmitting ? 'Posting...' : 'Post Review'}</span>
        </button>
      </div>
    </form>
  );
}
