'use client';

/**
 * Student login page with Panther ID authentication
 */

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, AlertCircle } from 'lucide-react';
import { authenticateStudent, createStudentSession, isMasterAccessKey } from '@/lib/rosterData';
import { saveStudentSession } from '@/lib/storage';

export default function LoginPage() {
  const [pantherId, setPantherId] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const result = authenticateStudent(pantherId);

      if (!result.success || !result.student) {
        setError(result.error || 'Authentication failed');
        setIsLoading(false);
        return;
      }

      // Create session
      const isMaster = isMasterAccessKey(pantherId);
      const session = createStudentSession(result.student, isMaster);
      saveStudentSession(session);

      // Redirect based on access type
      if (isMaster) {
        router.push('/instructor');
      } else {
        router.push('/');
      }
    } catch (err: any) {
      setError('An error occurred during login');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-lg shadow-xl p-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
              <Lock className="w-8 h-8 text-blue-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Heisig Kanji</h1>
            <p className="text-gray-600 mt-2">Learning Application</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label htmlFor="pantherId" className="block text-sm font-medium text-gray-700 mb-2">
                Panther ID
              </label>
              <input
                id="pantherId"
                type="text"
                value={pantherId}
                onChange={(e) => setPantherId(e.target.value)}
                placeholder="Enter your Panther ID"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-800"
                required
                autoFocus
              />
              <p className="mt-2 text-xs text-gray-500">
                Use your Panther ID to access the course
              </p>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start space-x-2">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:bg-blue-300 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Logging in...' : 'Login'}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="text-center space-y-2">
              <p className="text-sm text-gray-600">
                Need to join a course?{' '}
                <a href="/join" className="text-blue-600 hover:underline font-medium">
                  Enter course code
                </a>
              </p>
              <p className="text-xs text-gray-500">
                Instructor access available with master key
              </p>
            </div>
          </div>
        </div>

        <div className="mt-6 text-center text-sm text-gray-600">
          <p>For support, contact your instructor</p>
        </div>
      </div>
    </div>
  );
}
