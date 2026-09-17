import { describe, expect, it } from 'vitest';
import { sectionForRoute } from '../../src/platforms/instagram/section';
import type { InstagramRoute } from '../../src/platforms/instagram/routes';

describe('sectionForRoute', () => {
  it.each([
    [{ kind: 'feed' }, 'feed'],
    [{ kind: 'direct' }, 'dm'],
    [{ kind: 'stories' }, 'stories'],
    [{ kind: 'profile' }, 'profile'],
    [{ kind: 'post', code: 'x' }, 'profile'],
    [{ kind: 'reel-lock', code: 'x' }, 'reel'],
    [{ kind: 'explore' }, 'search'],
    [{ kind: 'explore-search' }, 'search'],
    [{ kind: 'redirect-to-following' }, 'other'],
    [{ kind: 'blocked' }, 'other'],
    [{ kind: 'activity' }, 'other'],
    [{ kind: 'passthrough' }, 'other'],
  ] satisfies [InstagramRoute, string][])('%o -> %s', (route, section) => {
    expect(sectionForRoute(route)).toBe(section);
  });
});
