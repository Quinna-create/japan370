'use client';

/**
 * Study Mode - Browse through kanji with keyboard navigation
 */

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, ChevronRight, Home } from 'lucide-react';
import KanjiCard from '@/components/KanjiCard';
import { Kanji, Lesson } from '@/types/kanji';
import { loadKanjiData, getKanjiByIds } from '@/lib/kanjiData';
import { getActiveLessons } from '@/lib/lessonData';

export default function StudyPage() {
  const [kanjiList, setKanjiList] = useState<Kanji[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [selectedLessonId, setSelectedLessonId] = useState<string>('all');
  const router = useRouter();

  useEffect(() => {
    loadData();
  }, [selectedLessonId]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        handlePrevious();
      } else if (e.key === 'ArrowRight') {
        handleNext();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, kanjiList.length]);

  const loadData = async () => {
    setIsLoading(true);

    // Load lessons
    const activeLessons = getActiveLessons();
    setLessons(activeLessons);

    // Load kanji based on lesson filter
    let kanji: Kanji[] = [];

    if (selectedLessonId === 'all') {
      kanji = await loadKanjiData();
    } else {
      const lesson = activeLessons.find((l) => l.id === selectedLessonId);
      if (lesson) {
        kanji = await getKanjiByIds(lesson.kanjiIds);
      }
    }

    setKanjiList(kanji);
    setCurrentIndex(0);
    setIsLoading(false);
  };

  const handleNext = () => {
    if (currentIndex < kanjiList.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading kanji...</p>
        </div>
      </div>
    );
  }

  if (kanjiList.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center max-w-md">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">No Kanji Found</h2>
          <p className="text-gray-600 mb-6">
            {selectedLessonId === 'all'
              ? 'No kanji data available. Please ensure the data file is loaded.'
              : 'This lesson has no kanji. Select a different lesson or go back home.'}
          </p>
          <button
            onClick={() => router.push('/')}
            className="inline-flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Home size={20} />
            <span>Go Home</span>
          </button>
        </div>
      </div>
    );
  }

  const currentKanji = kanjiList[currentIndex];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => router.push('/')}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
          >
            <Home size={20} />
            <span className="font-medium">Home</span>
          </button>

          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900">Study Mode</h1>
            <p className="text-sm text-gray-600">
              {currentIndex + 1} / {kanjiList.length}
            </p>
          </div>

          <div className="w-20"></div> {/* Spacer for alignment */}
        </div>

        {/* Lesson Filter */}
        {lessons.length > 0 && (
          <div className="mb-6">
            <select
              value={selectedLessonId}
              onChange={(e) => setSelectedLessonId(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Kanji ({kanjiList.length})</option>
              {lessons.map((lesson) => (
                <option key={lesson.id} value={lesson.id}>
                  {lesson.name} ({lesson.kanjiIds.length})
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Kanji Card */}
        <KanjiCard kanji={currentKanji} showStory editableStory />

        {/* Navigation */}
        <div className="mt-8 flex items-center justify-between">
          <button
            onClick={handlePrevious}
            disabled={currentIndex === 0}
            className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:bg-gray-400 font-medium"
          >
            <ChevronLeft size={20} />
            <span>Previous</span>
          </button>

          <div className="text-center text-sm text-gray-700 mt-4">
            <p className="flex items-center justify-center space-x-2 font-medium">
              <kbd className="px-3 py-2 bg-gray-700 text-white border border-gray-600 rounded font-mono">←</kbd>
              <span>Previous</span>
              <kbd className="px-3 py-2 bg-gray-700 text-white border border-gray-600 rounded font-mono">→</kbd>
              <span>Next</span>
            </p>
          </div>

          <button
            onClick={handleNext}
            disabled={currentIndex === kanjiList.length - 1}
            className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:bg-gray-400 font-medium"
          >
            <span>Next</span>
            <ChevronRight size={20} />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="mt-6">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all"
              style={{ width: `${((currentIndex + 1) / kanjiList.length) * 100}%` }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
}
