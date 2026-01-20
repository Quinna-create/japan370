'use client';

/**
 * Reusable Kanji Card component with story editing
 */

import { useState, useEffect } from 'react';
import { Save, Loader2 } from 'lucide-react';
import { Kanji } from '@/types/kanji';
import { getStudentSession } from '@/lib/storage';
import { getStory, saveStory } from '@/lib/storage';

interface KanjiCardProps {
  kanji: Kanji;
  showStory?: boolean;
  editableStory?: boolean;
}

export default function KanjiCard({ kanji, showStory = true, editableStory = true }: KanjiCardProps) {
  const [story, setStory] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

  useEffect(() => {
    const session = getStudentSession();
    if (session) {
      const userStory = getStory(session.userId, kanji.id);
      setStory(userStory);
    }
  }, [kanji.id]);

  const handleSaveStory = async () => {
    const session = getStudentSession();
    if (!session) return;

    setIsSaving(true);
    setSaveMessage('');

    try {
      saveStory(session.userId, kanji.id, story);
      setSaveMessage('Saved!');
      setTimeout(() => setSaveMessage(''), 2000);
    } catch (error) {
      setSaveMessage('Error saving');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-8 max-w-2xl mx-auto">
      {/* Kanji Display */}
      <div className="text-center mb-6">
        <div className="text-9xl font-bold text-gray-900 mb-4 leading-none">
          {kanji.kanji}
        </div>
        <div className="text-3xl font-semibold text-blue-600 mb-2">
          {kanji.keyword}
        </div>
        <div className="text-sm text-gray-500">
          Heisig #{kanji.heisig_number}
        </div>
      </div>

      {/* Primitives */}
      {kanji.primitives && kanji.primitives.length > 0 && (
        <div className="mb-6 p-4 bg-purple-50 rounded-lg">
          <h3 className="text-sm font-semibold text-purple-900 mb-2">Primitives</h3>
          <div className="flex flex-wrap gap-2">
            {kanji.primitives.map((primitive, idx) => (
              <span
                key={idx}
                className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm"
              >
                {primitive}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Story Section */}
      {showStory && (
        <div className="mt-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-semibold text-gray-900">Your Mnemonic Story</h3>
            {editableStory && (
              <div className="flex items-center space-x-2">
                {saveMessage && (
                  <span className="text-sm text-green-600">{saveMessage}</span>
                )}
                <button
                  onClick={handleSaveStory}
                  disabled={isSaving}
                  className="flex items-center space-x-1 px-3 py-1 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 disabled:bg-blue-300"
                >
                  {isSaving ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <Save size={14} />
                  )}
                  <span>{isSaving ? 'Saving...' : 'Save'}</span>
                </button>
              </div>
            )}
          </div>
          {editableStory ? (
            <textarea
              value={story}
              onChange={(e) => setStory(e.target.value)}
              placeholder="Write your mnemonic story here... Use the primitives to create a memorable story that helps you remember the kanji's meaning."
              className="w-full h-32 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-gray-800"
            />
          ) : (
            <div className="w-full min-h-[8rem] px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg">
              {story || <span className="text-gray-400">No story yet</span>}
            </div>
          )}
          <p className="text-xs text-gray-500 mt-2">
            Stories are saved automatically to your local device
          </p>
        </div>
      )}
    </div>
  );
}
