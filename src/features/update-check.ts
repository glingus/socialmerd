// Update check (docs/PIANO.md §4.7): at most once a day, fetch the
// channel's own .meta.js from GitHub raw and compare @version. Userscripts
// iOS' own auto-update is currently unreliable, so this is what lights up
// the pill's dot and the install link in the panel — no other network
// request the script makes is allowed to skip this rate limit.
//
// Deliberately decoupled from the build-time __SMD_VERSION__/__SMD_CHANNEL__
// globals (see src/types/build-defines.d.ts): the caller (src/main.ts, once
// this is wired in during Fase 6) passes them in explicitly, so this module
// stays easy to unit test without going through esbuild's `define`.

import { getValue, setValue } from '../core/gm';

const LAST_CHECK_KEY = 'smd:v1:updateCheck:lastRunAt';
const LATEST_VERSION_KEY = 'smd:v1:updateCheck:latestVersion';
const CHECK_INTERVAL_MS = 24 * 60 * 60 * 1000;

export interface UpdateCheckResult {
  checked: boolean; // false if skipped because we already checked within 24h
  hasUpdate: boolean;
  latestVersion: string | null;
}

interface XhrResponse {
  status: number;
  responseText: string;
}

export type XhrFn = (details: {
  url: string;
  onload: (response: XhrResponse) => void;
  onerror: () => void;
}) => void;

function defaultXhr(details: { url: string; onload: (r: XhrResponse) => void; onerror: () => void }): void {
  GM.xmlHttpRequest({ method: 'GET', url: details.url, onload: details.onload, onerror: details.onerror });
}

export function parseVersionFromMeta(metaText: string): string | null {
  const match = /@version\s+(\S+)/.exec(metaText);
  return match ? (match[1] ?? null) : null;
}

/** Compares two dot-separated numeric versions (e.g. "0.1.0" vs
 * "0.1.0.4"): positive if `a` is newer, negative if older, 0 if equal.
 * Missing trailing segments count as 0, so "0.1.0" == "0.1.0.0". */
export function compareVersions(a: string, b: string): number {
  const partsA = a.split('.').map(Number);
  const partsB = b.split('.').map(Number);
  const length = Math.max(partsA.length, partsB.length);
  for (let i = 0; i < length; i++) {
    const diff = (partsA[i] ?? 0) - (partsB[i] ?? 0);
    if (diff !== 0) return diff;
  }
  return 0;
}

function fetchLatestVersion(metaUrl: string, xhr: XhrFn): Promise<string | null> {
  return new Promise((resolve) => {
    xhr({
      url: metaUrl,
      onload: (response) => {
        if (response.status !== 200) {
          resolve(null);
          return;
        }
        resolve(parseVersionFromMeta(response.responseText));
      },
      onerror: () => resolve(null),
    });
  });
}

export interface CheckForUpdateOptions {
  currentVersion: string;
  metaUrl: string;
  now?: () => number;
  xhr?: XhrFn;
}

export async function checkForUpdate(options: CheckForUpdateOptions): Promise<UpdateCheckResult> {
  const now = (options.now ?? Date.now)();
  const lastRun = await getValue(LAST_CHECK_KEY, 0);

  if (now - lastRun < CHECK_INTERVAL_MS) {
    const cached = await getValue<string | null>(LATEST_VERSION_KEY, null);
    return {
      checked: false,
      hasUpdate: cached !== null && compareVersions(cached, options.currentVersion) > 0,
      latestVersion: cached,
    };
  }

  const latestVersion = await fetchLatestVersion(options.metaUrl, options.xhr ?? defaultXhr);
  await setValue(LAST_CHECK_KEY, now);
  if (latestVersion !== null) {
    await setValue(LATEST_VERSION_KEY, latestVersion);
  }

  return {
    checked: true,
    hasUpdate: latestVersion !== null && compareVersions(latestVersion, options.currentVersion) > 0,
    latestVersion,
  };
}
