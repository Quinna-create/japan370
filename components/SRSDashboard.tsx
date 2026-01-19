'use client';

/**
 * SRS Dashboard showing review statistics and due cards
 */

import { useEffect, useState } from 'react';
import { Calendar, BookOpen, TrendingUp, Target } from 'lucide-react';
import { getStudentSession } from '@/lib/storage';
import { getAllReviewData } from '@/lib/storage';
import { isDue, getCardStatus } from '@/lib/srsAlgorithm';
import { loadKanjiData } from '@/lib/kanjiData';

interface DashboardStats {
  dueToday: number;
  newCards: number;
  matureCards: number;
  totalStudied: number;
}

export default function SRSDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    dueToday: 0,
    newCards: 0,
    matureCards: 0,
    totalStudied: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      const session = getStudentSession();
      if (!session) {
        setIsLoading(false);
        return;
      }

      const allKanji = await loadKanjiData();
      const reviewData = getAllReviewData(session.userId);

      let dueToday = 0;
      let newCards = 0;
      let matureCards = 0;
      let totalStudied = 0;

      allKanji.forEach((kanji) => {
        const review = reviewData[kanji.id];

        if (!review || review.totalReviews === 0) {
          newCards++;
        } else {
          totalStudied++;

          if (isDue(review)) {
            dueToday++;
          }

          const status = getCardStatus(review);
          if (status === 'mature') {
            matureCards++;
          }
        }
      });

      setStats({ dueToday, newCards, matureCards, totalStudied });
      setIsLoading(false);
    };

    loadStats();
  }, []);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white rounded-lg shadow p-6 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-24 mb-4"></div>
            <div className="h-8 bg-gray-200 rounded w-16"></div>
          </div>
        ))}
      </div>
    );
  }

  const cards = [
    {
      title: 'Due Today',
      value: stats.dueToday,
      icon: Calendar,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
    },
    {
      title: 'New Cards',
      value: stats.newCards,
      icon: BookOpen,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
    },
    {
      title: 'Mature Cards',
      value: stats.matureCards,
      icon: TrendingUp,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
    },
    {
      title: 'Total Studied',
      value: stats.totalStudied,
      icon: Target,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.title}
            className={`${card.bgColor} ${card.borderColor} border rounded-lg p-6 transition-transform hover:scale-105`}
          >
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-600">{card.title}</h3>
              <Icon className={`w-5 h-5 ${card.color}`} />
            </div>
            <p className={`text-3xl font-bold ${card.color}`}>{card.value}</p>
          </div>
        );
      })}
    </div>
  );
}
