'use client';

import React, { useState, useEffect } from 'react';
import { GameReview } from '@/types/game';
import { fetchGameReviews, submitGameReview } from '@/lib/api';
import ReviewForm from './ReviewForm';
import ReviewList from './ReviewList';

export interface GameReviewsSectionProps {
  gameId: string | number;
  initialReviews?: GameReview[];
}

export default function GameReviewsSection({
  gameId,
  initialReviews = [],
}: GameReviewsSectionProps) {
  const [reviews, setReviews] = useState<GameReview[]>(initialReviews);

  useEffect(() => {
    let mounted = true;
    async function load() {
      const data = await fetchGameReviews(gameId);
      if (mounted) {
        setReviews(data);
      }
    }
    load();
    return () => {
      mounted = false;
    };
  }, [gameId]);

  const handleSubmitReview = async (reviewData: {
    rating: number;
    title: string;
    body: string;
  }) => {
    const created = await submitGameReview({
      game_id: gameId,
      rating: reviewData.rating,
      title: reviewData.title,
      body: reviewData.body,
    });

    setReviews((prev) => {
      const filtered = prev.filter((r) => r.id !== created.id);
      return [created, ...filtered];
    });
  };

  return (
    <section aria-label="Game player ratings and reviews" className="space-y-6">
      <ReviewForm gameId={gameId} onSubmit={handleSubmitReview} />
      <ReviewList reviews={reviews} />
    </section>
  );
}
