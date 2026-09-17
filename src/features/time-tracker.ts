// Usage-time counter (docs/PIANO.md §4.6): ticks once a second while the
// page is visible and either something was interacted with in the last 60s
// or a video is playing. Ticks accumulate in memory and are flushed to
// storage every N ticks (default 10) and on visibilitychange/pagehide, so
// we're not hitting GM storage every second.
//
// What counts as "the current section" is deliberately not this module's
// job — platforms/instagram and platforms/youtube (Fase 4/5) know their own
// routes; this only needs a `getSection()` callback that returns one.

import { getDayStats, pruneOldDayStats, setDayStats, type DayStats } from '../core/storage';

export type IgSection = keyof DayStats['ig'];
export type YtSection = keyof DayStats['yt'];

export type CurrentSection =
  | { site: 'instagram'; section: IgSection }
  | { site: 'youtube'; section: YtSection }
  | null;

export interface TimeTrackerOptions {
  isVisible?: () => boolean;
  hasRecentInteraction: () => boolean;
  isVideoPlaying: () => boolean;
  getSection: () => CurrentSection;
  now?: () => Date;
  tickIntervalMs?: number;
  flushEveryTicks?: number;
  retentionDays?: number;
}

export interface TimeTrackerHandle {
  stop: () => void;
  flush: () => Promise<void>;
}

export function startTimeTracker(options: TimeTrackerOptions): TimeTrackerHandle {
  const tickIntervalMs = options.tickIntervalMs ?? 1000;
  const flushEveryTicks = options.flushEveryTicks ?? 10;
  const isVisible = options.isVisible ?? (() => document.visibilityState === 'visible');

  const pendingIg: Partial<Record<IgSection, number>> = {};
  const pendingYt: Partial<Record<YtSection, number>> = {};
  let ticksSinceFlush = 0;

  const flush = async (): Promise<void> => {
    ticksSinceFlush = 0;
    const igEntries = Object.entries(pendingIg) as [IgSection, number][];
    const ytEntries = Object.entries(pendingYt) as [YtSection, number][];
    if (igEntries.length === 0 && ytEntries.length === 0) return;

    const date = options.now?.() ?? new Date();
    const stats = await getDayStats(date);
    for (const [section, count] of igEntries) {
      stats.ig[section] += count;
      delete pendingIg[section];
    }
    for (const [section, count] of ytEntries) {
      stats.yt[section] += count;
      delete pendingYt[section];
    }
    await setDayStats(stats, date);
  };

  const tick = (): void => {
    if (!isVisible()) return;
    if (!options.hasRecentInteraction() && !options.isVideoPlaying()) return;

    const current = options.getSection();
    if (!current) return;

    if (current.site === 'instagram') {
      pendingIg[current.section] = (pendingIg[current.section] ?? 0) + 1;
    } else {
      pendingYt[current.section] = (pendingYt[current.section] ?? 0) + 1;
    }

    ticksSinceFlush += 1;
    if (ticksSinceFlush >= flushEveryTicks) {
      void flush();
    }
  };

  const timer = setInterval(tick, tickIntervalMs);

  const onVisibilityChange = (): void => {
    if (document.visibilityState === 'hidden') void flush();
  };
  const onPageHide = (): void => void flush();
  document.addEventListener('visibilitychange', onVisibilityChange);
  window.addEventListener('pagehide', onPageHide);

  void pruneOldDayStats(options.retentionDays ?? 35, options.now?.() ?? new Date());

  return {
    stop(): void {
      clearInterval(timer);
      document.removeEventListener('visibilitychange', onVisibilityChange);
      window.removeEventListener('pagehide', onPageHide);
    },
    flush,
  };
}
