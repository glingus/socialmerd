import { describe, expect, it } from 'vitest';
import { classifyYoutubeRoute, watchUrlFor } from '../../src/platforms/youtube/routes';

// Table mirrors docs/PIANO.md §4.5, confirmed live in docs/spike-findings.md
// point (p): /shorts/<id> has no automatic redirect, so we do it ourselves.
describe('classifyYoutubeRoute', () => {
  it.each([
    ['/shorts/9B0Wel2Ki-o', 'shorts-redirect'],
    ['/shorts/SPNcylLr3Mw/', 'shorts-redirect'],
    ['/watch', 'watch'],
    ['/', 'browse'],
    ['/feed/subscriptions', 'browse'],
    ['/results', 'browse'],
  ] as const)('%s -> %s', (pathname, kind) => {
    expect(classifyYoutubeRoute(pathname).kind).toBe(kind);
  });

  it('extracts the video id from a Shorts path', () => {
    expect(classifyYoutubeRoute('/shorts/9B0Wel2Ki-o').videoId).toBe('9B0Wel2Ki-o');
  });

  it('does not set a videoId for non-Shorts routes', () => {
    expect(classifyYoutubeRoute('/watch').videoId).toBeUndefined();
    expect(classifyYoutubeRoute('/').videoId).toBeUndefined();
  });
});

describe('watchUrlFor', () => {
  it('builds a /watch?v= URL from a video id', () => {
    expect(watchUrlFor('9B0Wel2Ki-o')).toBe('/watch?v=9B0Wel2Ki-o');
  });
});
