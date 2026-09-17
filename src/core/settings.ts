// User-configurable extras (docs/PIANO.md §4.6: "Blocchi base fissi nel
// codice; configurabili solo gli extra"). Base blocks (reel-lock, feed
// limiter, route guard, Shorts redirect...) never read this file -- only
// the panel and pill do.

import { getValue, setValue } from './gm';
import type { LangOverride } from './i18n';

export interface Settings {
  pillEnabled: boolean;
  langOverride: LangOverride;
  updateCheckEnabled: boolean;
}

const SETTINGS_KEY = 'smd:v1:settings';

export function defaultSettings(): Settings {
  return { pillEnabled: true, langOverride: 'auto', updateCheckEnabled: true };
}

export async function getSettings(): Promise<Settings> {
  return getValue(SETTINGS_KEY, defaultSettings());
}

export async function setSettings(settings: Settings): Promise<void> {
  await setValue(SETTINGS_KEY, settings);
}

export async function updateSettings(patch: Partial<Settings>): Promise<Settings> {
  const next = { ...(await getSettings()), ...patch };
  await setSettings(next);
  return next;
}
