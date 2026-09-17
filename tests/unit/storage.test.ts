import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  emptyDayStats,
  getDayStats,
  getSchemaVersion,
  pruneOldDayStats,
  resetAllStats,
  runMigrations,
  setDayStats,
} from '../../src/core/storage';

describe('day stats', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('returns an empty record for a day with no data', async () => {
    const stats = await getDayStats(new Date('2026-01-01T12:00:00Z'));
    expect(stats).toEqual(emptyDayStats());
  });

  it('round-trips a day record', async () => {
    const date = new Date('2026-01-02T12:00:00Z');
    const stats = emptyDayStats();
    stats.ig.feed = 42;
    stats.blocks.reel_next = 3;
    await setDayStats(stats, date);
    expect(await getDayStats(date)).toEqual(stats);
  });

  it('keeps different days independent', async () => {
    const day1 = new Date('2026-01-01T12:00:00Z');
    const day2 = new Date('2026-01-02T12:00:00Z');
    const stats1 = emptyDayStats();
    stats1.yt.video = 5;
    await setDayStats(stats1, day1);
    expect(await getDayStats(day2)).toEqual(emptyDayStats());
  });
});

describe('pruneOldDayStats', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('deletes records older than the retention window and keeps the rest', async () => {
    const now = new Date('2026-03-10T12:00:00Z');
    await setDayStats(emptyDayStats(), new Date('2026-01-01T00:00:00Z')); // 68 days old
    await setDayStats(emptyDayStats(), new Date('2026-02-15T00:00:00Z')); // 23 days old
    await setDayStats(emptyDayStats(), now);

    await pruneOldDayStats(35, now);

    expect(await getDayStats(new Date('2026-01-01T00:00:00Z'))).toEqual(emptyDayStats());
    // pruned entries fall back to an empty record either way, so check the
    // underlying key directly to actually assert deletion happened.
    expect(localStorage.getItem('smd:v1:stats:2026-01-01')).toBeNull();
    expect(localStorage.getItem('smd:v1:stats:2026-02-15')).not.toBeNull();
    expect(localStorage.getItem(`smd:v1:stats:${now.toISOString().slice(0, 10)}`)).not.toBeNull();
  });

  it('leaves unrelated keys untouched', async () => {
    localStorage.setItem('smd:v1:schemaVersion', '3');
    await pruneOldDayStats(35, new Date('2026-03-10T12:00:00Z'));
    expect(localStorage.getItem('smd:v1:schemaVersion')).toBe('3');
  });
});

describe('resetAllStats', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('deletes every day record regardless of age', async () => {
    await setDayStats(emptyDayStats(), new Date('2020-01-01T00:00:00Z'));
    await setDayStats(emptyDayStats(), new Date());
    await resetAllStats();
    expect(localStorage.getItem('smd:v1:stats:2020-01-01')).toBeNull();
    expect(await getDayStats(new Date())).toEqual(emptyDayStats());
  });

  it('leaves unrelated keys untouched', async () => {
    localStorage.setItem('smd:v1:schemaVersion', '3');
    await setDayStats(emptyDayStats(), new Date());
    await resetAllStats();
    expect(localStorage.getItem('smd:v1:schemaVersion')).toBe('3');
  });
});

describe('runMigrations', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('starts at schema version 0', async () => {
    expect(await getSchemaVersion()).toBe(0);
  });

  it('runs migrations in ascending order and persists the final version', async () => {
    const order: number[] = [];
    const final = await runMigrations([
      { version: 2, migrate: () => Promise.resolve(void order.push(2)) },
      { version: 1, migrate: () => Promise.resolve(void order.push(1)) },
    ]);
    expect(order).toEqual([1, 2]);
    expect(final).toBe(2);
    expect(await getSchemaVersion()).toBe(2);
  });

  it('does not re-run already-applied migrations', async () => {
    await runMigrations([{ version: 1, migrate: async () => {} }]);
    const migrate = vi.fn(async () => {});
    await runMigrations([{ version: 1, migrate }]);
    expect(migrate).not.toHaveBeenCalled();
  });

  it('only runs migrations newer than the current version', async () => {
    await runMigrations([{ version: 1, migrate: async () => {} }]);
    const migrateV2 = vi.fn(async () => {});
    const final = await runMigrations([
      { version: 1, migrate: async () => {} },
      { version: 2, migrate: migrateV2 },
    ]);
    expect(migrateV2).toHaveBeenCalledOnce();
    expect(final).toBe(2);
  });
});
