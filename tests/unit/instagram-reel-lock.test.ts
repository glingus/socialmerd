import { describe, expect, it } from 'vitest';
import { decideReelLockAction } from '../../src/platforms/instagram/reel-lock';
import type { InstagramRoute } from '../../src/platforms/instagram/routes';

describe('decideReelLockAction', () => {
  it('engages the lock the first time a reel route is seen, using the previous url as origin', () => {
    const route: InstagramRoute = { kind: 'reel-lock', code: 'abc' };
    const action = decideReelLockAction(null, route, '/?variant=following');
    expect(action).toEqual({ type: 'engage', code: 'abc', origin: '/?variant=following' });
  });

  it('falls back to the following feed as origin when there is no previous url', () => {
    const route: InstagramRoute = { kind: 'reel-lock', code: 'abc' };
    const action = decideReelLockAction(null, route, null);
    expect(action).toEqual({ type: 'engage', code: 'abc', origin: '/?variant=following' });
  });

  it('does nothing while the same reel stays open', () => {
    const current = { code: 'abc', origin: '/?variant=following' };
    const route: InstagramRoute = { kind: 'reel-lock', code: 'abc' };
    expect(decideReelLockAction(current, route, '/reel/abc/')).toEqual({ type: 'noop' });
  });

  it('detects a swipe/autoplay to a different reel code and returns to the original origin', () => {
    const current = { code: 'abc', origin: '/?variant=following' };
    const route: InstagramRoute = { kind: 'reel-lock', code: 'xyz' };
    expect(decideReelLockAction(current, route, '/reel/abc/')).toEqual({
      type: 'swiped-next',
      origin: '/?variant=following',
    });
  });

  it('releases the lock on a normal exit to a non-reel route', () => {
    const current = { code: 'abc', origin: '/?variant=following' };
    expect(decideReelLockAction(current, { kind: 'feed' }, '/reel/abc/')).toEqual({ type: 'release' });
  });

  it('is a noop when there is no lock and no reel route', () => {
    expect(decideReelLockAction(null, { kind: 'feed' }, '/')).toEqual({ type: 'noop' });
  });
});
