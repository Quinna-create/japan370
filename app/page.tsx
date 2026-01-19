'use client';

/**
 * Home page with navigation and SRS dashboard
 */

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { BookOpen, Brain, Download, Settings, PlayCircle } from 'lucide-react';
import SRSDashboard from '@/components/SRSDashboard';
import { getStudentSession } from '@/lib/storage';
import { getAllReviewData } from '@/lib/storage';
import { isDue } from '@/lib/srsAlgorithm';
import { StudentSession } from '@/types/kanji';

export default function Home() {
  const [session, setSession] = useState<StudentSession | null>(null);
  const [hasDueCards, setHasDueCards] = useState(false);

  useEffect(() => {
    const currentSession = getStudentSession();
    setSession(currentSession);

    if (currentSession) {
      const reviewData = getAllReviewData(currentSession.userId);
      const due = Object.values(reviewData).some((data) => isDue(data));
      setHasDueCards(due);
    }
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Heisig Kanji Learning
          </h1>
          <p className="text-xl text-gray-600">
            Master kanji using the Heisig method with spaced repetition
          </p>
        </div>

        {/* Dashboard */}
        {session && (
          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Your Progress</h2>
            <SRSDashboard />

            {hasDueCards && (
              <div className="mt-4">
                <Link
                  href="/quiz"
                  className="inline-flex items-center space-x-2 bg-red-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-red-700 transition-colors shadow-lg"
                >
                  <PlayCircle size={20} />
                  <span>Review Now</span>
                </Link>
              </div>
            )}
          </div>
        )}

        {/* Navigation Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Link
            href="/study"
            className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition-shadow border-2 border-transparent hover:border-blue-400"
          >
            <div className="flex items-center space-x-4 mb-4">
              <div className="bg-blue-100 p-3 rounded-lg">
                <BookOpen className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900">Study Mode</h3>
            </div>
            <p className="text-gray-600">
              Browse through kanji, learn meanings, and create mnemonic stories to help you remember.
            </p>
          </Link>

          <Link
            href="/quiz"
            className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition-shadow border-2 border-transparent hover:border-purple-400"
          >
            <div className="flex items-center space-x-4 mb-4">
              <div className="bg-purple-100 p-3 rounded-lg">
                <Brain className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900">Quiz Mode</h3>
            </div>
            <p className="text-gray-600">
              Test your knowledge with spaced repetition quizzes and self-assess your learning progress.
            </p>
          </Link>
        </div>

        {/* Additional Actions */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Link
              href="/join"
              className="flex items-center space-x-3 p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
            >
              <Download className="w-5 h-5 text-purple-600" />
              <span className="font-medium text-gray-900">Join Course</span>
            </Link>

            {session?.isMasterAccess && (
              <Link
                href="/instructor"
                className="flex items-center space-x-3 p-4 bg-amber-50 rounded-lg hover:bg-amber-100 transition-colors"
              >
                <Settings className="w-5 h-5 text-amber-600" />
                <span className="font-medium text-gray-900">Instructor Dashboard</span>
              </Link>
            )}
          </div>
        </div>

        {/* Instructions */}
        {!session && (
          <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-blue-900 mb-2">Getting Started</h3>
            <ol className="list-decimal list-inside space-y-2 text-blue-800">
              <li>Get the course code from your instructor</li>
              <li>Click "Join Course" and enter the code</li>
              <li>Log in with your Panther ID</li>
              <li>Start learning kanji!</li>
            </ol>
          </div>
        )}
      </div>
    </div>
  );
}
