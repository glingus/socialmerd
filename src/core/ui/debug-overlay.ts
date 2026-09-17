// Debug overlay (docs/PIANO.md §4.6): opened by 5 taps on the version
// number in the panel (panel.ts). There's no Web Inspector for a userscript
// on iOS Safari/Orion, so this is the only way to see logs and feature
// probes on the real device. Also covers spike point (q)'s page-world probe
// (docs/spike-findings.md), which was never meant to change behaviour --
// only to be visible somewhere for the user to report back.

import { getMarkerCounts } from '../dom-scheduler';
import { hasGM } from '../gm';
import type { Lang } from '../i18n';
import { t } from '../i18n';
import { getLogEntries } from '../log';
import { injectStyle } from '../styles';
import type { Host } from './host';

const STYLE_ID = 'smd-debug-style';

const CSS = `
.smd-debug-backdrop {
  position: fixed;
  inset: 0;
  z-index: 2147483004;
  background: rgba(0, 0, 0, 0.6);
}
.smd-debug-backdrop[hidden] { display: none; }
.smd-debug {
  position: fixed;
  inset: 40px 12px;
  overflow-y: auto;
  padding: 16px;
  border-radius: 12px;
  background: #111;
  color: #0f0;
  font: 11px/1.5 ui-monospace, 'SF Mono', monospace;
}
.smd-debug[hidden] { display: none; }
.smd-debug h3 { margin: 12px 0 4px; color: #fff; font-size: 12px; text-transform: uppercase; }
.smd-debug-close {
  display: block;
  margin-left: auto;
  padding: 6px 12px;
  border: none;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.15);
  color: #fff;
  font: inherit;
}
.smd-debug-line { white-space: pre-wrap; word-break: break-word; }
.smd-debug-line.warn { color: #ff0; }
.smd-debug-line.error { color: #f55; }
`;

export interface FeatureProbes {
  hasGM: boolean;
  hasNavigationApi: boolean;
  /** typeof (window as any).unsafeWindow -- 'undefined' on a normal
   * content-world injection (docs/PIANO.md §3.4, spike point q). Any other
   * value doesn't change what the script does; it's reporting-only. */
  unsafeWindowType: string;
}

export function probeFeatures(): FeatureProbes {
  return {
    hasGM: hasGM(),
    hasNavigationApi: typeof (window as unknown as { navigation?: unknown }).navigation !== 'undefined',
    unsafeWindowType: typeof (window as unknown as { unsafeWindow?: unknown }).unsafeWindow,
  };
}

export interface DebugOverlayHandle {
  open(): void;
  close(): void;
  isOpen(): boolean;
  destroy(): void;
}

export function createDebugOverlay(host: Host, lang: Lang): DebugOverlayHandle {
  injectStyle(CSS, STYLE_ID);

  const backdrop = document.createElement('div');
  backdrop.className = 'smd-debug-backdrop';
  backdrop.hidden = true;

  const panel = document.createElement('div');
  panel.className = 'smd-debug';
  panel.hidden = true;
  panel.setAttribute('role', 'dialog');
  panel.setAttribute('aria-modal', 'true');

  const close = (): void => {
    backdrop.hidden = true;
    panel.hidden = true;
  };
  backdrop.addEventListener('click', close);

  function render(): void {
    const closeButton = document.createElement('button');
    closeButton.type = 'button';
    closeButton.className = 'smd-debug-close';
    closeButton.textContent = t('debug.close', lang);
    closeButton.addEventListener('click', close);

    const title = document.createElement('h2');
    title.textContent = t('debug.title', lang);

    const probesHeading = document.createElement('h3');
    probesHeading.textContent = t('debug.featureProbes', lang);
    const probes = probeFeatures();
    const probesLines = document.createElement('div');
    probesLines.className = 'smd-debug-line';
    probesLines.textContent = [
      `GM: ${probes.hasGM}`,
      `navigation API: ${probes.hasNavigationApi}`,
      `typeof unsafeWindow: ${probes.unsafeWindowType}`,
    ].join('\n');

    const countsHeading = document.createElement('h3');
    countsHeading.textContent = t('debug.selectorCounts', lang);
    const countsLines = document.createElement('div');
    countsLines.className = 'smd-debug-line';
    const counts = [...getMarkerCounts().entries()];
    countsLines.textContent =
      counts.length > 0 ? counts.map(([marker, n]) => `${marker}: ${n}`).join('\n') : t('debug.noLogs', lang);

    const logHeading = document.createElement('h3');
    logHeading.textContent = t('debug.logTitle', lang);
    const logEntries = getLogEntries();
    const logContainer = document.createElement('div');
    if (logEntries.length === 0) {
      const empty = document.createElement('div');
      empty.className = 'smd-debug-line';
      empty.textContent = t('debug.noLogs', lang);
      logContainer.appendChild(empty);
    } else {
      for (const entry of [...logEntries].reverse()) {
        const line = document.createElement('div');
        line.className = `smd-debug-line ${entry.level}`;
        const time = new Date(entry.time).toISOString().slice(11, 19);
        line.textContent = `[${time}] ${entry.message}`;
        logContainer.appendChild(line);
      }
    }

    panel.replaceChildren(
      closeButton,
      title,
      probesHeading,
      probesLines,
      countsHeading,
      countsLines,
      logHeading,
      logContainer,
    );
  }

  host.mount(backdrop);
  host.mount(panel);

  return {
    open(): void {
      render();
      backdrop.hidden = false;
      panel.hidden = false;
    },
    close,
    isOpen(): boolean {
      return !panel.hidden;
    },
    destroy(): void {
      backdrop.remove();
      panel.remove();
    },
  };
}
