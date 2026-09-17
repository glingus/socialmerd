// Language selection for the script's own UI (docs/PIANO.md §4.7): from
// navigator.language ("it*" -> it, else en), with a panel override.

import { en } from './en';
import { it } from './it';

export type Lang = 'it' | 'en';
export type LangOverride = 'auto' | Lang;

const dictionaries = { it, en } satisfies Record<Lang, Record<string, string>>;

export function detectLang(
  navigatorLanguage: string = navigator.language,
  override: LangOverride = 'auto',
): Lang {
  if (override !== 'auto') return override;
  return navigatorLanguage.toLowerCase().startsWith('it') ? 'it' : 'en';
}

export function t(key: keyof typeof en, lang: Lang): string {
  return dictionaries[lang][key] ?? dictionaries.en[key];
}

/** Like `t`, but replaces `{{name}}` placeholders with `params[name]`. */
export function tf(key: keyof typeof en, lang: Lang, params: Record<string, string | number>): string {
  return t(key, lang).replace(/\{\{(\w+)\}\}/g, (match, name: string) => String(params[name] ?? match));
}
