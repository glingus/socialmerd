// Dismisses the "Usa l'app"/"Use the app" interstitial (docs/PIANO.md §4.4,
// spike point m). CRITICAL: only ever clicks the close (X) icon, never the
// "Usa l'app" button next to it — that would open the native app/App
// Store, the opposite of this project's purpose.
//
// The close icon's aria-label ("Chiudi"/"Close", selectors.ts) is reused
// elsewhere on the page (story viewer, search field) for unrelated close
// buttons, so it can't be targeted globally. Instead we anchor on the CTA
// button's own text (strings.ts, unambiguous) and only click a close icon
// found within a small number of ancestor levels of that button — i.e.
// inside the same banner component, not some unrelated close button
// elsewhere on the page.

import { markProcessed, type Processor } from '../../core/dom-scheduler';
import { APP_BANNER } from './selectors';
import { USE_APP_CTA } from './strings';

const CTA_TEXTS = new Set<string>([...USE_APP_CTA.it, ...USE_APP_CTA.en]);
const MAX_ANCESTOR_LEVELS = 6;

function findCloseIcon(ctaButton: Element): Element | null {
  const closeSelector = APP_BANNER.closeIconAriaLabels.map((label) => `[aria-label="${label}"]`).join(', ');
  let ancestor: Element | null = ctaButton.parentElement;
  for (let i = 0; i < MAX_ANCESTOR_LEVELS && ancestor; i += 1) {
    const closeIcon = ancestor.querySelector(closeSelector);
    if (closeIcon && closeIcon !== ctaButton) return closeIcon;
    ancestor = ancestor.parentElement;
  }
  return null;
}

// SVG icons have no `.click()` method (that's HTMLElement-only), and the
// real close icon may or may not be wrapped in a clickable container — a
// dispatched, bubbling click reaches whichever ancestor actually listens
// for it (React commonly delegates), same as a real tap would.
function dispatchClick(el: Element): void {
  el.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
}

export const processAppBanners: Processor = (root) => {
  for (const button of root.querySelectorAll('button')) {
    const text = button.textContent?.trim() ?? '';
    if (!CTA_TEXTS.has(text)) continue;
    if (!markProcessed(button, 'app-banner')) continue;

    const closeIcon = findCloseIcon(button);
    if (closeIcon) {
      dispatchClick(closeIcon);
    }
  }
};
