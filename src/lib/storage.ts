import { EmotionResult, EmotionType } from './emotionEngine';

export interface JournalEntry {
  id: string;
  date: string;
  text: string;
  result: EmotionResult;
}

const STORAGE_KEY = 'emotion-journal-entries';

export function getEntries(): JournalEntry[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function saveEntry(entry: JournalEntry): void {
  const entries = getEntries();
  entries.unshift(entry);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
}

export function updateEntry(updated: JournalEntry): void {
  const entries = getEntries();
  const idx = entries.findIndex(e => e.id === updated.id);
  if (idx !== -1) {
    entries[idx] = updated;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  }
}

export function deleteEntry(id: string): void {
  const entries = getEntries().filter(e => e.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
}

export function clearEntries(): void {
  localStorage.removeItem(STORAGE_KEY);
}

export function getWeeklyDominantEmotion(entries: JournalEntry[]): EmotionType | null {
  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const weekEntries = entries.filter(e => new Date(e.date) >= weekAgo);
  if (!weekEntries.length) return null;

  const counts: Record<string, number> = {};
  weekEntries.forEach(e => {
    counts[e.result.primaryEmotion] = (counts[e.result.primaryEmotion] || 0) + 1;
  });
  return Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0] as EmotionType;
}

export function getEmotionDistribution(entries: JournalEntry[]): { emotion: string; count: number; fill: string }[] {
  const counts: Record<string, number> = {};
  entries.forEach(e => {
    counts[e.result.primaryEmotion] = (counts[e.result.primaryEmotion] || 0) + 1;
  });
  const colorMap: Record<string, string> = {
    happy: 'hsl(45, 90%, 55%)', sad: 'hsl(220, 60%, 55%)', angry: 'hsl(0, 75%, 55%)',
    fear: 'hsl(280, 50%, 50%)', surprise: 'hsl(35, 90%, 55%)', love: 'hsl(340, 75%, 60%)',
    anxious: 'hsl(25, 70%, 55%)',
  };
  return Object.entries(counts).map(([emotion, count]) => ({
    emotion: emotion.charAt(0).toUpperCase() + emotion.slice(1),
    count,
    fill: colorMap[emotion] || 'hsl(220, 15%, 55%)',
  }));
}

export function getStabilityScore(entries: JournalEntry[]): number {
  if (entries.length < 2) return 100;
  const recent = entries.slice(0, 14);
  const emotions = recent.map(e => e.result.primaryEmotion);
  const unique = new Set(emotions).size;
  const ratio = unique / emotions.length;
  // Lower variance = higher stability
  return Math.round(Math.max(20, Math.min(100, (1 - ratio * 0.8) * 100)));
}

export function getStreak(entries: JournalEntry[]): number {
  if (!entries.length) return 0;
  const dates = [...new Set(entries.map(e => new Date(e.date).toDateString()))].sort(
    (a, b) => new Date(b).getTime() - new Date(a).getTime()
  );
  
  let streak = 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  for (let i = 0; i < dates.length; i++) {
    const expected = new Date(today);
    expected.setDate(expected.getDate() - i);
    if (new Date(dates[i]).toDateString() === expected.toDateString()) {
      streak++;
    } else {
      break;
    }
  }
  return streak;
}
