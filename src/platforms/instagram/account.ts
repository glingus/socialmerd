// Detects the logged-in username (docs/PIANO.md §4.4, spike point l), used
// to key per-account feed state (feed-limiter.ts) and multi-account support.
//
// The bottom nav bar has no stable non-obfuscated container selector (every
// Instagram class is a hashed atomic class), so instead of guessing at one
// we locate it structurally: find the nearest common ancestor of the "Home"
// and "Esplora"/"Explore" icons (both confirmed via aria-label, spike point
// g), then within that ancestor look for the one link that is NOT one of
// the nav bar's fixed routes — that is the profile avatar link, and its
// href segment is the username.

const FIXED_NAV_HREFS = new Set(['/', '/explore/', '/reels/', '/direct/inbox/', '/notifications/']);
const USERNAME_HREF = /^\/([a-zA-Z0-9_.]+)\/$/;

function closestCommonAncestor(a: Element, b: Element): Element | null {
  const ancestors = new Set<Element>();
  for (let node: Element | null = a; node; node = node.parentElement) {
    ancestors.add(node);
  }
  for (let node: Element | null = b; node; node = node.parentElement) {
    if (ancestors.has(node)) return node;
  }
  return null;
}

export const DEFAULT_ACCOUNT = 'default';

export function detectLoggedInUsername(root: ParentNode = document): string {
  const home = root.querySelector('[aria-label="Home"]');
  const explore = root.querySelector('[aria-label="Esplora"], [aria-label="Explore"]');
  if (!home || !explore) return DEFAULT_ACCOUNT;

  const container = closestCommonAncestor(home, explore);
  if (!container) return DEFAULT_ACCOUNT;

  for (const link of container.querySelectorAll('a[href]')) {
    const href = link.getAttribute('href') ?? '';
    if (FIXED_NAV_HREFS.has(href)) continue;
    const match = href.match(USERNAME_HREF);
    if (match?.[1]) return match[1];
  }
  return DEFAULT_ACCOUNT;
}
