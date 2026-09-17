import { beforeEach, describe, expect, it } from 'vitest';
import { getBlockCounts, incrementBlock } from '../../src/core/blocks';

describe('blocks', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('starts every counter at zero', async () => {
    const date = new Date('2026-02-01T12:00:00Z');
    expect(await getBlockCounts(date)).toEqual({ reel_next: 0, blocked_route: 0, feed_end: 0 });
  });

  it('increments the given counter and returns the new value', async () => {
    const date = new Date('2026-02-01T12:00:00Z');
    expect(await incrementBlock('reel_next', date)).toBe(1);
    expect(await incrementBlock('reel_next', date)).toBe(2);
    expect(await incrementBlock('feed_end', date)).toBe(1);
    expect(await getBlockCounts(date)).toEqual({ reel_next: 2, blocked_route: 0, feed_end: 1 });
  });

  it('keeps counters independent per day', async () => {
    const day1 = new Date('2026-02-01T12:00:00Z');
    const day2 = new Date('2026-02-02T12:00:00Z');
    await incrementBlock('blocked_route', day1);
    expect(await getBlockCounts(day2)).toEqual({ reel_next: 0, blocked_route: 0, feed_end: 0 });
  });
});
