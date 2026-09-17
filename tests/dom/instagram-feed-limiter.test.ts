import { beforeEach, describe, expect, it } from 'vitest';
import { registerFeedLimiterProcessor } from '../../src/platforms/instagram/feed-limiter';
import type { InstagramRoute } from '../../src/platforms/instagram/routes';
import { getBlockCounts } from '../../src/core/blocks';

const FEED: InstagramRoute = { kind: 'feed' };

class FakeIntersectionObserver {
  static instances: FakeIntersectionObserver[] = [];
  callback: IntersectionObserverCallback;
  observed: Element[] = [];

  constructor(callback: IntersectionObserverCallback) {
    this.callback = callback;
    FakeIntersectionObserver.instances.push(this);
  }

  observe(el: Element): void {
    this.observed.push(el);
  }

  disconnect(): void {
    // no-op for the fake
  }

  fireVisible(el: Element): void {
    this.callback(
      [{ isIntersecting: true, intersectionRatio: 1, target: el } as IntersectionObserverEntry],
      this as unknown as IntersectionObserver,
    );
  }
}

function article(datetime: string): string {
  return `<article><time datetime="${datetime}"></time></article>`;
}

async function flushMicrotasks(): Promise<void> {
  await Promise.resolve();
  await Promise.resolve();
}

describe('registerFeedLimiterProcessor', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
    localStorage.clear();
    FakeIntersectionObserver.instances = [];
  });

  it('hides posts at/after the boundary and inserts the caught-up card once state loads', async () => {
    const now = new Date('2026-09-17T20:00:00.000Z').getTime();
    const oldIso = new Date(now - 25 * 60 * 60 * 1000).toISOString(); // >24h old
    document.body.innerHTML = [article(new Date(now).toISOString()), article(oldIso), article(oldIso)].join('');

    const processor = registerFeedLimiterProcessor(() => FEED, {
      getAccount: () => 'someaccount',
      now: () => now,
      IntersectionObserverImpl: FakeIntersectionObserver as unknown as typeof IntersectionObserver,
    });

    processor(document.body); // first call: state not loaded yet, no-op
    await flushMicrotasks();
    processor(document.body); // second call: state is ready now

    const articles = document.querySelectorAll('article');
    expect((articles[0] as HTMLElement).style.display).toBe('');
    expect((articles[1] as HTMLElement).style.display).toBe('none');
    expect((articles[2] as HTMLElement).style.display).toBe('none');
    expect(document.querySelector('.smd-feed-caught-up')).not.toBeNull();
  });

  it('only advances the watermark and counts a block once the card is actually >=50% visible', async () => {
    const now = new Date('2026-09-17T20:00:00.000Z').getTime();
    const oldIso = new Date(now - 25 * 60 * 60 * 1000).toISOString();
    document.body.innerHTML = [article(new Date(now).toISOString()), article(oldIso)].join('');

    const processor = registerFeedLimiterProcessor(() => FEED, {
      getAccount: () => 'someaccount2',
      now: () => now,
      IntersectionObserverImpl: FakeIntersectionObserver as unknown as typeof IntersectionObserver,
    });

    processor(document.body);
    await flushMicrotasks();
    processor(document.body);

    expect((await getBlockCounts()).feed_end).toBe(0);

    const card = document.querySelector('.smd-feed-caught-up') as HTMLElement;
    const observerInstance = FakeIntersectionObserver.instances.at(-1)!;
    observerInstance.fireVisible(card);
    await flushMicrotasks();

    expect((await getBlockCounts()).feed_end).toBe(1);
  });

  it('does nothing outside the feed route', () => {
    document.body.innerHTML = article(new Date().toISOString());
    const processor = registerFeedLimiterProcessor(() => ({ kind: 'profile' }), {
      getAccount: () => 'someaccount3',
      IntersectionObserverImpl: FakeIntersectionObserver as unknown as typeof IntersectionObserver,
    });
    processor(document.body);
    expect((document.querySelector('article') as HTMLElement).style.display).toBe('');
  });
});
