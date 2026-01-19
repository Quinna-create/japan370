/**
 * Spaced Repetition System (SRS) Algorithm
 * Based on SM-2/Anki algorithm with customizations
 */

import { ReviewData, Rating } from '@/types/kanji';

/**
 * Calculate next review date and update SRS data based on user rating
 */
export function calculateNextReview(
  currentData: ReviewData | null,
  rating: Rating
): ReviewData {
  // Initialize default values for new cards
  const defaultData: ReviewData = {
    easeFactor: 2.5,
    interval: 0,
    repetitions: 0,
    nextReviewDate: new Date().toISOString(),
    lastReviewDate: new Date().toISOString(),
    totalReviews: 0,
    lapses: 0,
  };

  const data = currentData || defaultData;
  let { easeFactor, interval, repetitions, lapses } = data;

  // Update based on rating
  switch (rating) {
    case 'again':
      // Reset progress - forgot the card
      repetitions = 0;
      lapses += 1;
      interval = 1; // Review tomorrow
      easeFactor = Math.max(1.3, easeFactor - 0.2);
      break;

    case 'hard':
      // Struggled with recall - shorter interval
      easeFactor = Math.max(1.3, easeFactor - 0.15);
      interval = Math.max(1, Math.round(interval * 1.2));
      break;

    case 'good':
      // Normal recall - standard progression
      repetitions += 1;
      if (repetitions === 1) {
        interval = 1; // 1 day
      } else if (repetitions === 2) {
        interval = 6; // 6 days
      } else {
        interval = Math.round(interval * easeFactor);
      }
      break;

    case 'easy':
      // Instant recall - longer interval
      repetitions += 1;
      easeFactor = Math.min(2.5, easeFactor + 0.15);
      if (repetitions === 1) {
        interval = 4; // 4 days
      } else if (repetitions === 2) {
        interval = 10; // 10 days
      } else {
        interval = Math.round(interval * easeFactor * 1.3);
      }
      break;
  }

  // Calculate next review date
  const nextReviewDate = new Date();
  nextReviewDate.setDate(nextReviewDate.getDate() + interval);

  return {
    easeFactor,
    interval,
    repetitions,
    nextReviewDate: nextReviewDate.toISOString(),
    lastReviewDate: new Date().toISOString(),
    totalReviews: (data.totalReviews || 0) + 1,
    lapses,
  };
}

/**
 * Check if a card is due for review
 */
export function isDue(reviewData: ReviewData | null): boolean {
  if (!reviewData || !reviewData.nextReviewDate) {
    return true; // New cards are always due
  }

  const now = new Date();
  const nextReview = new Date(reviewData.nextReviewDate);
  return now >= nextReview;
}

/**
 * Get card status based on review history
 */
export function getCardStatus(reviewData: ReviewData | null): 'new' | 'learning' | 'mature' {
  if (!reviewData || reviewData.totalReviews === 0) {
    return 'new';
  }

  if (reviewData.repetitions < 2 || reviewData.interval < 21) {
    return 'learning';
  }

  return 'mature';
}

/**
 * Calculate interval display text for rating buttons
 */
export function getIntervalDisplay(interval: number): string {
  if (interval < 1) {
    return '<1d';
  } else if (interval === 1) {
    return '1d';
  } else if (interval < 30) {
    return `${interval}d`;
  } else if (interval < 365) {
    const months = Math.round(interval / 30);
    return `${months}mo`;
  } else {
    const years = Math.round(interval / 365);
    return `${years}y`;
  }
}

/**
 * Get preview intervals for each rating option
 */
export function getPreviewIntervals(currentData: ReviewData | null): Record<Rating, number> {
  const ratings: Rating[] = ['again', 'hard', 'good', 'easy'];
  const intervals: Record<Rating, number> = {} as Record<Rating, number>;

  ratings.forEach((rating) => {
    const preview = calculateNextReview(currentData, rating);
    intervals[rating] = preview.interval;
  });

  return intervals;
}
