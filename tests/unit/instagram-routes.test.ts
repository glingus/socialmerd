import { describe, expect, it } from 'vitest';
import {
  classifyInstagramRoute,
  parsePostPermalinkHref,
  parseReelPermalinkHref,
} from '../../src/platforms/instagram/routes';

// Table mirrors docs/PIANO.md §4.1, plus the two permalink shapes confirmed
// live in docs/spike-findings.md point (b): bare (from Explore) and
// author-prefixed (from the feed and profiles).
describe('classifyInstagramRoute', () => {
  it.each([
    ['/', '', 'redirect-to-following'],
    ['/', '?variant=following', 'feed'],
    ['/', '?variant=favorites', 'feed'],
    ['/reels/', '', 'blocked'],
    ['/reels/audio/123/', '', 'blocked'],
    ['/reel/DdZt_PXSJpg/', '', 'reel-lock'],
    ['/ufc/reel/DdZt_PXSJpg/', '', 'reel-lock'],
    ['/p/DcjhY71hZBF/', '', 'post'],
    ['/juventus/p/DdZtj1jCOuB/', '', 'post'],
    ['/someuser/', '', 'profile'],
    ['/someuser/reels/', '', 'profile'],
    ['/someuser/tagged/', '', 'profile'],
    ['/explore/', '', 'explore'],
    ['/explore/search/', '', 'explore-search'],
    ['/explore/tags/calcio/', '', 'blocked'],
    ['/explore/locations/123/', '', 'blocked'],
    ['/explore/people/', '', 'blocked'],
    ['/direct/inbox/', '', 'direct'],
    ['/direct/t/12345/', '', 'direct'],
    ['/stories/juventus/', '', 'stories'],
    ['/accounts/activity/', '', 'activity'],
    ['/accounts/edit/', '', 'passthrough'],
    ['/create/style/', '', 'passthrough'],
    ['/challenge/', '', 'passthrough'],
    ['/notifications/', '', 'passthrough'],
  ] as const)('%s%s -> %s', (pathname, search, kind) => {
    expect(classifyInstagramRoute(pathname, search).kind).toBe(kind);
  });

  it('extracts the reel code for bare and prefixed reel permalinks', () => {
    expect(classifyInstagramRoute('/reel/DdZt_PXSJpg/').code).toBe('DdZt_PXSJpg');
    expect(classifyInstagramRoute('/ufc/reel/DdZt_PXSJpg/').code).toBe('DdZt_PXSJpg');
  });

  it('extracts the post code for bare and prefixed post permalinks', () => {
    expect(classifyInstagramRoute('/p/DcjhY71hZBF/').code).toBe('DcjhY71hZBF');
    expect(classifyInstagramRoute('/juventus/p/DdZtj1jCOuB/').code).toBe('DdZtj1jCOuB');
  });

  it('treats explore sub-paths it does not recognize as passthrough', () => {
    expect(classifyInstagramRoute('/explore/something-new/').kind).toBe('passthrough');
  });
});

describe('parseReelPermalinkHref / parsePostPermalinkHref', () => {
  it('parses bare and prefixed reel permalinks', () => {
    expect(parseReelPermalinkHref('/reel/DdZt_PXSJpg/')).toBe('DdZt_PXSJpg');
    expect(parseReelPermalinkHref('/ufc/reel/DdZt_PXSJpg/')).toBe('DdZt_PXSJpg');
  });

  it('parses bare and prefixed post permalinks', () => {
    expect(parsePostPermalinkHref('/p/DcjhY71hZBF/')).toBe('DcjhY71hZBF');
    expect(parsePostPermalinkHref('/juventus/p/DcjhY71hZBF/')).toBe('DcjhY71hZBF');
  });

  it('returns null for unrelated hrefs', () => {
    expect(parseReelPermalinkHref('/juventus/')).toBeNull();
    expect(parsePostPermalinkHref('/explore/')).toBeNull();
  });
});
