/**
 * Course sharing and distribution utilities
 */

import { Course, CourseShareData } from '@/types/kanji';
import { getCourse } from './lessonData';

/**
 * Generate a shareable course code (base64 encoded)
 */
export function generateCourseCode(course: Course): string {
  const shareData: CourseShareData = {
    course,
    sharedAt: new Date().toISOString(),
    sharedBy: 'Instructor',
  };

  const json = JSON.stringify(shareData);
  return btoa(encodeURIComponent(json));
}

/**
 * Parse a course code and extract course data
 */
export function parseCourseCode(code: string): CourseShareData | null {
  try {
    const json = decodeURIComponent(atob(code));
    const shareData = JSON.parse(json);

    if (!shareData.course || !shareData.course.id) {
      return null;
    }

    return shareData;
  } catch (error) {
    console.error('Error parsing course code:', error);
    return null;
  }
}

/**
 * Generate shareable URL with embedded course data
 */
export function generateShareableURL(course: Course, baseUrl: string = ''): string {
  const code = generateCourseCode(course);
  const url = baseUrl || (typeof window !== 'undefined' ? window.location.origin : '');
  return `${url}/join?code=${code}`;
}

/**
 * Generate QR code data URL (returns data that can be used with a QR library)
 */
export function generateQRCodeData(course: Course): string {
  const url = generateShareableURL(course);
  // In a real implementation, you would use a QR code library here
  // For now, return the URL that can be used with an external QR generator
  return url;
}

/**
 * Export course as JSON for download
 */
export function exportCourseJSON(course: Course): string {
  return JSON.stringify(course, null, 2);
}

/**
 * Import course from JSON
 */
export function importCourseJSON(json: string): Course | null {
  try {
    const course = JSON.parse(json);

    if (!course.id || !course.name || !Array.isArray(course.lessons)) {
      throw new Error('Invalid course format');
    }

    return course;
  } catch (error) {
    console.error('Error importing course:', error);
    return null;
  }
}

/**
 * Create student package (JSON with instructions)
 */
export function createStudentPackage(course: Course): { json: string; instructions: string } {
  const json = exportCourseJSON(course);

  const instructions = `
# ${course.name} - Student Package

## Instructions

1. Go to the course website
2. Click "Join Course" 
3. Enter this course code: ${generateCourseCode(course).substring(0, 20)}...
4. Or upload this JSON file

## Course Information

- **Course Name**: ${course.name}
- **Description**: ${course.description}
- **Lessons**: ${course.lessons.length}
- **Shared**: ${new Date().toLocaleDateString()}

## Getting Started

After joining:
1. Log in with your Panther ID
2. Browse lessons in Study Mode
3. Practice with Quiz Mode and spaced repetition
4. Track your progress on the dashboard

---
Generated: ${new Date().toISOString()}
`;

  return { json, instructions };
}

/**
 * Get current course for sharing
 */
export function getCurrentCourseForSharing(): Course | null {
  return getCourse();
}

/**
 * Validate course code
 */
export function validateCourseCode(code: string): boolean {
  const shareData = parseCourseCode(code);
  return shareData !== null;
}

/**
 * Get course info from code without importing
 */
export function getCourseInfoFromCode(code: string): { name: string; lessons: number } | null {
  const shareData = parseCourseCode(code);
  if (!shareData) return null;

  return {
    name: shareData.course.name,
    lessons: shareData.course.lessons.length,
  };
}
