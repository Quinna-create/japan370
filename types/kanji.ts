/**
 * Type definitions for the Heisig Kanji Learning Application
 */

// Main kanji data structure
export interface Kanji {
  id: number;
  kanji: string;
  keyword: string;
  heisig_number: string;
  primitives: string[];
  user_story: string;
  last_reviewed: string | null;
  ease_factor: number;
}

// Spaced Repetition System (SRS) data
export interface ReviewData {
  easeFactor: number;
  interval: number; // days until next review
  repetitions: number;
  nextReviewDate: string; // ISO 8601 date string
  lastReviewDate: string; // ISO 8601 date string
  totalReviews: number;
  lapses: number; // times user forgot this card
}

// Self-assessment ratings (Anki-style)
export type Rating = 'again' | 'hard' | 'good' | 'easy';

// Card maturity status
export type CardStatus = 'new' | 'learning' | 'mature';

// Lesson structure for course organization
export interface Lesson {
  id: string;
  name: string;
  description: string;
  order: number;
  kanjiIds: number[]; // References to Kanji.id
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Course structure
export interface Course {
  id: string;
  name: string;
  description: string;
  lessons: Lesson[];
  createdAt: string;
  updatedAt: string;
}

// Student roster entry
export interface Student {
  pantherId: string;
  name: string;
  email: string;
  section: string;
  firstAccess: string | null;
  lastAccess: string | null;
  totalAccess: number;
}

// Class roster management
export interface Roster {
  students: Student[];
  uploadedAt: string;
  isActive: boolean;
}

// Quiz settings and configuration
export interface QuizSettings {
  quizType: 'kanji-to-meaning' | 'meaning-to-kanji' | 'meaning-to-primitives' | 'kanji-to-story';
  filterType: 'all' | 'due' | 'new';
  sessionSize: number;
}

// Quiz session statistics
export interface QuizStats {
  again: number;
  hard: number;
  good: number;
  easy: number;
  totalCards: number;
}

// User progress data stored per student
export interface UserProgress {
  userId: string; // Panther ID or master access key
  stories: { [kanjiId: number]: string }; // User-created mnemonic stories
  reviewData: { [kanjiId: number]: ReviewData }; // SRS data per kanji
  lastUpdated: string;
}

// Student session data
export interface StudentSession {
  userId: string;
  userName: string;
  isMasterAccess: boolean;
  loginTime: string;
  expiresAt: string;
}

// Course sharing payload
export interface CourseShareData {
  course: Course;
  sharedAt: string;
  sharedBy: string;
}

// Master access configuration
export interface MasterAccessConfig {
  keys: string[];
  sessionDuration: number; // hours
}

// Application settings
export interface AppSettings {
  instructorPassword: string;
  masterAccessKeys: string[];
  rosterAuthEnabled: boolean;
}
