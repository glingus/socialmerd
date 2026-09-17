import { describe, expect, it } from 'vitest';
import {
  computeBoundary,
  decideChronological,
  decideRanked,
  emptyFeedState,
  nextWatermark,
  type FeedPost,
} from '../../src/platforms/instagram/feed-limiter';

const DAY_MS = 24 * 60 * 60 * 1000;
const NOW = new Date('2026-09-17T20:00:00.000Z').getTime();

function post(timestamp: number | null): FeedPost {
  return { timestamp };
}

describe('computeBoundary', () => {
  it('uses now-24h when there is no watermark yet', () => {
    expect(computeBoundary(emptyFeedState(), NOW)).toBe(NOW - DAY_MS);
  });

  it('uses the watermark when it is more recent than now-24h', () => {
    const watermark = NOW - 60_000; // 1 minute ago
    expect(computeBoundary({ watermark, lastCaughtUpAt: null }, NOW)).toBe(watermark);
  });

  it('does not clamp a corrupted future watermark to now (documented edge case)', () => {
    const futureWatermark = NOW + DAY_MS;
    expect(computeBoundary({ watermark: futureWatermark, lastCaughtUpAt: null }, NOW)).toBe(futureWatermark);
  });
});

describe('decideChronological', () => {
  it('shows everything when no post has reached the boundary', () => {
    const posts = [post(NOW), post(NOW - 1000), post(NOW - 2000)];
    const decision = decideChronological(posts, NOW - DAY_MS);
    expect(decision).toEqual({ visibleCount: 3, caughtUpAtIndex: null });
  });

  it('stops at the first post at-or-before the boundary', () => {
    const boundary = NOW - DAY_MS;
    const posts = [post(NOW), post(NOW - 1000), post(boundary), post(boundary - 1)];
    const decision = decideChronological(posts, boundary);
    expect(decision).toEqual({ visibleCount: 2, caughtUpAtIndex: 2 });
  });

  it('never stops on a post with no timestamp', () => {
    const boundary = NOW - DAY_MS;
    const posts = [post(null), post(null), post(boundary - 1)];
    const decision = decideChronological(posts, boundary);
    expect(decision).toEqual({ visibleCount: 2, caughtUpAtIndex: 2 });
  });

  it('shows the card immediately when there are no new posts at all', () => {
    const boundary = NOW - DAY_MS;
    const posts = [post(boundary - 1), post(boundary - 2000)];
    const decision = decideChronological(posts, boundary);
    expect(decision).toEqual({ visibleCount: 0, caughtUpAtIndex: 0 });
  });

  it('with a future (corrupted) boundary, every real post is already "old"', () => {
    const boundary = NOW + DAY_MS;
    const posts = [post(NOW), post(NOW - 1000)];
    const decision = decideChronological(posts, boundary);
    expect(decision).toEqual({ visibleCount: 0, caughtUpAtIndex: 0 });
  });
});

describe('decideRanked', () => {
  const boundary = NOW - DAY_MS;

  it('stops after 5 consecutive old posts', () => {
    const posts = [
      post(NOW), // new
      ...Array.from({ length: 5 }, () => post(boundary - 1)), // 5 old in a row
      post(NOW), // never reached
    ];
    const decision = decideRanked(posts, boundary);
    expect(decision.caughtUpAtIndex).toBe(5);
    expect(decision.hiddenIndices).toEqual([1, 2, 3, 4, 5]);
  });

  it('resets the consecutive counter on a new post', () => {
    const posts = [post(boundary - 1), post(boundary - 1), post(NOW), post(boundary - 1), post(boundary - 1)];
    const decision = decideRanked(posts, boundary);
    expect(decision.caughtUpAtIndex).toBeNull();
    expect(decision.hiddenIndices).toEqual([0, 1, 3, 4]);
  });

  it('stops after 50 processed posts even without 5 consecutive old ones', () => {
    const posts = Array.from({ length: 60 }, () => post(NOW));
    const decision = decideRanked(posts, boundary);
    expect(decision.caughtUpAtIndex).toBe(49);
  });
});

describe('nextWatermark', () => {
  it('keeps the existing watermark when nothing new was shown', () => {
    const state = { watermark: 100, lastCaughtUpAt: null };
    expect(nextWatermark(state, null)).toBe(100);
  });

  it('advances to the most recent shown timestamp', () => {
    const state = { watermark: 100, lastCaughtUpAt: null };
    expect(nextWatermark(state, 200)).toBe(200);
  });

  it('never goes backwards', () => {
    const state = { watermark: 300, lastCaughtUpAt: null };
    expect(nextWatermark(state, 200)).toBe(300);
  });
});
