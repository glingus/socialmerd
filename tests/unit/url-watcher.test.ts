import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { watchUrl } from '../../src/core/url-watcher';

describe('watchUrl', () => {
  beforeEach(() => {
    history.replaceState({}, '', '/start');
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('reports a change detected by polling', () => {
    vi.useFakeTimers();
    const onChange = vi.fn();
    const unsubscribe = watchUrl(onChange, { intervalMs: 250 });

    history.pushState({}, '', '/next');
    vi.advanceTimersByTime(250);

    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange.mock.calls[0]?.[0]).toContain('/next');
    unsubscribe();
  });

  it('does not fire when the url has not changed', () => {
    vi.useFakeTimers();
    const onChange = vi.fn();
    const unsubscribe = watchUrl(onChange, { intervalMs: 250 });
    vi.advanceTimersByTime(1000);
    expect(onChange).not.toHaveBeenCalled();
    unsubscribe();
  });

  it('reports a change on popstate', () => {
    const onChange = vi.fn();
    const unsubscribe = watchUrl(onChange, { intervalMs: 1_000_000 });
    history.pushState({}, '', '/via-popstate');
    window.dispatchEvent(new PopStateEvent('popstate'));
    expect(onChange).toHaveBeenCalledTimes(1);
    unsubscribe();
  });

  it('stops reporting after unsubscribe', () => {
    vi.useFakeTimers();
    const onChange = vi.fn();
    const unsubscribe = watchUrl(onChange, { intervalMs: 250 });
    unsubscribe();
    history.pushState({}, '', '/after-unsub');
    vi.advanceTimersByTime(1000);
    expect(onChange).not.toHaveBeenCalled();
  });
});
