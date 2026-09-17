// Maps a classified route (routes.ts) to the time-tracker section key
// (docs/PIANO.md §4.6: ig.feed/dm/stories/profile/reel/search/other).

import type { IgSection } from '../../features/time-tracker';
import type { InstagramRoute } from './routes';

export function sectionForRoute(route: InstagramRoute): IgSection {
  switch (route.kind) {
    case 'feed':
      return 'feed';
    case 'direct':
      return 'dm';
    case 'stories':
      return 'stories';
    case 'profile':
    case 'post':
      return 'profile';
    case 'reel-lock':
      return 'reel';
    case 'explore':
    case 'explore-search':
      return 'search';
    case 'redirect-to-following':
    case 'blocked':
    case 'activity':
    case 'passthrough':
      return 'other';
  }
}
