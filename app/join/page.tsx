'use client';

/**
 * Course joining page - allows students to join via code/URL
 */

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Download, CheckCircle, AlertCircle } from 'lucide-react';
import { parseCourseCode, getCourseInfoFromCode } from '@/lib/courseSharing';
import { saveCourse } from '@/lib/lessonData';

export default function JoinPage() {
  const [courseCode, setCourseCode] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [courseInfo, setCourseInfo] = useState<{ name: string; lessons: number } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Check if code is in URL
    const codeFromUrl = searchParams.get('code');
    if (codeFromUrl) {
      setCourseCode(codeFromUrl);
      handlePreview(codeFromUrl);
    }
  }, [searchParams]);

  const handlePreview = (code: string) => {
    const info = getCourseInfoFromCode(code);
    if (info) {
      setCourseInfo(info);
      setError('');
    } else {
      setCourseInfo(null);
      setError('Invalid course code');
    }
  };

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const shareData = parseCourseCode(courseCode);

      if (!shareData) {
        setError('Invalid course code. Please check and try again.');
        setIsLoading(false);
        return;
      }

      // Save course to localStorage
      saveCourse(shareData.course);

      setSuccess(true);
      setTimeout(() => {
        router.push('/login');
      }, 2000);
    } catch (err) {
      setError('Failed to join course. Please try again.');
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-lg shadow-xl p-8 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Course Joined!</h1>
            <p className="text-gray-600 mb-4">Redirecting to login...</p>
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-lg shadow-xl p-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 rounded-full mb-4">
              <Download className="w-8 h-8 text-purple-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Join Course</h1>
            <p className="text-gray-600 mt-2">Enter your instructor's course code</p>
          </div>

          <form onSubmit={handleJoin} className="space-y-6">
            <div>
              <label htmlFor="courseCode" className="block text-sm font-medium text-gray-700 mb-2">
                Course Code
              </label>
              <textarea
                id="courseCode"
                value={courseCode}
                onChange={(e) => {
                  setCourseCode(e.target.value);
                  handlePreview(e.target.value);
                }}
                placeholder="Paste course code from your instructor"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent font-mono text-sm"
                rows={4}
                required
              />
            </div>

            {courseInfo && (
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <h3 className="font-semibold text-purple-900 mb-2">Course Preview</h3>
                <p className="text-sm text-purple-800">
                  <strong>Name:</strong> {courseInfo.name}
                </p>
                <p className="text-sm text-purple-800">
                  <strong>Lessons:</strong> {courseInfo.lessons}
                </p>
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start space-x-2">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading || !courseInfo}
              className="w-full bg-purple-600 text-white py-3 rounded-lg font-medium hover:bg-purple-700 transition-colors disabled:bg-purple-300 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Joining...' : 'Join Course'}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="text-center">
              <p className="text-sm text-gray-600">
                Already joined?{' '}
                <a href="/login" className="text-purple-600 hover:underline font-medium">
                  Go to login
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
