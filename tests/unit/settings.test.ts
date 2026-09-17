import { beforeEach, describe, expect, it } from 'vitest';
import { defaultSettings, getSettings, setSettings, updateSettings } from '../../src/core/settings';

describe('settings', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('returns defaults when nothing was saved yet', async () => {
    expect(await getSettings()).toEqual(defaultSettings());
  });

  it('round-trips a full settings object', async () => {
    const settings = { pillEnabled: false, langOverride: 'it' as const, updateCheckEnabled: false };
    await setSettings(settings);
    expect(await getSettings()).toEqual(settings);
  });

  it('patches only the given keys, keeping the rest', async () => {
    await setSettings({ pillEnabled: true, langOverride: 'auto', updateCheckEnabled: true });
    const next = await updateSettings({ pillEnabled: false });
    expect(next).toEqual({ pillEnabled: false, langOverride: 'auto', updateCheckEnabled: true });
    expect(await getSettings()).toEqual(next);
  });
});
