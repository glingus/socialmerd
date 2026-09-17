// Wires all Instagram feature modules together (docs/PIANO.md Fase 4).
// Registers one processor per feature with the shared dom-scheduler
// (docs/PIANO.md §3.4: a single MutationObserver, not one per feature), and
// starts the route guard, which also drives reel-lock's engage/release.

import { registerProcessor } from '../../core/dom-scheduler';
import { detectLoggedInUsername } from './account';
import { processAppBanners } from './app-banners';
import { registerExploreSearchProcessors } from './explore-search';
import { registerFeedFilterProcessor } from './feed-filter';
import { registerFeedLimiterProcessor } from './feed-limiter';
import { registerFeedReelsPlaceholderProcessor } from './feed-reels-placeholder';
import { processNavCleanup } from './nav-cleanup';
import { createReelLockController } from './reel-lock';
import { classifyInstagramRoute, type InstagramRoute } from './routes';
import { startRouteGuard } from './route-guard';
import { processStoriesAds } from './stories-ads';

/** Best-effort "which story is on screen" key for stories-ads.ts's per-story
 * attempt limit, until docs/spike-findings.md point (i) confirms something
 * more stable. See stories-ads.ts for why the URL alone isn't enough. */
function currentStoryKey(): string {
  const media = document.querySelector('video, img[srcset]');
  return media?.getAttribute('src') ?? location.href;
}

/** `onRoute` fires with the initial route synchronously (before this
 * function returns) and again on every SPA navigation -- used by main.ts to
 * feed the time-tracker section and the pill's visibility rule. */
export function startInstagramPlatform(onRoute?: (route: InstagramRoute) => void): () => void {
  let currentRoute: InstagramRoute = classifyInstagramRoute(location.pathname, location.search);
  const getRoute = (): InstagramRoute => currentRoute;

  const reelLock = createReelLockController();

  const routeGuard = startRouteGuard((route) => {
    currentRoute = route;
    reelLock.handleRoute(route);
    onRoute?.(route);
  });

  const processors = [
    processNavCleanup,
    processAppBanners,
    ...registerExploreSearchProcessors(getRoute),
    registerFeedFilterProcessor(getRoute),
    registerFeedReelsPlaceholderProcessor(getRoute),
    registerFeedLimiterProcessor(getRoute, { getAccount: () => detectLoggedInUsername() }),
    (root: ParentNode) => processStoriesAds(root, getRoute(), currentStoryKey),
  ];

  const unregisterAll = processors.map(registerProcessor);

  return () => {
    routeGuard.stop();
    for (const unregister of unregisterAll) unregister();
  };
}
