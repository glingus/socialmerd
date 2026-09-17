// Maps a classified route (routes.ts) to the time-tracker section key
// (docs/PIANO.md §4.6: yt.video/browse).

import type { YtSection } from '../../features/time-tracker';
import type { YoutubeRoute } from './routes';

export function sectionForRoute(route: YoutubeRoute): YtSection {
  return route.kind === 'watch' ? 'video' : 'browse';
}
