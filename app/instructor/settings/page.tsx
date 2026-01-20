'use client';

/**
 * Settings Page - Configure instructor password, master keys, and course sharing
 */

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save, Share2, Key, Lock } from 'lucide-react';
import { getStudentSession } from '@/lib/storage';
import { getInstructorPassword, setInstructorPassword, getMasterAccessKeys, setMasterAccessKeys } from '@/lib/rosterData';
import { getCourse } from '@/lib/lessonData';
import CourseSharing from '@/components/CourseSharing';

export default function SettingsPage() {
  const [password, setPassword] = useState('');
  const [masterKeys, setMasterKeys] = useState('');
  const [saveMessage, setSaveMessage] = useState('');
  const router = useRouter();

  useEffect(() => {
    const session = getStudentSession();
    if (!session || !session.isMasterAccess) {
      router.push('/login');
      return;
    }

    loadSettings();
  }, []);

  const loadSettings = () => {
    const currentPassword = getInstructorPassword();
    const currentKeys = getMasterAccessKeys();
    
    setPassword(currentPassword);
    setMasterKeys(currentKeys.join(', '));
  };

  const handleSave = () => {
    setInstructorPassword(password);
    
    const keysArray = masterKeys
      .split(',')
      .map((k) => k.trim().toLowerCase())
      .filter((k) => k.length > 0);
    
    setMasterAccessKeys(keysArray);

    setSaveMessage('Settings saved successfully!');
    setTimeout(() => setSaveMessage(''), 3000);
  };

  const course = getCourse();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-slate-100 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Link
            href="/instructor"
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft size={20} />
            <span className="font-medium">Back to Dashboard</span>
          </Link>

          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>

          <div className="w-40"></div>
        </div>

        {/* Authentication Settings */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex items-center space-x-3 mb-6">
            <Lock className="w-6 h-6 text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-900">Authentication</h2>
          </div>

          <div className="space-y-6">
            {/* Instructor Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Instructor Password
              </label>
              <input
                type="text"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter instructor password"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-800"
              />
              <p className="text-xs text-gray-500 mt-2">
                This password is used for instructor authentication (not currently required, but can be implemented)
              </p>
            </div>

            {/* Master Access Keys */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Master Access Keys
              </label>
              <input
                type="text"
                value={masterKeys}
                onChange={(e) => setMasterKeys(e.target.value)}
                placeholder="quinna, admin, instructor"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-800"
              />
              <p className="text-xs text-gray-500 mt-2">
                Comma-separated list of master access keys that bypass roster authentication
              </p>
            </div>

            {/* Save Button */}
            <div className="flex items-center space-x-4">
              <button
                onClick={handleSave}
                className="flex items-center space-x-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Save size={20} />
                <span>Save Settings</span>
              </button>

              {saveMessage && (
                <span className="text-green-600 font-medium">{saveMessage}</span>
              )}
            </div>
          </div>
        </div>

        {/* Course Sharing */}
        {course && (
          <div className="mb-6">
            <CourseSharing course={course} />
          </div>
        )}

        {/* Usage Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-4">Usage Instructions</h3>
          
          <div className="space-y-4 text-sm text-blue-800">
            <div>
              <p className="font-semibold mb-1">Setting Up Your Course:</p>
              <ol className="list-decimal list-inside space-y-1 ml-2">
                <li>Create lessons and add kanji to each lesson</li>
                <li>Upload your Canvas gradebook CSV in Roster Management</li>
                <li>Activate the roster to enable student authentication</li>
                <li>Share the course code with your students</li>
              </ol>
            </div>

            <div>
              <p className="font-semibold mb-1">Master Access Keys:</p>
              <p>Users who log in with a master access key will:</p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>Bypass roster authentication</li>
                <li>Have access to the instructor dashboard</li>
                <li>Have a 7-day session instead of 24 hours</li>
                <li>Be identified with an amber theme in the UI</li>
              </ul>
            </div>

            <div>
              <p className="font-semibold mb-1">Student Access:</p>
              <p>Students can access the app by:</p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>Joining via course code or URL you share</li>
                <li>Logging in with their Panther ID (from the roster)</li>
                <li>Studying kanji and taking quizzes with spaced repetition</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
