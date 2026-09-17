// docs/PIANO.md §4.4: on /explore/, hide the grid so only the search field
// is left; on /explore/search/, hide hashtag/location/audio results.
//
// Grid links are safe to target globally by href shape: bare `/p/<code>/`
// and `/reel/<code>/` permalinks (no author prefix) were only ever seen in
// the Explore grid in this spike (docs/spike-findings.md point b/h) — the
// feed and profiles always use the author-prefixed form.

import { markProcessed, type Processor } from '../../core/dom-scheduler';
import type { InstagramRoute } from './routes';

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
