'use client';

/**
 * Instructor Dashboard - Main landing page for instructors
 */

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { BookOpen, Users, Settings, Plus, Eye, EyeOff, Trash2, Edit } from 'lucide-react';
import { getStudentSession } from '@/lib/storage';
import { getCourse, initializeCourse, getLessons, deleteLesson, updateLesson } from '@/lib/lessonData';
import { getRoster, getRosterStats } from '@/lib/rosterData';
import { Lesson } from '@/types/kanji';

export default function InstructorDashboard() {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [courseName, setCourseName] = useState('');
  const [showNewCourseModal, setShowNewCourseModal] = useState(false);
  const [newCourseName, setNewCourseName] = useState('');
  const [newCourseDescription, setNewCourseDescription] = useState('');
  const router = useRouter();

  useEffect(() => {
    // Check if user has master access
    const session = getStudentSession();
    if (!session || !session.isMasterAccess) {
      router.push('/login');
      return;
    }

    loadDashboard();
  }, []);

  const loadDashboard = () => {
    const course = getCourse();
    
    if (!course) {
      setShowNewCourseModal(true);
      return;
    }

    setCourseName(course.name);
    const allLessons = getLessons();
    setLessons(allLessons);
  };

  const handleCreateCourse = () => {
    if (!newCourseName.trim()) return;

    initializeCourse(newCourseName, newCourseDescription);
    setShowNewCourseModal(false);
    loadDashboard();
  };

  const handleToggleActive = (lessonId: string) => {
    const lesson = lessons.find((l) => l.id === lessonId);
    if (lesson) {
      updateLesson(lessonId, { isActive: !lesson.isActive });
      loadDashboard();
    }
  };

  const handleDeleteLesson = (lessonId: string) => {
    if (confirm('Are you sure you want to delete this lesson?')) {
      deleteLesson(lessonId);
      loadDashboard();
    }
  };

  const roster = getRoster();
  const rosterStats = getRosterStats();

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Instructor Dashboard</h1>
          <p className="text-lg text-gray-600">{courseName || 'Course Management'}</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center space-x-3">
              <BookOpen className="w-8 h-8 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Total Lessons</p>
                <p className="text-2xl font-bold text-gray-900">{lessons.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center space-x-3">
              <Eye className="w-8 h-8 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Active Lessons</p>
                <p className="text-2xl font-bold text-gray-900">
                  {lessons.filter((l) => l.isActive).length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center space-x-3">
              <Users className="w-8 h-8 text-purple-600" />
              <div>
                <p className="text-sm text-gray-600">Students</p>
                <p className="text-2xl font-bold text-gray-900">{rosterStats.total}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Link
            href="/instructor/lesson/new"
            className="bg-blue-600 text-white rounded-lg p-6 hover:bg-blue-700 transition-colors flex items-center space-x-3"
          >
            <Plus size={24} />
            <span className="text-lg font-medium">Create New Lesson</span>
          </Link>

          <Link
            href="/instructor/roster"
            className="bg-purple-600 text-white rounded-lg p-6 hover:bg-purple-700 transition-colors flex items-center space-x-3"
          >
            <Users size={24} />
            <span className="text-lg font-medium">Manage Roster</span>
          </Link>

          <Link
            href="/instructor/settings"
            className="bg-gray-600 text-white rounded-lg p-6 hover:bg-gray-700 transition-colors flex items-center space-x-3"
          >
            <Settings size={24} />
            <span className="text-lg font-medium">Settings</span>
          </Link>
        </div>

        {/* Lessons List */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900">Lessons</h2>
          </div>

          {lessons.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              <BookOpen size={48} className="mx-auto mb-4 text-gray-400" />
              <p className="text-lg mb-2">No lessons yet</p>
              <p className="text-sm">Create your first lesson to get started</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {lessons
                .sort((a, b) => a.order - b.order)
                .map((lesson) => (
                  <div key={lesson.id} className="p-6 hover:bg-gray-50">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">{lesson.name}</h3>
                          <span
                            className={`px-2 py-1 rounded text-xs font-medium ${
                              lesson.isActive
                                ? 'bg-green-100 text-green-800'
                                : 'bg-gray-100 text-gray-600'
                            }`}
                          >
                            {lesson.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                        <p className="text-gray-600 text-sm mb-2">{lesson.description}</p>
                        <p className="text-gray-500 text-xs">
                          {lesson.kanjiIds.length} kanji • Order: {lesson.order}
                        </p>
                      </div>

                      <div className="flex items-center space-x-2 ml-4">
                        <button
                          onClick={() => handleToggleActive(lesson.id)}
                          className={`p-2 rounded-lg ${
                            lesson.isActive
                              ? 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                              : 'bg-green-100 hover:bg-green-200 text-green-700'
                          }`}
                          title={lesson.isActive ? 'Deactivate' : 'Activate'}
                        >
                          {lesson.isActive ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>

                        <Link
                          href={`/instructor/lesson/${lesson.id}`}
                          className="p-2 rounded-lg bg-blue-100 hover:bg-blue-200 text-blue-700"
                          title="Edit"
                        >
                          <Edit size={18} />
                        </Link>

                        <button
                          onClick={() => handleDeleteLesson(lesson.id)}
                          className="p-2 rounded-lg bg-red-100 hover:bg-red-200 text-red-700"
                          title="Delete"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      </div>

      {/* New Course Modal */}
      {showNewCourseModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Create Course</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Course Name
                </label>
                <input
                  type="text"
                  value={newCourseName}
                  onChange={(e) => setNewCourseName(e.target.value)}
                  placeholder="e.g., Japanese 101 - Fall 2026"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={newCourseDescription}
                  onChange={(e) => setNewCourseDescription(e.target.value)}
                  placeholder="Brief description of the course"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                />
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={handleCreateCourse}
                  className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
                >
                  Create Course
                </button>
                <button
                  onClick={() => router.push('/')}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
