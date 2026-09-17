// Bottom-sheet panel (docs/PIANO.md §4.6): today's stats, a 7-day chart,
// blocks snapped, extra settings, and info. Rebuilds its content from fresh
// data every time it opens rather than trying to keep a live diff, since
// storage reads are effectively instant and this avoids a whole class of
// stale-state bugs for something opened a handful of times per session.

import type { DayStats } from '../storage';
import { resetAllStats } from '../storage';
import type { WeekDay } from '../../features/stats';
import { getLast7Days, igMinutes, totalBlocks, ytMinutes } from '../../features/stats';
import { getSettings, updateSettings, type Settings } from '../settings';
import type { Lang, LangOverride } from '../i18n';
import { t } from '../i18n';
import { injectStyle } from '../styles';
import type { Host } from './host';
import { renderBars } from './bars';

const STYLE_ID = 'smd-panel-style';
const DEBUG_TAP_COUNT = 5;
const DEBUG_TAP_WINDOW_MS = 2000;

const CSS = `
.smd-panel-backdrop {
  position: fixed;
  inset: 0;
  z-index: 2147483001;
  background: rgba(0, 0, 0, 0.4);
}
.smd-panel-backdrop[hidden] { display: none; }
.smd-panel {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 2147483002;
  max-height: 80vh;
  overflow-y: auto;
  padding: 16px 16px calc(16px + env(safe-area-inset-bottom, 0px));
  border-radius: 16px 16px 0 0;
  background: #1c1c1e;
  color: #fff;
  font: 14px/1.5 -apple-system, system-ui, sans-serif;
}
.smd-panel[hidden] { display: none; }
@media (prefers-color-scheme: light) {
  .smd-panel { background: #fff; color: #111; }
}
.smd-panel-close {
  display: block;
  margin: 0 0 12px auto;
  padding: 6px 12px;
  border: none;
  border-radius: 8px;
  background: rgba(127, 127, 127, 0.2);
  color: inherit;
  font: inherit;
}
.smd-panel-section { margin-bottom: 20px; }
.smd-panel-section h3 { margin: 0 0 8px; font-size: 13px; text-transform: uppercase; opacity: 0.6; }
.smd-panel-row { display: flex; justify-content: space-between; padding: 4px 0; }
.smd-panel-row label { display: flex; justify-content: space-between; width: 100%; align-items: center; gap: 8px; }
.smd-panel-button {
  padding: 8px 14px;
  border: none;
  border-radius: 8px;
  background: rgba(255, 69, 58, 0.15);
  color: #ff453a;
  font: inherit;
}
.smd-panel-link { color: #4da3ff; }
.smd-panel-note { opacity: 0.6; font-size: 12px; margin-top: 8px; }
.smd-bars { display: flex; gap: 6px; align-items: flex-end; height: 60px; }
.smd-bars-col { display: flex; flex-direction: column; align-items: center; flex: 1; height: 100%; }
.smd-bars-track { flex: 1; width: 100%; display: flex; align-items: flex-end; }
.smd-bars-fill { width: 100%; min-height: 2px; border-radius: 3px; background: #4da3ff; }
.smd-bars-label { font-size: 10px; opacity: 0.6; margin-top: 4px; }
`;

function row(labelText: string, valueText: string): HTMLElement {
  const el = document.createElement('div');
  el.className = 'smd-panel-row';
  const label = document.createElement('span');
  label.textContent = labelText;
  const value = document.createElement('span');
  value.textContent = valueText;
  el.append(label, value);
  return el;
}

function section(titleText: string): HTMLElement {
  const el = document.createElement('div');
  el.className = 'smd-panel-section';
  const heading = document.createElement('h3');
  heading.textContent = titleText;
  el.appendChild(heading);
  return el;
}

function buildTodaySection(today: DayStats, lang: Lang): HTMLElement {
  const el = section(t('panel.today', lang));
  el.appendChild(row(t('panel.instagram', lang), `${igMinutes(today)} min`));
  const igSections: [keyof DayStats['ig'], string][] = [
    ['feed', 'section.feed'],
    ['dm', 'section.dm'],
    ['stories', 'section.stories'],
    ['profile', 'section.profile'],
    ['reel', 'section.reel'],
    ['search', 'section.search'],
    ['other', 'section.other'],
  ];
  for (const [key, labelKey] of igSections) {
    const seconds = today.ig[key];
    if (seconds === 0) continue;
    el.appendChild(row(`· ${t(labelKey as Parameters<typeof t>[0], lang)}`, `${Math.round(seconds / 60)} min`));
  }

  el.appendChild(row(t('panel.youtube', lang), `${ytMinutes(today)} min`));
  const ytSections: [keyof DayStats['yt'], string][] = [
    ['video', 'section.video'],
    ['browse', 'section.browse'],
  ];
  for (const [key, labelKey] of ytSections) {
    const seconds = today.yt[key];
    if (seconds === 0) continue;
    el.appendChild(row(`· ${t(labelKey as Parameters<typeof t>[0], lang)}`, `${Math.round(seconds / 60)} min`));
  }
  return el;
}

function weekdayLabel(dateIso: string, lang: Lang): string {
  const weekday = new Date(`${dateIso}T00:00:00Z`).toLocaleDateString(lang === 'it' ? 'it-IT' : 'en-US', {
    weekday: 'short',
    timeZone: 'UTC',
  });
  return weekday.slice(0, 3);
}

function buildWeekSection(days: WeekDay[], lang: Lang): HTMLElement {
  const el = section(t('panel.last7days', lang));

  const igRow = document.createElement('div');
  const igLabel = document.createElement('div');
  igLabel.className = 'smd-panel-note';
  igLabel.textContent = t('panel.instagram', lang);
  igRow.appendChild(igLabel);
  igRow.appendChild(
    renderBars(
      days.map((d) => ({ label: weekdayLabel(d.date, lang), value: igMinutes(d.stats) })),
      (v) => `${v} min`,
    ),
  );
  el.appendChild(igRow);

  const ytRow = document.createElement('div');
  ytRow.style.marginTop = '12px';
  const ytLabel = document.createElement('div');
  ytLabel.className = 'smd-panel-note';
  ytLabel.textContent = t('panel.youtube', lang);
  ytRow.appendChild(ytLabel);
  ytRow.appendChild(
    renderBars(
      days.map((d) => ({ label: weekdayLabel(d.date, lang), value: ytMinutes(d.stats) })),
      (v) => `${v} min`,
    ),
  );
  el.appendChild(ytRow);

  return el;
}

function buildBlocksSection(today: DayStats, days: WeekDay[], lang: Lang): HTMLElement {
  const el = section(t('panel.blocksSnapped', lang));
  const weekTotal = days.reduce((sum, d) => sum + totalBlocks(d.stats), 0);
  el.appendChild(row(t('panel.today', lang), String(totalBlocks(today))));
  el.appendChild(row(t('panel.last7days', lang), String(weekTotal)));
  return el;
}

function buildSettingsSection(
  settings: Settings,
  lang: Lang,
  onChange: (patch: Partial<Settings>) => void,
): HTMLElement {
  const el = section(t('panel.settings', lang));

  const pillRow = document.createElement('div');
  pillRow.className = 'smd-panel-row';
  const pillLabel = document.createElement('label');
  const pillText = document.createElement('span');
  pillText.textContent = t('panel.pillToggle', lang);
  const pillCheckbox = document.createElement('input');
  pillCheckbox.type = 'checkbox';
  pillCheckbox.checked = settings.pillEnabled;
  pillCheckbox.addEventListener('change', () => onChange({ pillEnabled: pillCheckbox.checked }));
  pillLabel.append(pillText, pillCheckbox);
  pillRow.appendChild(pillLabel);
  el.appendChild(pillRow);

  const updateRow = document.createElement('div');
  updateRow.className = 'smd-panel-row';
  const updateLabel = document.createElement('label');
  const updateText = document.createElement('span');
  updateText.textContent = t('panel.updateCheckToggle', lang);
  const updateCheckbox = document.createElement('input');
  updateCheckbox.type = 'checkbox';
  updateCheckbox.checked = settings.updateCheckEnabled;
  updateCheckbox.addEventListener('change', () => onChange({ updateCheckEnabled: updateCheckbox.checked }));
  updateLabel.append(updateText, updateCheckbox);
  updateRow.appendChild(updateLabel);
  el.appendChild(updateRow);

  const langRow = document.createElement('div');
  langRow.className = 'smd-panel-row';
  const langLabel = document.createElement('label');
  const langText = document.createElement('span');
  langText.textContent = t('panel.language', lang);
  const langSelect = document.createElement('select');
  const options: [LangOverride, string][] = [
    ['auto', t('panel.languageAuto', lang)],
    ['it', t('panel.languageIt', lang)],
    ['en', t('panel.languageEn', lang)],
  ];
  for (const [value, text] of options) {
    const option = document.createElement('option');
    option.value = value;
    option.textContent = text;
    option.selected = settings.langOverride === value;
    langSelect.appendChild(option);
  }
  langSelect.addEventListener('change', () => onChange({ langOverride: langSelect.value as LangOverride }));
  langLabel.append(langText, langSelect);
  langRow.appendChild(langLabel);
  el.appendChild(langRow);

  const resetButton = document.createElement('button');
  resetButton.type = 'button';
  resetButton.className = 'smd-panel-button';
  resetButton.textContent = t('panel.resetStats', lang);
  resetButton.addEventListener('click', () => {
    if (!confirm(t('panel.resetStatsConfirm', lang))) return;
    void resetAllStats();
  });
  el.appendChild(resetButton);

  const note = document.createElement('p');
  note.className = 'smd-panel-note';
  note.textContent = t('panel.baseBlocksNote', lang);
  el.appendChild(note);

  return el;
}

function buildInfoSection(
  version: string,
  channel: string,
  lang: Lang,
  hasUpdate: boolean,
  onDebugTap: () => void,
): HTMLElement {
  const el = section(t('panel.info', lang));

  let taps = 0;
  let tapTimer: ReturnType<typeof setTimeout> | null = null;
  const versionLine = document.createElement('p');
  versionLine.textContent = `socialmerd ${version} (${channel})`;
  versionLine.addEventListener('click', () => {
    taps += 1;
    if (tapTimer) clearTimeout(tapTimer);
    tapTimer = setTimeout(() => {
      taps = 0;
    }, DEBUG_TAP_WINDOW_MS);
    if (taps >= DEBUG_TAP_COUNT) {
      taps = 0;
      if (tapTimer) clearTimeout(tapTimer);
      onDebugTap();
    }
  });
  el.appendChild(versionLine);

  if (hasUpdate) {
    const updateLine = document.createElement('p');
    updateLine.textContent = t('panel.updateAvailable', lang);
    el.appendChild(updateLine);
  }

  const link = document.createElement('a');
  link.className = 'smd-panel-link';
  link.href = 'https://github.com/glingus/socialmerd';
  link.target = '_blank';
  link.rel = 'noopener noreferrer';
  link.textContent = t('panel.githubLink', lang);
  el.appendChild(link);

  return el;
}

export interface PanelOptions {
  getLang: () => Lang;
  version: string;
  channel: string;
  hasUpdate?: () => boolean;
  onSettingsChanged?: (settings: Settings) => void;
  onDebugTap?: () => void;
}

export interface PanelHandle {
  toggle(): void | Promise<void>;
  open(): Promise<void>;
  close(): void;
  isOpen(): boolean;
  destroy(): void;
}

export function createPanel(host: Host, options: PanelOptions): PanelHandle {
  injectStyle(CSS, STYLE_ID);

  const backdrop = document.createElement('div');
  backdrop.className = 'smd-panel-backdrop';
  backdrop.hidden = true;

  const sheet = document.createElement('div');
  sheet.className = 'smd-panel';
  sheet.hidden = true;
  sheet.setAttribute('role', 'dialog');
  sheet.setAttribute('aria-modal', 'true');

  const close = (): void => {
    backdrop.hidden = true;
    sheet.hidden = true;
  };
  backdrop.addEventListener('click', close);

  const closeButton = document.createElement('button');
  closeButton.type = 'button';
  closeButton.className = 'smd-panel-close';
  closeButton.addEventListener('click', close);

  host.mount(backdrop);
  host.mount(sheet);

  async function render(): Promise<void> {
    const lang = options.getLang();
    closeButton.textContent = t('panel.close', lang);

    const [days, settings] = await Promise.all([getLast7Days(), getSettings()]);
    const today = days[days.length - 1]?.stats;
    if (!today) return;

    sheet.replaceChildren(
      closeButton,
      buildTodaySection(today, lang),
      buildWeekSection(days, lang),
      buildBlocksSection(today, days, lang),
      buildSettingsSection(settings, lang, (patch) => {
        void updateSettings(patch).then((next) => {
          options.onSettingsChanged?.(next);
          void render();
        });
      }),
      buildInfoSection(options.version, options.channel, lang, options.hasUpdate?.() ?? false, () => {
        close();
        options.onDebugTap?.();
      }),
    );
  }

  return {
    open(): Promise<void> {
      backdrop.hidden = false;
      sheet.hidden = false;
      return render();
    },
    close,
    isOpen(): boolean {
      return !sheet.hidden;
    },
    toggle(): void | Promise<void> {
      if (sheet.hidden) {
        backdrop.hidden = false;
        sheet.hidden = false;
        return render();
      }
      close();
      return undefined;
    },
    destroy(): void {
      backdrop.remove();
      sheet.remove();
    },
  };
}
