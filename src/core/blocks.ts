// Counts "blocks snapped" (docs/PIANO.md §4.6): each silent block
// increments a counter in the day's stats record, shown later in the
// panel. Retention/cleanup of old day records is a features/ concern
// (Fase 6), not this module's job.

import { getDayStats, setDayStats, type DayStats } from './storage';

export type BlockType = keyof DayStats['blocks'];

export async function incrementBlock(type: BlockType, date = new Date()): Promise<number> {
  const stats = await getDayStats(date);
  stats.blocks[type] += 1;
  await setDayStats(stats, date);
  return stats.blocks[type];
}

export async function getBlockCounts(date = new Date()): Promise<DayStats['blocks']> {
  return (await getDayStats(date)).blocks;
}
