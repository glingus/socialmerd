import { beforeEach, describe, expect, it } from 'vitest';
import { clearLog, getLogEntries, log } from '../../src/core/log';

describe('log', () => {
  beforeEach(() => {
    clearLog();
  });

  it('records entries with their level and message', () => {
    log.info('hello');
    log.warn('careful');
    log.error('oops');
    const entries = getLogEntries();
    expect(entries.map((e) => [e.level, e.message])).toEqual([
      ['info', 'hello'],
      ['warn', 'careful'],
      ['error', 'oops'],
    ]);
  });

  it('caps the buffer at 50 entries, dropping the oldest', () => {
    for (let i = 0; i < 60; i++) log.info(`line ${i}`);
    const entries = getLogEntries();
    expect(entries).toHaveLength(50);
    expect(entries[0]?.message).toBe('line 10');
    expect(entries[49]?.message).toBe('line 59');
  });

  it('clearLog empties the buffer', () => {
    log.info('hello');
    clearLog();
    expect(getLogEntries()).toHaveLength(0);
  });
});
