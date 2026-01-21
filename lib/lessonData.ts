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
  
  // Initialize default RTK Book 1 lessons
  initializeDefaultLessons();
  
  return getCourse() || course;
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
  return `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}

/**
 * Clear all course data
 */
export function clearCourseData(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEY);
}

/**
 * Initialize default RTK Book 1 lessons
 * Creates 10 pre-defined lessons with fixed frame ranges
 */
export async function initializeDefaultLessons(): Promise<void> {
  const course = getCourse();
  if (!course) return;
  
  // Define the 10 RTK Book 1 lesson ranges
  const lessonDefinitions = [
    { name: 'Lesson 1: Frames 1-34', start: 1, end: 34, description: 'RTK Book 1 - 34 kanji covering fundamental primitives and basic characters' },
    { name: 'Lesson 2: Frames 35-70', start: 35, end: 70, description: 'RTK Book 1 - 36 kanji building on primitive foundations' },
    { name: 'Lesson 3: Frames 71-172', start: 71, end: 172, description: 'RTK Book 1 - 102 kanji expanding vocabulary with compound characters' },
    { name: 'Lesson 4: Frames 173-234', start: 173, end: 234, description: 'RTK Book 1 - 62 kanji introducing more complex compositions' },
    { name: 'Lesson 5: Frames 235-352', start: 235, end: 352, description: 'RTK Book 1 - 118 kanji developing intermediate character knowledge' },
    { name: 'Lesson 6: Frames 353-395', start: 353, end: 395, description: 'RTK Book 1 - 43 kanji reinforcing core patterns' },
    { name: 'Lesson 7: Frames 396-508', start: 396, end: 508, description: 'RTK Book 1 - 113 kanji advancing to sophisticated compositions' },
    { name: 'Lesson 8: Frames 509-577', start: 509, end: 577, description: 'RTK Book 1 - 69 kanji solidifying advanced patterns' },
    { name: 'Lesson 9: Frames 578-636', start: 578, end: 636, description: 'RTK Book 1 - 59 kanji mastering complex characters' },
    { name: 'Lesson 10: Frames 637-766', start: 637, end: 766, description: 'RTK Book 1 - 130 kanji completing the core curriculum' },
  ];
  
  const { getKanjiByRange } = await import('./kanjiData');
  
  // Create each lesson
  for (let i = 0; i < lessonDefinitions.length; i++) {
    const def = lessonDefinitions[i];
    const kanjiInRange = await getKanjiByRange(def.start, def.end);
    const kanjiIds = kanjiInRange.map(k => k.id);
    
    const lesson: Lesson = {
      id: generateId(),
      name: def.name,
      description: def.description,
      order: i + 1,
      kanjiIds: kanjiIds,
      isActive: true, // All lessons start as active
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    course.lessons.push(lesson);
  }
  
  course.updatedAt = new Date().toISOString();
  saveCourse(course);
}

/**
 * Toggle a lesson's active status
 */
export function toggleLessonActive(lessonId: string): void {
  const course = getCourse();
  if (!course) return;
  
  const lesson = course.lessons.find(l => l.id === lessonId);
  if (!lesson) return;
  
  lesson.isActive = !lesson.isActive;
  lesson.updatedAt = new Date().toISOString();
  course.updatedAt = new Date().toISOString();
  
  saveCourse(course);
}
