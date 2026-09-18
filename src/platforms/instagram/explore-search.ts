// docs/PIANO.md §4.4: on /explore/, hide the grid so only the search field
// is left; on /explore/search/, hide hashtag/location/audio results.
//
// Grid links are safe to target globally by href shape: bare `/p/<code>/`
// and `/reel/<code>/` permalinks (no author prefix) were only ever seen in
// the Explore grid in this spike (docs/spike-findings.md point b/h) — the
// feed and profiles always use the author-prefixed form.
//
// Found live 2026-09-18: hiding grid links only via the JS processor below
// (batched by dom-scheduler) left a real window, during infinite scroll,
// where freshly-inserted grid items were visible AND tappable before the
// next batch ran -- reported as a visible flash that could even be opened
// with the right tap timing. Fixed with CSS gated on the
// `data-smd-ig-route` attribute route-guard.ts sets synchronously: the
// browser hides every matching link (including ones inserted a moment
// later) instantly, with no observer delay. The JS pass below still runs
// too, as a fail-safe for pages that reached /explore/ with the attribute
// somehow stale or missing.

import { markProcessed, type Processor } from '../../core/dom-scheduler';
import { injectStyle } from '../../core/styles';
import type { InstagramRoute } from './routes';

const STYLE_ID = 'smd-explore-grid-style';

injectStyle(
  `
  html[data-smd-ig-route="explore"] a[href^="/p/"],
  html[data-smd-ig-route="explore"] a[href^="/reel/"] {
    display: none !important;
  }
  `,
  STYLE_ID,
);

function hide(el: Element): void {
  (el as HTMLElement).style.display = 'none';
}

export function processExploreGrid(root: ParentNode, route: InstagramRoute): void {
  if (route.kind !== 'explore') return;
  for (const link of root.querySelectorAll('a[href^="/p/"], a[href^="/reel/"]')) {
    if (!markProcessed(link, 'explore-grid')) continue;
    hide(link);
  }
}

export function processExploreSearchResults(root: ParentNode, route: InstagramRoute): void {
  if (route.kind !== 'explore-search') return;
  const selector = [
    'a[href^="/explore/tags/"]',
    'a[href^="/explore/locations/"]',
    'a[href^="/reels/audio/"]',
  ].join(', ');
  for (const link of root.querySelectorAll(selector)) {
    if (!markProcessed(link, 'explore-search-entry')) continue;
    hide(link);
  }
}

export const registerExploreSearchProcessors = (getRoute: () => InstagramRoute): Processor[] => [
  (root) => processExploreGrid(root, getRoute()),
  (root) => processExploreSearchResults(root, getRoute()),
];
