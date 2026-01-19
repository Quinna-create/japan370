/**
 * Lesson and course management utilities
 * Stores lesson data in localStorage
 */

import { Course, Lesson } from '@/types/kanji';

const STORAGE_KEY = 'heisig_course_data';

/**
 * Get course data from localStorage
 */
export function getCourse(): Course | null {
  if (typeof window === 'undefined') return null;

  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return null;

    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading course data:', error);
    return null;
  }
}

/**
 * Save course data to localStorage
 */
export function saveCourse(course: Course): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(course));
  } catch (error) {
    console.error('Error saving course data:', error);
  }
}

/**
 * Initialize a new course
 */
export function initializeCourse(name: string, description: string): Course {
  const course: Course = {
    id: generateId(),
    name,
    description,
    lessons: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  saveCourse(course);
  return course;
}

/**
 * Get all lessons
 */
export function getLessons(): Lesson[] {
  const course = getCourse();
  return course?.lessons || [];
}

/**
 * Get active lessons only
 */
export function getActiveLessons(): Lesson[] {
  const lessons = getLessons();
  return lessons.filter((l) => l.isActive);
}

/**
 * Get a lesson by ID
 */
export function getLessonById(lessonId: string): Lesson | null {
  const lessons = getLessons();
  return lessons.find((l) => l.id === lessonId) || null;
}

/**
 * Create a new lesson
 */
export function createLesson(name: string, description: string): Lesson {
  const course = getCourse();
  if (!course) {
    throw new Error('No course found. Please initialize a course first.');
  }

  const lesson: Lesson = {
    id: generateId(),
    name,
    description,
    order: course.lessons.length + 1,
    kanjiIds: [],
    isActive: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  course.lessons.push(lesson);
  course.updatedAt = new Date().toISOString();
  saveCourse(course);

  return lesson;
}

/**
 * Update a lesson
 */
export function updateLesson(lessonId: string, updates: Partial<Lesson>): void {
  const course = getCourse();
  if (!course) return;

  const lessonIndex = course.lessons.findIndex((l) => l.id === lessonId);
  if (lessonIndex === -1) return;

  course.lessons[lessonIndex] = {
    ...course.lessons[lessonIndex],
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  course.updatedAt = new Date().toISOString();
  saveCourse(course);
}

/**
 * Delete a lesson
 */
export function deleteLesson(lessonId: string): void {
  const course = getCourse();
  if (!course) return;

  course.lessons = course.lessons.filter((l) => l.id !== lessonId);
  course.updatedAt = new Date().toISOString();
  saveCourse(course);
}

/**
 * Add kanji to a lesson
 */
export function addKanjiToLesson(lessonId: string, kanjiIds: number[]): void {
  const course = getCourse();
  if (!course) return;

  const lesson = course.lessons.find((l) => l.id === lessonId);
  if (!lesson) return;

  // Add unique kanji IDs
  const existingIds = new Set(lesson.kanjiIds);
  kanjiIds.forEach((id) => existingIds.add(id));
  lesson.kanjiIds = Array.from(existingIds);

  lesson.updatedAt = new Date().toISOString();
  course.updatedAt = new Date().toISOString();
  saveCourse(course);
}

/**
 * Remove kanji from a lesson
 */
export function removeKanjiFromLesson(lessonId: string, kanjiIds: number[]): void {
  const course = getCourse();
  if (!course) return;

  const lesson = course.lessons.find((l) => l.id === lessonId);
  if (!lesson) return;

  const idsToRemove = new Set(kanjiIds);
  lesson.kanjiIds = lesson.kanjiIds.filter((id) => !idsToRemove.has(id));

  lesson.updatedAt = new Date().toISOString();
  course.updatedAt = new Date().toISOString();
  saveCourse(course);
}

/**
 * Reorder lessons
 */
export function reorderLessons(lessonIds: string[]): void {
  const course = getCourse();
  if (!course) return;

  const lessonMap = new Map(course.lessons.map((l) => [l.id, l]));
  course.lessons = lessonIds
    .map((id, index) => {
      const lesson = lessonMap.get(id);
      if (lesson) {
        lesson.order = index + 1;
      }
      return lesson;
    })
    .filter(Boolean) as Lesson[];

  course.updatedAt = new Date().toISOString();
  saveCourse(course);
}

/**
 * Get all kanji IDs from active lessons
 */
export function getActiveKanjiIds(): number[] {
  const activeLessons = getActiveLessons();
  const allIds = new Set<number>();

  activeLessons.forEach((lesson) => {
    lesson.kanjiIds.forEach((id) => allIds.add(id));
  });

  return Array.from(allIds);
}

/**
 * Generate a unique ID
 */
function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Clear all course data
 */
export function clearCourseData(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEY);
}
