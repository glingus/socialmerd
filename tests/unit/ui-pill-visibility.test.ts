import { describe, expect, it } from 'vitest';
import { shouldHidePill } from '../../src/core/ui/pill';

describe('shouldHidePill', () => {
  it.each([
    ['/direct/t/12345/', true],
    ['/stories/juventus/', true],
    ['/reel/abc123/', true],
    ['/create/style/', true],
    ['/accounts/activity/', true],
    ['/?variant=following', false],
    ['/someuser/', false],
    ['/explore/', false],
  ] as const)('instagram %s -> hidden=%s', (pathname, hidden) => {
    expect(shouldHidePill({ site: 'instagram', pathname })).toBe(hidden);
  });

  it('hides on YouTube only during full-screen video', () => {
    expect(shouldHidePill({ site: 'youtube', pathname: '/watch', isFullscreenVideo: true })).toBe(true);
    expect(shouldHidePill({ site: 'youtube', pathname: '/watch', isFullscreenVideo: false })).toBe(false);
    expect(shouldHidePill({ site: 'youtube', pathname: '/' })).toBe(false);
  });
});
