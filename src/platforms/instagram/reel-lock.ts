// docs/PIANO.md §4.2: while a reel is open in isolation (`/reel/<code>/`,
// bare or author-prefixed, routes.ts), block every gesture that would swipe
// to a next/adjacent reel, and bounce back silently to `origin` if one
// leaks through anyway (autoplay, or a gesture this doesn't catch).
//
// TODO (needs live verification, docs/spike-findings.md point d): the DM
// case (a reel opened from within `/direct/*` without a URL change) is not
// wired in here yet — the spike could not confirm what the DOM looks like
// once such a viewer is actually open (see selectors.ts DM_REEL_SHARE for
// what's confirmed: only the *thumbnail in the thread list*, not the opened
// viewer). Only the confirmed, URL-addressable case is implemented.

import { incrementBlock } from '../../core/blocks';
import { type NavigateActions, getStack, returnSilently } from '../../core/silent-nav';
import type { InstagramRoute } from './routes';

export interface ReelLockState {
  code: string;
  origin: string;
}

const FALLBACK_URL = '/?variant=following';
const EXEMPT_SELECTOR = [
  'input',
  'textarea',
  '[contenteditable="true"]',
  '[role="dialog"]',
  '[aria-label="Commenta"]',
  '[aria-label="Comment"]',
  '[aria-label="Condividi"]',
  '[aria-label="Share"]',
  '[aria-label="Altre opzioni"]',
  '[aria-label="More options"]',
].join(', ');

// --- Pure decision logic ----------------------------------------------------

export type ReelLockAction =
  | { type: 'engage'; code: string; origin: string }
  | { type: 'swiped-next'; origin: string }
  | { type: 'release' }
  | { type: 'noop' };

/** Given the currently held lock (if any) and the newly classified route,
 * decides what reel-lock.ts should do. Pure — no DOM, no navigation. */
export function decideReelLockAction(
  current: ReelLockState | null,
  route: InstagramRoute,
  previousUrl: string | null,
): ReelLockAction {
  if (route.kind === 'reel-lock') {
    if (!current) {
      return { type: 'engage', code: route.code ?? '', origin: previousUrl ?? FALLBACK_URL };
    }
    if (current.code !== route.code) {
      return { type: 'swiped-next', origin: current.origin };
    }
    return { type: 'noop' };
  }
  return current ? { type: 'release' } : { type: 'noop' };
}

// --- Gesture blocking --------------------------------------------------------

function isExempt(target: EventTarget | null): boolean {
  return target instanceof Element ? target.closest(EXEMPT_SELECTOR) !== null : false;
}

function preventUnlessExempt(event: Event): void {
  if (isExempt(event.target)) return;
  event.preventDefault();
}

const ADVANCE_KEYS = new Set(['ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', ' ']);

function blockKeys(event: KeyboardEvent): void {
  if (isExempt(event.target)) return;
  if (ADVANCE_KEYS.has(event.key)) event.preventDefault();
}

export interface GestureBlockHandle {
  release: () => void;
}

/** Installs capture-phase listeners that block vertical swipe/scroll/key
 * gestures (docs/PIANO.md §4.2), letting them through for the documented
 * exceptions (comments sheet, share sheet, menus, inputs). Capture-phase so
 * it works across the isolated/page-world boundary (docs/PIANO.md §3.4). */
export function blockAdjacentReelGestures(target: Document | HTMLElement = document): GestureBlockHandle {
  const options = { capture: true, passive: false } as const;
  target.addEventListener('touchmove', preventUnlessExempt, options);
  target.addEventListener('wheel', preventUnlessExempt, options);
  target.addEventListener('keydown', blockKeys as EventListener, options);

  return {
    release(): void {
      target.removeEventListener('touchmove', preventUnlessExempt, options);
      target.removeEventListener('wheel', preventUnlessExempt, options);
      target.removeEventListener('keydown', blockKeys as EventListener, options);
    },
  };
}

// --- Stateful wiring ---------------------------------------------------------

export interface ReelLockController {
  handleRoute(route: InstagramRoute, navigate?: NavigateActions): void;
  isLocked(): boolean;
}

const defaultNavigate: NavigateActions = {
  back: () => history.back(),
  replace: (url) => location.replace(url),
};

/** Wires the pure decision to real gesture blocking + silent-nav. Reads the
 * previous URL from the silent-nav stack (route-guard.ts already pushed the
 * new reel URL onto it by the time this runs, so the entry before it is the
 * true origin). */
export function createReelLockController(): ReelLockController {
  let current: ReelLockState | null = null;
  let gestureHandle: GestureBlockHandle | null = null;

  return {
    isLocked: () => current !== null,
    handleRoute(route, navigate = defaultNavigate): void {
      const stack = getStack();
      const previousUrl = stack.length >= 2 ? (stack[stack.length - 2] ?? null) : null;
      const action = decideReelLockAction(current, route, previousUrl);

      switch (action.type) {
        case 'engage':
          current = { code: action.code, origin: action.origin };
          gestureHandle = blockAdjacentReelGestures();
          break;
        case 'swiped-next':
          void incrementBlock('reel_next');
          gestureHandle?.release();
          gestureHandle = null;
          current = null;
          returnSilently(action.origin, navigate);
          break;
        case 'release':
          gestureHandle?.release();
          gestureHandle = null;
          current = null;
          break;
        case 'noop':
          break;
      }
    },
  };
}
