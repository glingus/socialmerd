import { beforeEach, describe, expect, it, vi } from 'vitest';
import { blockAdjacentReelGestures, createReelLockController } from '../../src/platforms/instagram/reel-lock';
import { getBlockCounts } from '../../src/core/blocks';
import { pushAllowed, resetStack } from '../../src/core/silent-nav';

describe('blockAdjacentReelGestures', () => {
  beforeEach(() => {
    document.body.innerHTML = '<div id="scroller"></div><textarea id="comment-box"></textarea>';
  });

  it('prevents default on touchmove/wheel/arrow keys outside exempt targets', () => {
    const handle = blockAdjacentReelGestures(document);
    const scroller = document.getElementById('scroller')!;

    const touchmove = new Event('touchmove', { cancelable: true, bubbles: true });
    scroller.dispatchEvent(touchmove);
    expect(touchmove.defaultPrevented).toBe(true);

    const wheel = new Event('wheel', { cancelable: true, bubbles: true });
    scroller.dispatchEvent(wheel);
    expect(wheel.defaultPrevented).toBe(true);

    const key = new KeyboardEvent('keydown', { key: 'ArrowDown', cancelable: true, bubbles: true });
    scroller.dispatchEvent(key);
    expect(key.defaultPrevented).toBe(true);

    handle.release();
  });

  it('lets gestures through inside exempt targets like a textarea', () => {
    const handle = blockAdjacentReelGestures(document);
    const textarea = document.getElementById('comment-box')!;

    const key = new KeyboardEvent('keydown', { key: ' ', cancelable: true, bubbles: true });
    textarea.dispatchEvent(key);
    expect(key.defaultPrevented).toBe(false);

    handle.release();
  });

  it('stops blocking once released', () => {
    const handle = blockAdjacentReelGestures(document);
    handle.release();
    const scroller = document.getElementById('scroller')!;

    const wheel = new Event('wheel', { cancelable: true, bubbles: true });
    scroller.dispatchEvent(wheel);
    expect(wheel.defaultPrevented).toBe(false);
  });
});

describe('createReelLockController', () => {
  beforeEach(() => {
    resetStack();
    localStorage.clear();
  });

  it('engages on the first reel route and is locked', () => {
    pushAllowed('/?variant=following');
    pushAllowed('/reel/abc/');
    const controller = createReelLockController();

    controller.handleRoute({ kind: 'reel-lock', code: 'abc' });

    expect(controller.isLocked()).toBe(true);
  });

  it('replaces with the original origin (not one step back) when swiped to another reel', async () => {
    pushAllowed('/?variant=following');
    pushAllowed('/reel/abc/');
    const controller = createReelLockController();
    controller.handleRoute({ kind: 'reel-lock', code: 'abc' });

    // route-guard.ts would have pushed the leaked reel onto the stack too
    // (it isn't a 'blocked' route), so the stack top is now the leak
    // itself -- a plain history.back() here would land on '/reel/abc/',
    // not on the true origin. The controller must bypass that and replace
    // with the saved origin directly.
    pushAllowed('/reel/xyz/');
    const navigate = { back: vi.fn(), replace: vi.fn() };
    controller.handleRoute({ kind: 'reel-lock', code: 'xyz' }, navigate);

    expect(controller.isLocked()).toBe(false);
    expect(navigate.replace).toHaveBeenCalledWith('/?variant=following');
    expect(navigate.back).not.toHaveBeenCalled();
    await vi.waitFor(async () => {
      expect((await getBlockCounts()).reel_next).toBe(1);
    });
  });

  it('releases the lock on a normal exit (e.g. back to the feed)', () => {
    pushAllowed('/?variant=following');
    pushAllowed('/reel/abc/');
    const controller = createReelLockController();
    controller.handleRoute({ kind: 'reel-lock', code: 'abc' });

    controller.handleRoute({ kind: 'feed' });

    expect(controller.isLocked()).toBe(false);
  });
});
