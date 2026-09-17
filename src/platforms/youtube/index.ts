// Wires the YouTube Shorts blocker together (docs/PIANO.md Fase 5): a
// straight URL redirect away from `/shorts/<id>`, plus DOM hiding of every
// other Shorts entry point (shelves, bottom tab, loose cards). No
// route-guard/silent-nav needed here unlike Instagram: there is nothing to
// "return" to, just one always-safe redirect target (`/watch?v=<id>`).

import { incrementBlock } from '../../core/blocks';
import { registerProcessor } from '../../core/dom-scheduler';
import { watchUrl } from '../../core/url-watcher';
import { classifyYoutubeRoute, watchUrlFor, type YoutubeRoute } from './routes';
import { processShortsHider } from './shorts-hider';

function redirectAwayFromShorts(route: YoutubeRoute): void {
  if (route.kind !== 'shorts-redirect' || !route.videoId) return;
  void incrementBlock('blocked_route');
  location.replace(watchUrlFor(route.videoId));
}

export function startYoutubePlatform(): () => void {
  redirectAwayFromShorts(classifyYoutubeRoute(location.pathname));

  const stopWatching = watchUrl((url) => {
    redirectAwayFromShorts(classifyYoutubeRoute(new URL(url, location.origin).pathname));
  });

  const unregister = registerProcessor(processShortsHider);

  return () => {
    stopWatching();
    unregister();
  };
}
