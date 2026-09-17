import { describe, expect, it } from 'vitest';
import { sectionForRoute } from '../../src/platforms/youtube/section';
import type { YoutubeRoute } from '../../src/platforms/youtube/routes';

describe('sectionForRoute', () => {
  it.each([
    [{ kind: 'watch' }, 'video'],
    [{ kind: 'browse' }, 'browse'],
    [{ kind: 'shorts-redirect', videoId: 'x' }, 'browse'],
  ] satisfies [YoutubeRoute, string][])('%o -> %s', (route, section) => {
    expect(sectionForRoute(route)).toBe(section);
  });
});
