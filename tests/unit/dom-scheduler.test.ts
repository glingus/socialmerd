import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { _resetForTests, markProcessed, registerProcessor } from '../../src/core/dom-scheduler';

// Force the setTimeout(100ms) fallback path so batching is deterministic
// under fake timers, instead of depending on a real animation frame.
beforeEach(() => {
  _resetForTests();
  vi.stubGlobal('requestAnimationFrame', undefined);
  vi.useFakeTimers();
  document.body.innerHTML = '';
});

afterEach(() => {
  _resetForTests();
  vi.unstubAllGlobals();
  vi.useRealTimers();
});

/** Lets any pending MutationObserver microtask run before advancing fake
 * timers (its callback is queued as a microtask by the DOM mutation, not
 * synchronously). */
async function flushMicrotasks(): Promise<void> {
  await Promise.resolve();
  await Promise.resolve();
}

describe('registerProcessor', () => {
  it('runs the processor once immediately after registering', () => {
    const processor = vi.fn();
    registerProcessor(processor);
    vi.advanceTimersByTime(100);
    expect(processor).toHaveBeenCalledTimes(1);
    expect(processor).toHaveBeenCalledWith(document.documentElement);
  });

  it('batches several mutations into a single pass', async () => {
    const processor = vi.fn();
    registerProcessor(processor);
    vi.advanceTimersByTime(100); // consume the initial run

    document.body.appendChild(document.createElement('div'));
    document.body.appendChild(document.createElement('span'));
    await flushMicrotasks();
    vi.advanceTimersByTime(100);

    expect(processor).toHaveBeenCalledTimes(2); // initial + one batched pass
  });

  it('stops running the processor after unsubscribe', async () => {
    const processor = vi.fn();
    const unsubscribe = registerProcessor(processor);
    vi.advanceTimersByTime(100);
    processor.mockClear();

    unsubscribe();
    document.body.appendChild(document.createElement('div'));
    await flushMicrotasks();
    vi.advanceTimersByTime(100);

    expect(processor).not.toHaveBeenCalled();
  });

  it('isolates a processor error from the others', () => {
    const failing = vi.fn(() => {
      throw new Error('boom');
    });
    const ok = vi.fn();
    registerProcessor(failing);
    registerProcessor(ok);
    vi.advanceTimersByTime(100);

    expect(ok).toHaveBeenCalled();
  });
});

describe('markProcessed', () => {
  it('marks an element once and reports subsequent calls as already-marked', () => {
    const el = document.createElement('div');
    expect(markProcessed(el, 'feed-item')).toBe(true);
    expect(el.getAttribute('data-smd-feed-item')).toBe('');
    expect(markProcessed(el, 'feed-item')).toBe(false);
  });

  it('tracks independent markers separately', () => {
    const el = document.createElement('div');
    expect(markProcessed(el, 'a')).toBe(true);
    expect(markProcessed(el, 'b')).toBe(true);
  });
});
