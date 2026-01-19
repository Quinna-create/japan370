/**
 * Storage utility for managing user progress and SRS data
 * All data stored in localStorage (client-side only)
 */

import { UserProgress, ReviewData } from '@/types/kanji';

const STORAGE_KEYS = {
  USER_PROGRESS: 'heisig_user_progress',
  STUDENT_SESSION: 'heisig_student_session',
} as const;

/**
 * Get user progress data from localStorage
 */
export function getUserProgress(userId: string): UserProgress | null {
  if (typeof window === 'undefined') return null;

  try {
    const data = localStorage.getItem(STORAGE_KEYS.USER_PROGRESS);
    if (!data) return null;

    const allProgress = JSON.parse(data);
    return allProgress[userId] || null;
  } catch (error) {
    console.error('Error reading user progress:', error);
    return null;
  }
}

/**
 * Save user progress data to localStorage
 */
export function saveUserProgress(userId: string, progress: Partial<UserProgress>): void {
  if (typeof window === 'undefined') return;

  try {
    const data = localStorage.getItem(STORAGE_KEYS.USER_PROGRESS);
    const allProgress = data ? JSON.parse(data) : {};

    allProgress[userId] = {
      ...allProgress[userId],
      ...progress,
      userId,
      lastUpdated: new Date().toISOString(),
    };

    localStorage.setItem(STORAGE_KEYS.USER_PROGRESS, JSON.stringify(allProgress));
  } catch (error) {
    console.error('Error saving user progress:', error);
  }
}

/**
 * Get story for a specific kanji
 */
export function getStory(userId: string, kanjiId: number): string {
  const progress = getUserProgress(userId);
  return progress?.stories?.[kanjiId] || '';
}

/**
 * Save story for a specific kanji
 */
export function saveStory(userId: string, kanjiId: number, story: string): void {
  const progress = getUserProgress(userId);
  const stories = progress?.stories || {};
  stories[kanjiId] = story;

  saveUserProgress(userId, { stories });
}

/**
 * Get review data for a specific kanji
 */
export function getReviewData(userId: string, kanjiId: number): ReviewData | null {
  const progress = getUserProgress(userId);
  return progress?.reviewData?.[kanjiId] || null;
}

/**
 * Save review data for a specific kanji
 */
export function saveReviewData(userId: string, kanjiId: number, reviewData: ReviewData): void {
  const progress = getUserProgress(userId);
  const allReviewData = progress?.reviewData || {};
  allReviewData[kanjiId] = reviewData;

  saveUserProgress(userId, { reviewData: allReviewData });
}

/**
 * Get all review data for a user
 */
export function getAllReviewData(userId: string): { [kanjiId: number]: ReviewData } {
  const progress = getUserProgress(userId);
  return progress?.reviewData || {};
}

/**
 * Export user progress as JSON for backup
 */
export function exportProgress(userId: string): string {
  const progress = getUserProgress(userId);
  return JSON.stringify(progress, null, 2);
}

/**
 * Import user progress from JSON backup
 */
export function importProgress(userId: string, jsonData: string): boolean {
  try {
    const progress = JSON.parse(jsonData);
    saveUserProgress(userId, progress);
    return true;
  } catch (error) {
    console.error('Error importing progress:', error);
    return false;
  }
}

/**
 * Clear all progress for a user
 */
export function clearProgress(userId: string): void {
  if (typeof window === 'undefined') return;

  try {
    const data = localStorage.getItem(STORAGE_KEYS.USER_PROGRESS);
    if (!data) return;

    const allProgress = JSON.parse(data);
    delete allProgress[userId];

    localStorage.setItem(STORAGE_KEYS.USER_PROGRESS, JSON.stringify(allProgress));
  } catch (error) {
    console.error('Error clearing progress:', error);
  }
}

/**
 * Get current student session from sessionStorage
 */
export function getStudentSession() {
  if (typeof window === 'undefined') return null;

  try {
    const data = sessionStorage.getItem(STORAGE_KEYS.STUDENT_SESSION);
    if (!data) return null;

    const session = JSON.parse(data);
    
    // Check if session has expired
    const expiresAt = new Date(session.expiresAt);
    if (new Date() > expiresAt) {
      sessionStorage.removeItem(STORAGE_KEYS.STUDENT_SESSION);
      return null;
    }

    return session;
  } catch (error) {
    console.error('Error reading student session:', error);
    return null;
  }
}

/**
 * Save student session to sessionStorage
 */
export function saveStudentSession(session: any): void {
  if (typeof window === 'undefined') return;

  try {
    sessionStorage.setItem(STORAGE_KEYS.STUDENT_SESSION, JSON.stringify(session));
  } catch (error) {
    console.error('Error saving student session:', error);
  }
}

/**
 * Clear student session
 */
export function clearStudentSession(): void {
  if (typeof window === 'undefined') return;
  sessionStorage.removeItem(STORAGE_KEYS.STUDENT_SESSION);
}
