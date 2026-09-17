import { beforeEach, describe, expect, it } from 'vitest';
import { deleteValue, getValue, listValues, setValue } from '../../src/core/gm';

// No GM global in this environment, so core/gm.ts must fall back to localStorage.

describe('gm adapter (localStorage fallback)', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('returns the default value when unset', async () => {
    expect(await getValue('missing', 42)).toBe(42);
  });

  it('round-trips a value through set/get', async () => {
    await setValue('smd:test:count', 3);
    expect(await getValue('smd:test:count', 0)).toBe(3);
  });

  it('deletes a value', async () => {
    await setValue('smd:test:count', 3);
    await deleteValue('smd:test:count');
    expect(await getValue('smd:test:count', 0)).toBe(0);
  });

  it('lists stored keys', async () => {
    await setValue('smd:test:a', 1);
    await setValue('smd:test:b', 2);
    expect(await listValues()).toEqual(['smd:test:a', 'smd:test:b']);
  });
});
