import { beforeEach, describe, expect, it, vi } from 'vitest';
import { checkForUpdate, compareVersions, parseVersionFromMeta } from '../../src/features/update-check';

const META_URL = 'https://raw.githubusercontent.com/glingus/socialmerd/main/dist/socialmerd.meta.js';

function fakeXhr(response: { status: number; responseText: string } | 'error') {
  return vi.fn(
    (details: { url: string; onload: (r: { status: number; responseText: string }) => void; onerror: () => void }) => {
      if (response === 'error') {
        details.onerror();
      } else {
        details.onload(response);
      }
    },
  );
}

describe('parseVersionFromMeta', () => {
  it('extracts the @version line', () => {
    const meta = '// ==UserScript==\n// @name socialmerd\n// @version 0.1.0.7\n// ==/UserScript==\n';
    expect(parseVersionFromMeta(meta)).toBe('0.1.0.7');
  });

  it('returns null when there is no @version line', () => {
    expect(parseVersionFromMeta('// ==UserScript==\n// ==/UserScript==\n')).toBeNull();
  });
});

describe('compareVersions', () => {
  it('treats missing trailing segments as zero', () => {
    expect(compareVersions('0.1.0', '0.1.0.0')).toBe(0);
  });

  it('is positive when the first version is newer', () => {
    expect(compareVersions('0.1.0.5', '0.1.0.4')).toBeGreaterThan(0);
    expect(compareVersions('0.2.0', '0.1.9')).toBeGreaterThan(0);
  });

  it('is negative when the first version is older', () => {
    expect(compareVersions('0.1.0.3', '0.1.0.4')).toBeLessThan(0);
  });
});

describe('checkForUpdate', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('reports an update when the fetched version is newer', async () => {
    const xhr = fakeXhr({ status: 200, responseText: '// @version 0.2.0\n' });
    const result = await checkForUpdate({ currentVersion: '0.1.0', metaUrl: META_URL, xhr });
    expect(result).toEqual({ checked: true, hasUpdate: true, latestVersion: '0.2.0' });
    expect(xhr).toHaveBeenCalledOnce();
  });

  it('reports no update when versions match', async () => {
    const xhr = fakeXhr({ status: 200, responseText: '// @version 0.1.0\n' });
    const result = await checkForUpdate({ currentVersion: '0.1.0', metaUrl: META_URL, xhr });
    expect(result.hasUpdate).toBe(false);
  });

  it('does not fetch again within 24h, and reuses the cached result', async () => {
    const firstXhr = fakeXhr({ status: 200, responseText: '// @version 0.2.0\n' });
    let now = 2 * 24 * 60 * 60 * 1000; // far enough past epoch 0 to count as a real first check
    await checkForUpdate({ currentVersion: '0.1.0', metaUrl: META_URL, xhr: firstXhr, now: () => now });

    const secondXhr = fakeXhr({ status: 200, responseText: '// @version 0.3.0\n' });
    now += 60 * 60 * 1000; // 1h later, still within the 24h window
    const result = await checkForUpdate({ currentVersion: '0.1.0', metaUrl: META_URL, xhr: secondXhr, now: () => now });

    expect(secondXhr).not.toHaveBeenCalled();
    expect(result).toEqual({ checked: false, hasUpdate: true, latestVersion: '0.2.0' });
  });

  it('fetches again once 24h have passed', async () => {
    const firstXhr = fakeXhr({ status: 200, responseText: '// @version 0.2.0\n' });
    let now = 2 * 24 * 60 * 60 * 1000;
    await checkForUpdate({ currentVersion: '0.1.0', metaUrl: META_URL, xhr: firstXhr, now: () => now });

    const secondXhr = fakeXhr({ status: 200, responseText: '// @version 0.3.0\n' });
    now += 24 * 60 * 60 * 1000 + 1;
    const result = await checkForUpdate({ currentVersion: '0.1.0', metaUrl: META_URL, xhr: secondXhr, now: () => now });

    expect(secondXhr).toHaveBeenCalledOnce();
    expect(result).toEqual({ checked: true, hasUpdate: true, latestVersion: '0.3.0' });
  });

  it('treats a network error as no update, without throwing', async () => {
    const xhr = fakeXhr('error');
    const result = await checkForUpdate({ currentVersion: '0.1.0', metaUrl: META_URL, xhr });
    expect(result).toEqual({ checked: true, hasUpdate: false, latestVersion: null });
  });

  it('treats a non-200 response as no update', async () => {
    const xhr = fakeXhr({ status: 404, responseText: 'not found' });
    const result = await checkForUpdate({ currentVersion: '0.1.0', metaUrl: META_URL, xhr });
    expect(result).toEqual({ checked: true, hasUpdate: false, latestVersion: null });
  });
});
