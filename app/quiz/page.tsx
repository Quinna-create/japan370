'use client';

/**
 * Quiz Mode with Spaced Repetition and Self-Rating
 */

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Home, Eye, EyeOff, RotateCcw } from 'lucide-react';
import { Kanji, Rating, QuizStats } from '@/types/kanji';
import { loadKanjiData, getKanjiByIds } from '@/lib/kanjiData';
import { getStudentSession } from '@/lib/storage';
import { getReviewData, saveReviewData, getAllReviewData, getStory } from '@/lib/storage';
import { calculateNextReview, isDue, getPreviewIntervals, getIntervalDisplay } from '@/lib/srsAlgorithm';
import { getActiveLessons } from '@/lib/lessonData';

type QuizType = 'kanji-to-meaning' | 'meaning-to-kanji' | 'meaning-to-primitives' | 'kanji-to-story';
type FilterType = 'all' | 'due' | 'new';

export default function QuizPage() {
  const [kanjiList, setKanjiList] = useState<Kanji[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isRevealed, setIsRevealed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [quizType, setQuizType] = useState<QuizType>('kanji-to-meaning');
  const [filterType, setFilterType] = useState<FilterType>('due');
  const [stats, setStats] = useState<QuizStats>({
    again: 0,
    hard: 0,
    good: 0,
    easy: 0,
    totalCards: 0,
  });
  const [sessionComplete, setSessionComplete] = useState(false);
  const router = useRouter();

  useEffect(() => {
    loadQuizData();
  }, [filterType]);

  const loadQuizData = async () => {
    setIsLoading(true);

    const session = getStudentSession();
    if (!session) {
      router.push('/login');
      return;
    }

    // Load active lessons or all kanji
    const activeLessons = getActiveLessons();
    let allKanji: Kanji[] = [];

    if (activeLessons.length > 0) {
      const allKanjiIds = new Set<number>();
      activeLessons.forEach((lesson) => {
        lesson.kanjiIds.forEach((id) => allKanjiIds.add(id));
      });
      allKanji = await getKanjiByIds(Array.from(allKanjiIds));
    } else {
      allKanji = await loadKanjiData();
    }

    // Filter based on filter type
    const reviewData = getAllReviewData(session.userId);
    let filtered: Kanji[] = [];

    switch (filterType) {
      case 'due':
        filtered = allKanji.filter((k) => {
          const review = reviewData[k.id];
          return !review || isDue(review);
        });
        break;
      case 'new':
        filtered = allKanji.filter((k) => {
          const review = reviewData[k.id];
          return !review || review.totalReviews === 0;
        });
        break;
      case 'all':
      default:
        filtered = allKanji;
        break;
    }

    // Shuffle the list
    const shuffled = [...filtered].sort(() => Math.random() - 0.5);

    setKanjiList(shuffled);
    setCurrentIndex(0);
    setIsRevealed(false);
    setSessionComplete(false);
    setStats({ again: 0, hard: 0, good: 0, easy: 0, totalCards: shuffled.length });
    setIsLoading(false);
  };

  const handleRating = (rating: Rating) => {
    const session = getStudentSession();
    if (!session) return;

    const currentKanji = kanjiList[currentIndex];
    const currentReviewData = getReviewData(session.userId, currentKanji.id);
    const newReviewData = calculateNextReview(currentReviewData, rating);

    saveReviewData(session.userId, currentKanji.id, newReviewData);

    // Update stats
    setStats((prev) => ({
      ...prev,
      [rating]: prev[rating] + 1,
    }));

    // Move to next card
    if (currentIndex < kanjiList.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setIsRevealed(false);
    } else {
      setSessionComplete(true);
    }
  };

  const handleRestart = () => {
    loadQuizData();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading quiz...</p>
        </div>
      </div>
    );
  }

  if (sessionComplete || kanjiList.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-xl shadow-xl p-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">
            {kanjiList.length === 0 ? 'No Cards Available' : 'Session Complete!'}
          </h2>

          {kanjiList.length > 0 && (
            <div className="space-y-4 mb-8">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-sm text-red-600 font-medium">Again</p>
                  <p className="text-2xl font-bold text-red-700">{stats.again}</p>
                </div>
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                  <p className="text-sm text-orange-600 font-medium">Hard</p>
                  <p className="text-2xl font-bold text-orange-700">{stats.hard}</p>
                </div>
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <p className="text-sm text-green-600 font-medium">Good</p>
                  <p className="text-2xl font-bold text-green-700">{stats.good}</p>
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-600 font-medium">Easy</p>
                  <p className="text-2xl font-bold text-blue-700">{stats.easy}</p>
                </div>
              </div>

              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 text-center">
                <p className="text-sm text-purple-600 font-medium">Total Cards</p>
                <p className="text-2xl font-bold text-purple-700">{stats.totalCards}</p>
              </div>
            </div>
          )}

          <div className="space-y-3">
            <button
              onClick={handleRestart}
              className="w-full flex items-center justify-center space-x-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
            >
              <RotateCcw size={20} />
              <span>Start New Session</span>
            </button>
            <button
              onClick={() => router.push('/')}
              className="w-full flex items-center justify-center space-x-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
            >
              <Home size={20} />
              <span>Go Home</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  const currentKanji = kanjiList[currentIndex];
  const session = getStudentSession();
  const currentReviewData = session ? getReviewData(session.userId, currentKanji.id) : null;
  const intervals = getPreviewIntervals(currentReviewData);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 py-8">
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
            <h1 className="text-2xl font-bold text-gray-900">Quiz Mode</h1>
            <p className="text-sm text-gray-600">
              {currentIndex + 1} / {kanjiList.length}
            </p>
          </div>

          <div className="w-20"></div>
        </div>

        {/* Filter Controls */}
        <div className="mb-6 flex items-center space-x-4">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as FilterType)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="due">Due Cards</option>
            <option value="new">New Cards</option>
            <option value="all">All Cards</option>
          </select>

          <select
            value={quizType}
            onChange={(e) => setQuizType(e.target.value as QuizType)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="kanji-to-meaning">Kanji → Meaning</option>
            <option value="meaning-to-kanji">Meaning → Kanji</option>
            <option value="meaning-to-primitives">Meaning → Primitives</option>
            <option value="kanji-to-story">Kanji → Story</option>
          </select>
        </div>

        {/* Quiz Card */}
        <div className="bg-white rounded-xl shadow-xl p-8 mb-6">
          {/* Question */}
          <div className="text-center mb-8">
            {quizType === 'kanji-to-meaning' && (
              <div className="text-9xl font-bold text-gray-900">{currentKanji.kanji}</div>
            )}
            {quizType === 'meaning-to-kanji' && (
              <div className="text-4xl font-bold text-blue-600">{currentKanji.keyword}</div>
            )}
            {quizType === 'meaning-to-primitives' && (
              <div className="text-4xl font-bold text-blue-600">{currentKanji.keyword}</div>
            )}
            {quizType === 'kanji-to-story' && (
              <div className="text-9xl font-bold text-gray-900">{currentKanji.kanji}</div>
            )}
          </div>

          {/* Reveal Button */}
          {!isRevealed && (
            <div className="text-center">
              <button
                onClick={() => setIsRevealed(true)}
                className="flex items-center justify-center space-x-2 px-8 py-4 bg-purple-600 text-white rounded-lg hover:bg-purple-700 mx-auto text-lg font-medium"
              >
                <Eye size={24} />
                <span>Reveal Answer</span>
              </button>
            </div>
          )}

          {/* Answer */}
          {isRevealed && (
            <div className="space-y-6">
              <div className="border-t-2 border-gray-200 pt-6">
                {quizType === 'kanji-to-meaning' && (
                  <div className="text-center">
                    <p className="text-3xl font-bold text-blue-600 mb-2">{currentKanji.keyword}</p>
                    <p className="text-sm text-gray-500">#{currentKanji.heisig_number}</p>
                  </div>
                )}
                {quizType === 'meaning-to-kanji' && (
                  <div className="text-center">
                    <p className="text-8xl font-bold text-gray-900">{currentKanji.kanji}</p>
                  </div>
                )}
                {quizType === 'meaning-to-primitives' && (
                  <div className="text-center">
                    <div className="flex flex-wrap gap-2 justify-center">
                      {currentKanji.primitives.map((p, i) => (
                        <span key={i} className="px-4 py-2 bg-purple-100 text-purple-800 rounded-lg text-lg">
                          {p}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {quizType === 'kanji-to-story' && session && (
                  <div className="text-center">
                    <p className="text-lg text-gray-700">
                      {(() => {
                        const story = getStory(session.userId, currentKanji.id);
                        return story || 'No story yet';
                      })()}
                    </p>
                  </div>
                )}
              </div>

              {/* Rating Buttons */}
              <div className="grid grid-cols-4 gap-3">
                <button
                  onClick={() => handleRating('again')}
                  className="flex flex-col items-center p-4 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                >
                  <span className="text-lg font-bold mb-1">Again</span>
                  <span className="text-xs">{getIntervalDisplay(intervals.again)}</span>
                </button>
                <button
                  onClick={() => handleRating('hard')}
                  className="flex flex-col items-center p-4 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                >
                  <span className="text-lg font-bold mb-1">Hard</span>
                  <span className="text-xs">{getIntervalDisplay(intervals.hard)}</span>
                </button>
                <button
                  onClick={() => handleRating('good')}
                  className="flex flex-col items-center p-4 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                >
                  <span className="text-lg font-bold mb-1">Good</span>
                  <span className="text-xs">{getIntervalDisplay(intervals.good)}</span>
                </button>
                <button
                  onClick={() => handleRating('easy')}
                  className="flex flex-col items-center p-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  <span className="text-lg font-bold mb-1">Easy</span>
                  <span className="text-xs">{getIntervalDisplay(intervals.easy)}</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Session Stats */}
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-4">
              <span className="text-red-600">Again: {stats.again}</span>
              <span className="text-orange-600">Hard: {stats.hard}</span>
              <span className="text-green-600">Good: {stats.good}</span>
              <span className="text-blue-600">Easy: {stats.easy}</span>
            </div>
            <span className="text-gray-600">Total: {stats.totalCards}</span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-4">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-purple-600 h-2 rounded-full transition-all"
              style={{ width: `${((currentIndex + 1) / kanjiList.length) * 100}%` }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
}
