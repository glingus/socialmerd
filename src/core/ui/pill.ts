// Discreet time-tracker pill (docs/PIANO.md §4.6): minutes of today on the
// current site, bottom-right above the site's own nav bar. Hidden on
// specific routes so it never sits on top of a reel/story/DM/full-screen
// video.
//
// TODO (needs live verification, like the rest of Fase 2's iPhone-only
// points): the exact bottom offset above Instagram's/YouTube's own nav bar
// wasn't measured live. Uses env(safe-area-inset-bottom) plus a
// conservative fixed offset for now; adjust once seen on the real iPhone.

import type { Lang } from '../i18n';
import { tf, t } from '../i18n';
import { injectStyle } from '../styles';
import type { Host } from './host';

export interface PillVisibilityContext {
  site: 'instagram' | 'youtube';
  pathname: string;
  isFullscreenVideo?: boolean;
}

// verified 2026-09-17 (spike): these are the routes where a fixed
// bottom-right pill would overlap essential UI (comment/share sheets, story
// tap zones, the reel player, the DM composer, full-screen video controls).
const INSTAGRAM_HIDDEN_PREFIXES = ['/direct/t/', '/stories/', '/reel/', '/create/', '/accounts/'];

export function shouldHidePill(ctx: PillVisibilityContext): boolean {
  if (ctx.site === 'instagram') {
    return INSTAGRAM_HIDDEN_PREFIXES.some((prefix) => ctx.pathname.startsWith(prefix));
  }
  return Boolean(ctx.isFullscreenVideo);
}

const STYLE_ID = 'smd-pill-style';

const CSS = `
.smd-pill {
  position: fixed;
  right: 12px;
  bottom: calc(64px + env(safe-area-inset-bottom, 0px));
  z-index: 2147483000;
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 10px;
  border: none;
  border-radius: 999px;
  background: rgba(20, 20, 20, 0.72);
  color: #fff;
  font: 500 12px/1.4 -apple-system, system-ui, sans-serif;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.35);
  backdrop-filter: blur(6px);
}
.smd-pill[hidden] { display: none; }
.smd-pill-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #4da3ff;
}
.smd-pill-dot[hidden] { display: none; }
@media (prefers-color-scheme: light) {
  .smd-pill { background: rgba(255, 255, 255, 0.85); color: #111; box-shadow: 0 1px 4px rgba(0, 0, 0, 0.15); }
}
`;

export interface PillHandle {
  update(minutesToday: number, hasUpdate: boolean, hidden: boolean): void;
  destroy(): void;
}

export function createPill(host: Host, lang: Lang, onActivate: () => void): PillHandle {
  injectStyle(CSS, STYLE_ID);

  const el = document.createElement('button');
  el.type = 'button';
  el.className = 'smd-pill';
  el.setAttribute('aria-label', t('pill.ariaLabel', lang));
  el.addEventListener('click', onActivate);

  const text = document.createElement('span');
  text.className = 'smd-pill-text';
  const dot = document.createElement('span');
  dot.className = 'smd-pill-dot';
  dot.hidden = true;
  dot.setAttribute('aria-hidden', 'true');

  el.append(text, dot);
  host.mount(el);

  return {
    update(minutesToday, hasUpdate, hidden): void {
      el.hidden = hidden;
      text.textContent = tf('pill.minutes', lang, { n: minutesToday });
      dot.hidden = !hasUpdate;
    },
    destroy(): void {
      el.remove();
    },
  };
}
