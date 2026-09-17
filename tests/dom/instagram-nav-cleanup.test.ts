import { beforeEach, describe, expect, it } from 'vitest';
import { processNavCleanup } from '../../src/platforms/instagram/nav-cleanup';

describe('processNavCleanup', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  it('hides links to the global reels feed', () => {
    document.body.innerHTML = '<a href="/reels/">Reels</a>';
    processNavCleanup(document.body);
    expect((document.querySelector('a[href="/reels/"]') as HTMLElement).style.display).toBe('none');
  });

  it('leaves a profile reels tab link untouched', () => {
    document.body.innerHTML = '<a href="/someuser/reels/">Reels</a>';
    processNavCleanup(document.body);
    expect((document.querySelector('a') as HTMLElement).style.display).toBe('');
  });

  it('is idempotent across repeated runs', () => {
    document.body.innerHTML = '<a href="/reels/">Reels</a>';
    processNavCleanup(document.body);
    processNavCleanup(document.body);
    expect(document.querySelectorAll('a[href="/reels/"]')).toHaveLength(1);
  });
});
