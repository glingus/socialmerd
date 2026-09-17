import { describe, expect, it } from 'vitest';
import { getLast7Days, igMinutes, totalBlocks, ytMinutes } from '../../src/features/stats';
import { emptyDayStats, setDayStats } from '../../src/core/storage';

describe('igMinutes / ytMinutes / totalBlocks', () => {
  it('sums section seconds and rounds down to minutes', () => {
    const stats = emptyDayStats();
    stats.ig.feed = 90;
    stats.ig.dm = 30;
    expect(igMinutes(stats)).toBe(2); // 120s -> 2min
  });

  it('returns 0 for an empty day', () => {
    expect(igMinutes(emptyDayStats())).toBe(0);
    expect(ytMinutes(emptyDayStats())).toBe(0);
    expect(totalBlocks(emptyDayStats())).toBe(0);
  });

  it('sums all block counters', () => {
    const stats = emptyDayStats();
    stats.blocks.reel_next = 2;
    stats.blocks.blocked_route = 3;
    stats.blocks.feed_end = 1;
    expect(totalBlocks(stats)).toBe(6);
  });
});

describe('getLast7Days', () => {
  it('returns exactly 7 days, oldest first, ending on `now`', async () => {
    localStorage.clear();
    const now = new Date('2026-03-10T12:00:00Z');
    const days = await getLast7Days(now);
    expect(days).toHaveLength(7);
    expect(days[0]?.date).toBe('2026-03-04');
    expect(days[6]?.date).toBe('2026-03-10');
  });

  it('reflects saved stats for the matching day', async () => {
    localStorage.clear();
    const now = new Date('2026-03-10T12:00:00Z');
    const stats = emptyDayStats();
    stats.ig.feed = 600;
    await setDayStats(stats, now);

    const days = await getLast7Days(now);
    expect(days[6]?.stats.ig.feed).toBe(600);
    expect(days[0]?.stats.ig.feed).toBe(0);
  });
});
