'use client';

/**
 * Lesson Editor Page - Create and edit lessons
 */

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save, Plus, X, Search } from 'lucide-react';
import { getStudentSession } from '@/lib/storage';
import { getLessonById, createLesson, updateLesson, addKanjiToLesson, removeKanjiFromLesson } from '@/lib/lessonData';
import { loadKanjiData, searchKanji } from '@/lib/kanjiData';
import { Kanji, Lesson } from '@/types/kanji';

export default function LessonEditorPage() {
  const params = useParams();
  const lessonId = params?.lessonId as string;
  const isNew = lessonId === 'new';

  const [lessonName, setLessonName] = useState('');
  const [lessonDescription, setLessonDescription] = useState('');
  const [selectedKanjiIds, setSelectedKanjiIds] = useState<number[]>([]);
  const [selectedKanji, setSelectedKanji] = useState<Kanji[]>([]);
  const [availableKanji, setAvailableKanji] = useState<Kanji[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const session = getStudentSession();
    if (!session || !session.isMasterAccess) {
      router.push('/login');
      return;
    }

    loadLessonData();
  }, [lessonId]);

  useEffect(() => {
    if (searchQuery) {
      performSearch();
    } else {
      loadAvailableKanji();
    }
  }, [searchQuery, selectedKanjiIds]);

  const loadLessonData = async () => {
    if (!isNew) {
      const lesson = getLessonById(lessonId);
      if (lesson) {
        setLessonName(lesson.name);
        setLessonDescription(lesson.description);
        setSelectedKanjiIds(lesson.kanjiIds);

        // Load selected kanji
        const allKanji = await loadKanjiData();
        const selected = allKanji.filter((k) => lesson.kanjiIds.includes(k.id));
        setSelectedKanji(selected);
      }
    }

    await loadAvailableKanji();
    setIsLoading(false);
  };

  const loadAvailableKanji = async () => {
    const allKanji = await loadKanjiData();
    const available = allKanji.filter((k) => !selectedKanjiIds.includes(k.id));
    setAvailableKanji(available.slice(0, 50)); // Limit to 50 for performance
  };

  const performSearch = async () => {
    const results = await searchKanji(searchQuery);
    const available = results.filter((k) => !selectedKanjiIds.includes(k.id));
    setAvailableKanji(available.slice(0, 50));
  };

  const handleAddKanji = (kanji: Kanji) => {
    setSelectedKanjiIds([...selectedKanjiIds, kanji.id]);
    setSelectedKanji([...selectedKanji, kanji]);
  };

  const handleRemoveKanji = (kanjiId: number) => {
    setSelectedKanjiIds(selectedKanjiIds.filter((id) => id !== kanjiId));
    setSelectedKanji(selectedKanji.filter((k) => k.id !== kanjiId));
  };

  const handleSave = async () => {
    if (!lessonName.trim()) {
      alert('Please enter a lesson name');
      return;
    }

    setIsSaving(true);

    try {
      if (isNew) {
        const newLesson = createLesson(lessonName, lessonDescription);
        addKanjiToLesson(newLesson.id, selectedKanjiIds);
        router.push('/instructor');
      } else {
        updateLesson(lessonId, {
          name: lessonName,
          description: lessonDescription,
          kanjiIds: selectedKanjiIds,
        });
        router.push('/instructor');
      }
    } catch (error) {
      alert('Error saving lesson');
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading lesson...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Link
            href="/instructor"
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft size={20} />
            <span className="font-medium">Back to Dashboard</span>
          </Link>

          <h1 className="text-3xl font-bold text-gray-900">
            {isNew ? 'Create New Lesson' : 'Edit Lesson'}
          </h1>

          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center space-x-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-300"
          >
            <Save size={20} />
            <span>{isSaving ? 'Saving...' : 'Save Lesson'}</span>
          </button>
        </div>

        {/* Lesson Details */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Lesson Name
              </label>
              <input
                type="text"
                value={lessonName}
                onChange={(e) => setLessonName(e.target.value)}
                placeholder="e.g., Lesson 1: Basic Characters"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-800"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <input
                type="text"
                value={lessonDescription}
                onChange={(e) => setLessonDescription(e.target.value)}
                placeholder="Brief description of the lesson"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-800"
              />
            </div>
          </div>
        </div>

        {/* Two-Panel Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Selected Kanji */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">
                Selected Kanji ({selectedKanji.length})
              </h2>
            </div>

            <div className="p-6">
              {selectedKanji.length === 0 ? (
                <p className="text-center text-gray-500 py-8">
                  No kanji selected. Add kanji from the available list.
                </p>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-96 overflow-y-auto">
                  {selectedKanji.map((kanji) => (
                    <div
                      key={kanji.id}
                      className="relative bg-blue-50 border-2 border-blue-200 rounded-lg p-4 text-center hover:bg-blue-100 transition-colors"
                    >
                      <button
                        onClick={() => handleRemoveKanji(kanji.id)}
                        className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                      >
                        <X size={12} />
                      </button>
                      <div className="text-4xl font-bold mb-1">{kanji.kanji}</div>
                      <div className="text-xs text-gray-600">{kanji.keyword}</div>
                      <div className="text-xs text-gray-400">#{kanji.heisig_number}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Available Kanji */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Available Kanji</h2>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by kanji, keyword, or number..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-800"
                />
              </div>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-96 overflow-y-auto">
                {availableKanji.map((kanji) => (
                  <button
                    key={kanji.id}
                    onClick={() => handleAddKanji(kanji)}
                    className="bg-gray-50 border-2 border-gray-200 rounded-lg p-4 text-center hover:bg-green-50 hover:border-green-300 transition-colors"
                  >
                    <div className="text-4xl font-bold mb-1">{kanji.kanji}</div>
                    <div className="text-xs text-gray-600">{kanji.keyword}</div>
                    <div className="text-xs text-gray-400">#{kanji.heisig_number}</div>
                  </button>
                ))}
              </div>

              {availableKanji.length === 0 && (
                <p className="text-center text-gray-500 py-8">
                  {searchQuery ? 'No kanji found' : 'All kanji selected'}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
