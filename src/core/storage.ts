// Versioned schema + migrations (docs/PIANO.md §3.5, §4.6). All persisted
// shapes live here so every feature reads/writes the same day-record
// instead of re-deriving its own key format.

import { deleteValue, getValue, listValues, setValue } from './gm';

export interface DayStats {
  ig: {
    feed: number;
    dm: number;
    stories: number;
    profile: number;
    reel: number;
    search: number;
    other: number;
  };
  yt: {
    video: number;
    browse: number;
  };
  blocks: {
    reel_next: number;
    blocked_route: number;
    feed_end: number;
  };
}

export function emptyDayStats(): DayStats {
  return {
    ig: { feed: 0, dm: 0, stories: 0, profile: 0, reel: 0, search: 0, other: 0 },
    yt: { video: 0, browse: 0 },
    blocks: { reel_next: 0, blocked_route: 0, feed_end: 0 },
  };
}

const DAY_KEY_PREFIX = 'smd:v1:stats:';

function dayKey(date: Date): string {
  return `${DAY_KEY_PREFIX}${date.toISOString().slice(0, 10)}`;
}

export async function getDayStats(date = new Date()): Promise<DayStats> {
  return getValue(dayKey(date), emptyDayStats());
}

export async function setDayStats(stats: DayStats, date = new Date()): Promise<void> {
  await setValue(dayKey(date), stats);
}

/** Deletes day records older than `retentionDays` (docs/PIANO.md §4.6: 35
 * days). Compares the "YYYY-MM-DD" suffix as a plain string, which sorts
 * the same as chronological order. */
export async function pruneOldDayStats(retentionDays = 35, now = new Date()): Promise<void> {
  const cutoff = new Date(now);
  cutoff.setDate(cutoff.getDate() - retentionDays);
  const cutoffSuffix = dayKey(cutoff).slice(DAY_KEY_PREFIX.length);

  const keys = await listValues();
  for (const key of keys) {
    if (!key.startsWith(DAY_KEY_PREFIX)) continue;
    const suffix = key.slice(DAY_KEY_PREFIX.length);
    if (suffix < cutoffSuffix) {
      await deleteValue(key);
    }
  }
}

/** Panel's "azzera statistiche" (docs/PIANO.md §4.6): deletes every day
 * record, regardless of age. Settings and the schema version are untouched. */
export async function resetAllStats(): Promise<void> {
  const keys = await listValues();
  for (const key of keys) {
    if (key.startsWith(DAY_KEY_PREFIX)) {
      await deleteValue(key);
    }
  }
}

// --- Schema migrations -----------------------------------------------------
// Applied once, in ascending `version` order, tracked by a single stored
// version number. A migration that has already run (version <= current) is
// skipped, so this is safe to call on every startup.

export interface Migration {
  version: number;
  migrate(): Promise<void>;
}

const SCHEMA_VERSION_KEY = 'smd:v1:schemaVersion';

export async function getSchemaVersion(): Promise<number> {
  return getValue(SCHEMA_VERSION_KEY, 0);
}

export async function runMigrations(migrations: Migration[]): Promise<number> {
  const sorted = [...migrations].sort((a, b) => a.version - b.version);
  let current = await getSchemaVersion();
  for (const migration of sorted) {
    if (migration.version <= current) continue;
    await migration.migrate();
    current = migration.version;
    await setValue(SCHEMA_VERSION_KEY, current);
  }
  return current;
}
