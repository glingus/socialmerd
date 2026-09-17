// docs/PIANO.md §4.4: on a sponsored story, advance automatically (Avanti/
// Next button if present, else a tap on the right third of the screen) —
// at most 3 attempts per story, then give up (no infinite loop).
//
// TODO (needs live verification, docs/spike-findings.md point i): no
// sponsored story appeared in this spike, so the exact sponsor label/markup
// is unconfirmed (SPONSORED_LABEL from strings.ts is reused as the best
// available signal, shared with feed-filter.ts). There is also no stable
// per-story identifier in the URL (the pathname stayed `/stories/<account>/`
// across an entire viewing session in this spike) — the caller supplies
// `getStoryKey`, and index.ts's default (current media element's `src`) is
// a best-effort stand-in until this is confirmed live.

import { SPONSORED_LABEL } from './strings';
import type { InstagramRoute } from './routes';

const MAX_ATTEMPTS_PER_STORY = 3;
const ADVANCE_ARIA_LABELS = ['Avanti', 'Next'];

const attemptsByStory = new Map<string, number>();

function isSponsoredStoryVisible(root: ParentNode): boolean {
  const text = root.textContent ?? '';
  return [...SPONSORED_LABEL.it, ...SPONSORED_LABEL.en].some((needle) => text.includes(needle));
}

function dispatchClick(el: Element, coords?: { clientX: number; clientY: number }): void {
  el.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, ...coords }));
}

function clickAdvanceButton(root: ParentNode): boolean {
  const selector = ADVANCE_ARIA_LABELS.map((label) => `[aria-label="${label}"]`).join(', ');
  const button = root.querySelector(selector);
  if (!button) return false;
  dispatchClick(button);
  return true;
}

function tapRightThird(win: Window = window): void {
  const x = win.innerWidth * 0.85;
  const y = win.innerHeight / 2;
  const el = win.document.elementFromPoint(x, y);
  if (el) dispatchClick(el, { clientX: x, clientY: y });
}

export function processStoriesAds(root: ParentNode, route: InstagramRoute, getStoryKey: () => string): void {
  if (route.kind !== 'stories') return;

  const storyKey = getStoryKey();
  if (!isSponsoredStoryVisible(root)) {
    attemptsByStory.delete(storyKey);
    return;
  }

  const attempts = attemptsByStory.get(storyKey) ?? 0;
  if (attempts >= MAX_ATTEMPTS_PER_STORY) return;
  attemptsByStory.set(storyKey, attempts + 1);

  if (!clickAdvanceButton(root)) {
    tapRightThird();
  }
}

/** Test-only: forgets all per-story attempt counts. */
export function _resetStoriesAdsForTests(): void {
  attemptsByStory.clear();
}
