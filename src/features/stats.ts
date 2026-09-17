// Aggregates the raw per-day records from core/storage.ts into the shapes
// the panel needs (docs/PIANO.md §4.6): today's per-section minutes and a
// 7-day series for the bar chart. IG/YT section counters are seconds (one
// tick per second, features/time-tracker.ts), so minutes = seconds / 60.

import { getDayStats, type DayStats } from '../core/storage';

export interface WeekDay {
  date: string; // YYYY-MM-DD
  stats: DayStats;
}

function isoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

/** The 7 days up to and including `now`, oldest first. */
export async function getLast7Days(now = new Date()): Promise<WeekDay[]> {
  const days: WeekDay[] = [];
  for (let i = 6; i >= 0; i -= 1) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    days.push({ date: isoDate(date), stats: await getDayStats(date) });
  }
  return days;
}

function sumSeconds(section: Record<string, number>): number {
  return Object.values(section).reduce((total, seconds) => total + seconds, 0);
}

export function igMinutes(stats: DayStats): number {
  return Math.round(sumSeconds(stats.ig) / 60);
}

export function ytMinutes(stats: DayStats): number {
  return Math.round(sumSeconds(stats.yt) / 60);
}

export function totalBlocks(stats: DayStats): number {
  return sumSeconds(stats.blocks);
}
