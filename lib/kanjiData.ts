/**
 * Utility for loading and filtering kanji data
 */

import { Kanji } from '@/types/kanji';

let cachedKanjiData: Kanji[] | null = null;

/**
 * Load kanji data from JSON file
 */
export async function loadKanjiData(): Promise<Kanji[]> {
  if (cachedKanjiData) {
    return cachedKanjiData;
  }

  try {
    const response = await fetch('/data/kanji.json');
    if (!response.ok) {
      throw new Error('Failed to load kanji data');
    }

    const data = await response.json();
    cachedKanjiData = data;
    return data;
  } catch (error) {
    console.error('Error loading kanji data:', error);
    return [];
  }
}

/**
 * Get a single kanji by ID
 */
export async function getKanjiById(id: number): Promise<Kanji | null> {
  const allKanji = await loadKanjiData();
  return allKanji.find((k) => k.id === id) || null;
}

/**
 * Get kanji by IDs
 */
export async function getKanjiByIds(ids: number[]): Promise<Kanji[]> {
  const allKanji = await loadKanjiData();
  const idSet = new Set(ids);
  return allKanji.filter((k) => idSet.has(k.id));
}

/**
 * Search kanji by character, keyword, or Heisig number
 */
export async function searchKanji(query: string): Promise<Kanji[]> {
  const allKanji = await loadKanjiData();
  const lowerQuery = query.toLowerCase().trim();

  if (!lowerQuery) {
    return allKanji;
  }

  return allKanji.filter((k) => {
    return (
      k.kanji.includes(lowerQuery) ||
      k.keyword.toLowerCase().includes(lowerQuery) ||
      k.heisig_number.includes(lowerQuery)
    );
  });
}

/**
 * Filter kanji by Heisig number range
 */
export async function getKanjiByRange(start: number, end: number): Promise<Kanji[]> {
  const allKanji = await loadKanjiData();
  return allKanji.filter((k) => {
    const num = parseInt(k.heisig_number);
    return num >= start && num <= end;
  });
}

/**
 * Get all kanji sorted by Heisig number
 */
export async function getAllKanjiSorted(): Promise<Kanji[]> {
  return loadKanjiData();
}

/**
 * Get kanji count
 */
export async function getKanjiCount(): Promise<number> {
  const allKanji = await loadKanjiData();
  return allKanji.length;
}
