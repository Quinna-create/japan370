/**
 * Roster management and authentication utilities
 */

import { Roster, Student, StudentSession } from '@/types/kanji';
import Papa from 'papaparse';

const STORAGE_KEYS = {
  ROSTER_DATA: 'heisig_roster_data',
  INSTRUCTOR_PASSWORD: 'heisig_instructor_password',
  MASTER_ACCESS_KEYS: 'heisig_master_access_keys',
  ROSTER_AUTH_ENABLED: 'heisig_roster_auth_enabled',
} as const;

const DEFAULT_MASTER_KEYS = ['quinna'];
const DEFAULT_INSTRUCTOR_PASSWORD = 'sensei123';

/**
 * Get roster data from localStorage
 */
export function getRoster(): Roster | null {
  if (typeof window === 'undefined') return null;

  try {
    const data = localStorage.getItem(STORAGE_KEYS.ROSTER_DATA);
    if (!data) return null;
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading roster data:', error);
    return null;
  }
}

/**
 * Save roster data to localStorage
 */
export function saveRoster(roster: Roster): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(STORAGE_KEYS.ROSTER_DATA, JSON.stringify(roster));
  } catch (error) {
    console.error('Error saving roster data:', error);
  }
}

/**
 * Parse Canvas gradebook CSV and extract student roster
 */
export function parseCanvasCSV(csvContent: string): Student[] {
  const students: Student[] = [];

  const result = Papa.parse(csvContent, {
    header: true,
    skipEmptyLines: true,
  });

  result.data.forEach((row: any) => {
    // Canvas CSV typically has columns: Student, ID, SIS User ID, SIS Login ID, Section
    const pantherId = row['SIS User ID'] || row['ID'] || '';
    const name = row['Student'] || '';
    const email = row['SIS Login ID'] || '';
    const section = row['Section'] || '';

    if (pantherId && name) {
      students.push({
        pantherId: pantherId.trim(),
        name: name.trim(),
        email: email.trim(),
        section: section.trim(),
        firstAccess: null,
        lastAccess: null,
        totalAccess: 0,
      });
    }
  });

  return students;
}

/**
 * Upload and save roster from CSV
 */
export function uploadRoster(csvContent: string): { success: boolean; count: number; error?: string } {
  try {
    const students = parseCanvasCSV(csvContent);

    if (students.length === 0) {
      return { success: false, count: 0, error: 'No students found in CSV' };
    }

    // Preserve existing access data if roster already exists
    const existingRoster = getRoster();
    const existingStudentMap = new Map<string, Student>();

    if (existingRoster) {
      existingRoster.students.forEach((s) => {
        existingStudentMap.set(s.pantherId, s);
      });
    }

    // Merge with existing data
    const mergedStudents = students.map((newStudent) => {
      const existing = existingStudentMap.get(newStudent.pantherId);
      if (existing) {
        return {
          ...newStudent,
          firstAccess: existing.firstAccess,
          lastAccess: existing.lastAccess,
          totalAccess: existing.totalAccess,
        };
      }
      return newStudent;
    });

    const roster: Roster = {
      students: mergedStudents,
      uploadedAt: new Date().toISOString(),
      isActive: false, // Instructor must activate it
    };

    saveRoster(roster);
    return { success: true, count: mergedStudents.length };
  } catch (error: any) {
    console.error('Error uploading roster:', error);
    return { success: false, count: 0, error: error.message };
  }
}

/**
 * Authenticate student with Panther ID
 */
export function authenticateStudent(pantherId: string): { success: boolean; student?: Student; error?: string } {
  const normalizedId = pantherId.trim();

  // Check if it's a master access key
  if (isMasterAccessKey(normalizedId)) {
    return {
      success: true,
      student: {
        pantherId: normalizedId,
        name: 'Master Access',
        email: '',
        section: '',
        firstAccess: null,
        lastAccess: null,
        totalAccess: 0,
      },
    };
  }

  const roster = getRoster();

  if (!roster || !roster.isActive) {
    // Roster auth is not active - allow access
    return {
      success: true,
      student: {
        pantherId: normalizedId,
        name: 'Guest User',
        email: '',
        section: '',
        firstAccess: null,
        lastAccess: null,
        totalAccess: 0,
      },
    };
  }

  const student = roster.students.find((s) => s.pantherId === normalizedId);

  if (!student) {
    return { success: false, error: 'Panther ID not found in roster' };
  }

  // Update access tracking
  const now = new Date().toISOString();
  student.lastAccess = now;
  student.totalAccess += 1;

  if (!student.firstAccess) {
    student.firstAccess = now;
  }

  saveRoster(roster);

  return { success: true, student };
}

/**
 * Create student session
 */
export function createStudentSession(student: Student, isMasterAccess: boolean = false): StudentSession {
  const duration = isMasterAccess ? 7 * 24 : 24; // 7 days for master, 24 hours for students
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + duration);

  return {
    userId: student.pantherId,
    userName: student.name,
    isMasterAccess,
    loginTime: new Date().toISOString(),
    expiresAt: expiresAt.toISOString(),
  };
}

/**
 * Check if Panther ID is a master access key
 */
export function isMasterAccessKey(pantherId: string): boolean {
  const keys = getMasterAccessKeys();
  return keys.includes(pantherId.toLowerCase());
}

/**
 * Get master access keys
 */
export function getMasterAccessKeys(): string[] {
  if (typeof window === 'undefined') return DEFAULT_MASTER_KEYS;

  try {
    const data = localStorage.getItem(STORAGE_KEYS.MASTER_ACCESS_KEYS);
    if (!data) return DEFAULT_MASTER_KEYS;

    const keys = JSON.parse(data);
    return Array.isArray(keys) ? keys : DEFAULT_MASTER_KEYS;
  } catch (error) {
    return DEFAULT_MASTER_KEYS;
  }
}

/**
 * Set master access keys
 */
export function setMasterAccessKeys(keys: string[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEYS.MASTER_ACCESS_KEYS, JSON.stringify(keys));
}

/**
 * Check if roster authentication is enabled
 */
export function isRosterAuthEnabled(): boolean {
  if (typeof window === 'undefined') return false;

  try {
    const data = localStorage.getItem(STORAGE_KEYS.ROSTER_AUTH_ENABLED);
    return data === 'true';
  } catch (error) {
    return false;
  }
}

/**
 * Set roster authentication enabled/disabled
 */
export function setRosterAuthEnabled(enabled: boolean): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEYS.ROSTER_AUTH_ENABLED, enabled.toString());
}

/**
 * Toggle roster active status
 */
export function toggleRosterActive(): void {
  const roster = getRoster();
  if (!roster) return;

  roster.isActive = !roster.isActive;
  saveRoster(roster);
}

/**
 * Get instructor password
 */
export function getInstructorPassword(): string {
  if (typeof window === 'undefined') return DEFAULT_INSTRUCTOR_PASSWORD;

  try {
    const data = localStorage.getItem(STORAGE_KEYS.INSTRUCTOR_PASSWORD);
    return data || DEFAULT_INSTRUCTOR_PASSWORD;
  } catch (error) {
    return DEFAULT_INSTRUCTOR_PASSWORD;
  }
}

/**
 * Set instructor password
 */
export function setInstructorPassword(password: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEYS.INSTRUCTOR_PASSWORD, password);
}

/**
 * Verify instructor password
 */
export function verifyInstructorPassword(password: string): boolean {
  return password === getInstructorPassword();
}

/**
 * Get roster statistics
 */
export function getRosterStats(): {
  total: number;
  accessed: number;
  notAccessed: number;
  accessRate: number;
} {
  const roster = getRoster();

  if (!roster) {
    return { total: 0, accessed: 0, notAccessed: 0, accessRate: 0 };
  }

  const total = roster.students.length;
  const accessed = roster.students.filter((s) => s.totalAccess > 0).length;
  const notAccessed = total - accessed;
  const accessRate = total > 0 ? (accessed / total) * 100 : 0;

  return { total, accessed, notAccessed, accessRate };
}

/**
 * Export roster as CSV
 */
export function exportRosterCSV(): string {
  const roster = getRoster();
  if (!roster) return '';

  const headers = ['Panther ID', 'Name', 'Email', 'Section', 'First Access', 'Last Access', 'Total Access'];
  const rows = roster.students.map((s) => [
    s.pantherId,
    s.name,
    s.email,
    s.section,
    s.firstAccess || 'Never',
    s.lastAccess || 'Never',
    s.totalAccess.toString(),
  ]);

  return Papa.unparse({ fields: headers, data: rows });
}
