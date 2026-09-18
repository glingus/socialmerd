import { beforeEach, describe, expect, it, vi } from 'vitest';
import { handleRoute } from '../../src/platforms/instagram/route-guard';
import { getStack, pushAllowed, resetStack } from '../../src/core/silent-nav';
import { getBlockCounts } from '../../src/core/blocks';

describe('handleRoute', () => {
  beforeEach(() => {
    resetStack();
    localStorage.clear();
  });

  it('redirects "/" without a variant to the following feed', () => {
    const navigate = { back: vi.fn(), replace: vi.fn() };
    const route = handleRoute('https://www.instagram.com/', navigate);
    expect(route.kind).toBe('redirect-to-following');
    expect(navigate.replace).toHaveBeenCalledWith('/?variant=following');
    expect(getStack()).toEqual([]);
  });

  it('pushes allowed routes onto the silent-nav stack', () => {
    const navigate = { back: vi.fn(), replace: vi.fn() };
    const route = handleRoute('https://www.instagram.com/?variant=following', navigate);
    expect(route.kind).toBe('feed');
    expect(navigate.replace).not.toHaveBeenCalled();
    expect(getStack()).toEqual(['https://www.instagram.com/?variant=following']);
  });

  it('bounces a blocked route back to the last allowed one and counts it', async () => {
    pushAllowed('https://www.instagram.com/?variant=following');
    const navigate = { back: vi.fn(), replace: vi.fn() };

    const route = handleRoute('https://www.instagram.com/reels/', navigate);

    expect(route.kind).toBe('blocked');
    expect(navigate.back).toHaveBeenCalledOnce();
    expect(navigate.replace).not.toHaveBeenCalled();
    await vi.waitFor(async () => {
      expect((await getBlockCounts()).blocked_route).toBe(1);
    });
  });

  it('bounces a blocked route to the fallback when nothing was allowed yet', () => {
    const navigate = { back: vi.fn(), replace: vi.fn() };
    handleRoute('https://www.instagram.com/explore/tags/calcio/', navigate);
    expect(navigate.replace).toHaveBeenCalledWith('/?variant=following');
  });

  it('allows a reel-lock route through (reel-lock.ts engages separately)', () => {
    const navigate = { back: vi.fn(), replace: vi.fn() };
    const route = handleRoute('https://www.instagram.com/reel/DdZt_PXSJpg/', navigate);
    expect(route).toEqual({ kind: 'reel-lock', code: 'DdZt_PXSJpg' });
    expect(navigate.back).not.toHaveBeenCalled();
    expect(navigate.replace).not.toHaveBeenCalled();
  });

  it('sets a data-smd-ig-route attribute synchronously for every classification, for CSS-based flash prevention', () => {
    handleRoute('https://www.instagram.com/explore/', { back: vi.fn(), replace: vi.fn() });
    expect(document.documentElement.getAttribute('data-smd-ig-route')).toBe('explore');

    pushAllowed('https://www.instagram.com/?variant=following');
    handleRoute('https://www.instagram.com/reels/', { back: vi.fn(), replace: vi.fn() });
    expect(document.documentElement.getAttribute('data-smd-ig-route')).toBe('blocked');
  });
});
