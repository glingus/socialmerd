import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { getDayStats } from '../../src/core/storage';
import { startTimeTracker, type CurrentSection } from '../../src/features/time-tracker';

const DAY = new Date('2026-03-10T12:00:00Z');

/** Lets a flush's chained awaits (getDayStats -> setDayStats) settle before
 * asserting, since it's triggered internally (setInterval, fake timers)
 * rather than awaited directly by the test. */
async function flushMicrotasks(): Promise<void> {
  for (let i = 0; i < 5; i++) {
    await Promise.resolve();
  }
}

beforeEach(() => {
  localStorage.clear();
  vi.useFakeTimers();
  vi.setSystemTime(DAY);
});

afterEach(() => {
  vi.useRealTimers();
});

describe('startTimeTracker', () => {
  it('does not flush before flushEveryTicks is reached', async () => {
    const handle = startTimeTracker({
      hasRecentInteraction: () => true,
      isVideoPlaying: () => false,
      getSection: () => ({ site: 'instagram', section: 'feed' }),
      now: () => DAY,
    });
    vi.advanceTimersByTime(9000); // 9 ticks, flush threshold is 10
    await flushMicrotasks();
    expect((await getDayStats(DAY)).ig.feed).toBe(0);
    handle.stop();
  });

  it('flushes accumulated ticks to the right section every 10 ticks', async () => {
    const handle = startTimeTracker({
      hasRecentInteraction: () => true,
      isVideoPlaying: () => false,
      getSection: () => ({ site: 'instagram', section: 'feed' }),
      now: () => DAY,
    });
    vi.advanceTimersByTime(10_000);
    await flushMicrotasks();
    expect((await getDayStats(DAY)).ig.feed).toBe(10);
    handle.stop();
  });

  it('does not tick when the page is not visible', async () => {
    const handle = startTimeTracker({
      isVisible: () => false,
      hasRecentInteraction: () => true,
      isVideoPlaying: () => false,
      getSection: () => ({ site: 'instagram', section: 'feed' }),
      now: () => DAY,
    });
    vi.advanceTimersByTime(10_000);
    await flushMicrotasks();
    expect((await getDayStats(DAY)).ig.feed).toBe(0);
    handle.stop();
  });

  it('does not tick without recent interaction or a playing video', async () => {
    const handle = startTimeTracker({
      hasRecentInteraction: () => false,
      isVideoPlaying: () => false,
      getSection: () => ({ site: 'instagram', section: 'feed' }),
      now: () => DAY,
    });
    vi.advanceTimersByTime(10_000);
    await flushMicrotasks();
    expect((await getDayStats(DAY)).ig.feed).toBe(0);
    handle.stop();
  });

  it('ticks when a video is playing even without recent interaction', async () => {
    const handle = startTimeTracker({
      hasRecentInteraction: () => false,
      isVideoPlaying: () => true,
      getSection: () => ({ site: 'youtube', section: 'video' }),
      now: () => DAY,
    });
    vi.advanceTimersByTime(10_000);
    await flushMicrotasks();
    expect((await getDayStats(DAY)).yt.video).toBe(10);
    handle.stop();
  });

  it('routes ticks to the right site/section as it changes over time', async () => {
    let section: CurrentSection = { site: 'instagram', section: 'feed' };
    const handle = startTimeTracker({
      hasRecentInteraction: () => true,
      isVideoPlaying: () => false,
      getSection: () => section,
      now: () => DAY,
    });
    vi.advanceTimersByTime(4000);
    section = { site: 'instagram', section: 'dm' };
    vi.advanceTimersByTime(6000); // crosses the 10-tick flush
    await flushMicrotasks();
    const stats = await getDayStats(DAY);
    expect(stats.ig.feed).toBe(4);
    expect(stats.ig.dm).toBe(6);
    handle.stop();
  });

  it('does not tick at all when getSection returns null', async () => {
    const handle = startTimeTracker({
      hasRecentInteraction: () => true,
      isVideoPlaying: () => false,
      getSection: () => null,
      now: () => DAY,
    });
    vi.advanceTimersByTime(10_000);
    await flushMicrotasks();
    expect(await getDayStats(DAY)).toMatchObject({ ig: { feed: 0 }, yt: { video: 0 } });
    handle.stop();
  });

  it('flush() persists partial ticks on demand', async () => {
    const handle = startTimeTracker({
      hasRecentInteraction: () => true,
      isVideoPlaying: () => false,
      getSection: () => ({ site: 'instagram', section: 'stories' }),
      now: () => DAY,
    });
    vi.advanceTimersByTime(3000);
    await handle.flush();
    expect((await getDayStats(DAY)).ig.stories).toBe(3);
    handle.stop();
  });

  it('flushes on visibilitychange to hidden', async () => {
    const handle = startTimeTracker({
      hasRecentInteraction: () => true,
      isVideoPlaying: () => false,
      getSection: () => ({ site: 'instagram', section: 'reel' }),
      now: () => DAY,
    });
    vi.advanceTimersByTime(5000);
    Object.defineProperty(document, 'visibilityState', { value: 'hidden', configurable: true });
    document.dispatchEvent(new Event('visibilitychange'));
    await flushMicrotasks();
    expect((await getDayStats(DAY)).ig.reel).toBe(5);
    handle.stop();
    Object.defineProperty(document, 'visibilityState', { value: 'visible', configurable: true });
  });

  it('flushes on pagehide', async () => {
    const handle = startTimeTracker({
      hasRecentInteraction: () => true,
      isVideoPlaying: () => false,
      getSection: () => ({ site: 'youtube', section: 'browse' }),
      now: () => DAY,
    });
    vi.advanceTimersByTime(2000);
    window.dispatchEvent(new Event('pagehide'));
    await flushMicrotasks();
    expect((await getDayStats(DAY)).yt.browse).toBe(2);
    handle.stop();
  });

  it('stop() prevents any further ticking', async () => {
    const handle = startTimeTracker({
      hasRecentInteraction: () => true,
      isVideoPlaying: () => false,
      getSection: () => ({ site: 'instagram', section: 'search' }),
      now: () => DAY,
    });
    vi.advanceTimersByTime(3000);
    handle.stop();
    vi.advanceTimersByTime(10_000); // would cross the flush threshold if ticking continued
    await flushMicrotasks();
    await handle.flush(); // flushes only the 3 ticks accumulated before stop()
    expect((await getDayStats(DAY)).ig.search).toBe(3);
  });
});
