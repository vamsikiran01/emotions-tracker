import { supabase } from '@/integrations/supabase/client';
import { EmotionResult, EmotionType } from './emotionEngine';

export interface JournalEntry {
  id: string;
  date: string;
  text: string;
  result: EmotionResult;
  audioUrl?: string;
}

export async function getEntries(): Promise<JournalEntry[]> {
  const allRows: any[] = [];
  const PAGE = 1000;
  let offset = 0;

  while (true) {
    const { data, error } = await supabase
      .from('journal_entries')
      .select('*')
      .order('created_at', { ascending: false })
      .range(offset, offset + PAGE - 1);

    if (error) {
      console.error('Error fetching entries:', error);
      break;
    }

    if (!data || data.length === 0) break;
    allRows.push(...data);
    if (data.length < PAGE) break;
    offset += PAGE;
  }

  return allRows.map(row => ({
    id: row.id,
    date: row.created_at,
    text: row.text,
    result: row.result as unknown as EmotionResult,
    audioUrl: row.audio_url || undefined,
  }));
}

export async function saveEntry(entry: JournalEntry): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    console.error('Cannot save entry: not authenticated');
    return;
  }

  const { error } = await supabase.from('journal_entries').insert({
    text: entry.text,
    result: entry.result as any,
    created_at: entry.date,
    user_id: user.id,
    ...(entry.audioUrl ? { audio_url: entry.audioUrl } : {}),
  } as any);

  if (error) console.error('Error saving entry:', error);
}

export async function updateEntry(updated: JournalEntry): Promise<void> {
  const { error } = await supabase
    .from('journal_entries')
    .update({
      text: updated.text,
      result: updated.result as any,
    })
    .eq('id', updated.id);

  if (error) console.error('Error updating entry:', error);
}

export async function deleteEntry(id: string): Promise<void> {
  const { error } = await supabase
    .from('journal_entries')
    .delete()
    .eq('id', id);

  if (error) console.error('Error deleting entry:', error);
}

export async function clearEntries(): Promise<void> {
  const { error } = await supabase
    .from('journal_entries')
    .delete()
    .gte('created_at', '1970-01-01');

  if (error) console.error('Error clearing entries:', error);
}

export async function uploadAudio(blob: Blob): Promise<string | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const filename = `${user.id}/${crypto.randomUUID()}.webm`;
  const { error } = await supabase.storage
    .from('journal-audio')
    .upload(filename, blob, { contentType: 'audio/webm' });

  if (error) {
    console.error('Error uploading audio:', error);
    return null;
  }

  const { data } = await supabase.storage
    .from('journal-audio')
    .createSignedUrl(filename, 31536000); // 1 year
  return data?.signedUrl || null;
}

// These utility functions remain synchronous as they operate on already-fetched data
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
    anxious: 'hsl(25, 70%, 55%)', neutral: 'hsl(220, 15%, 55%)',
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
