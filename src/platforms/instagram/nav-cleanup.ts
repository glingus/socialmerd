// Hides every link to the global Reels feed (docs/PIANO.md §4.4) so the
// route guard's silent bounce (route-guard.ts) is never even seen — without
// this, tapping the nav icon would flash the reels feed for a frame before
// bouncing back. Only the bare `/reels/` link is hidden: a profile's own
// Reels tab (`/<user>/reels/`) is a different, allowed route (routes.ts)
// and must stay visible.

import { markProcessed, type Processor } from '../../core/dom-scheduler';

export const processNavCleanup: Processor = (root) => {
  for (const link of root.querySelectorAll('a[href="/reels/"]')) {
    if (!markProcessed(link, 'nav-cleanup')) continue;
    (link as HTMLElement).style.display = 'none';
  }
};
