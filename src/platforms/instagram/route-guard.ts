// Wires routes.ts to core/silent-nav + core/url-watcher (docs/PIANO.md
// §4.1): classifies every URL (initial load at document-start, and every
// SPA navigation caught by url-watcher) and either lets it through (pushed
// onto the silent-nav stack) or bounces it back silently.

import { incrementBlock } from '../../core/blocks';
import { type NavigateActions, pushAllowed, returnSilently } from '../../core/silent-nav';
import { watchUrl } from '../../core/url-watcher';
import { classifyInstagramRoute, type InstagramRoute } from './routes';

const FALLBACK_URL = '/?variant=following';

const defaultNavigate: NavigateActions = {
  back: () => history.back(),
  replace: (url) => location.replace(url),
};

/** Classifies `url` and applies the routing decision. Pure with respect to
 * navigation side effects (injected via `navigate`), so it's unit-testable
 * without a real location/history. Returns the classification so callers
 * (index.ts) can react to it, e.g. to engage reel-lock.ts. */
export function handleRoute(url: string, navigate: NavigateActions = defaultNavigate): InstagramRoute {
  const { pathname, search } = new URL(url, location.origin);
  const route = classifyInstagramRoute(pathname, search);

  switch (route.kind) {
    case 'redirect-to-following':
      navigate.replace(FALLBACK_URL);
      break;
    case 'blocked':
      void incrementBlock('blocked_route');
      returnSilently(FALLBACK_URL, navigate);
      break;
    default:
      pushAllowed(url);
  }
  return route;
}

export interface RouteGuardHandle {
  stop: () => void;
}

/** Starts the guard: classifies the current URL immediately (call this at
 * document-start, before paint) and then on every subsequent SPA navigation. */
export function startRouteGuard(
  onRoute?: (route: InstagramRoute, url: string) => void,
  navigate: NavigateActions = defaultNavigate,
): RouteGuardHandle {
  const run = (url: string): void => {
    const route = handleRoute(url, navigate);
    onRoute?.(route, url);
  };

  run(location.href);
  const stopWatching = watchUrl(run);

  return { stop: stopWatching };
}
