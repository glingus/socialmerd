import { beforeEach, describe, expect, it } from 'vitest';
import { createDebugOverlay, probeFeatures } from '../../src/core/ui/debug-overlay';
import { getHost } from '../../src/core/ui/host';
import { _resetForTests, markProcessed } from '../../src/core/dom-scheduler';
import { clearLog, log } from '../../src/core/log';

describe('probeFeatures', () => {
  it('reports GM as unavailable outside the userscript host', () => {
    expect(probeFeatures().hasGM).toBe(false);
  });

  it('reports typeof unsafeWindow as undefined by default', () => {
    expect(probeFeatures().unsafeWindowType).toBe('undefined');
  });
});

describe('createDebugOverlay', () => {
  beforeEach(() => {
    document.getElementById('smd-ui-host')?.remove();
    document.getElementById('smd-debug-style')?.remove();
    _resetForTests();
    clearLog();
  });

  it('starts closed and open()/close() toggle visibility', () => {
    const host = getHost();
    const overlay = createDebugOverlay(host, 'it');
    expect(overlay.isOpen()).toBe(false);
    overlay.open();
    expect(overlay.isOpen()).toBe(true);
    overlay.close();
    expect(overlay.isOpen()).toBe(false);
  });

  it('shows marker counts from the dom-scheduler', () => {
    markProcessed(document.createElement('div'), 'feed-item');
    markProcessed(document.createElement('div'), 'feed-item');

    const host = getHost();
    const overlay = createDebugOverlay(host, 'en');
    overlay.open();

    expect(host.shadowRoot.textContent).toContain('feed-item: 2');
  });

  it('shows recent log lines, most recent first', () => {
    log.info('first');
    log.error('second');

    const host = getHost();
    const overlay = createDebugOverlay(host, 'en');
    overlay.open();

    const text = host.shadowRoot.textContent ?? '';
    expect(text).toContain('first');
    expect(text).toContain('second');
    expect(text.indexOf('second')).toBeLessThan(text.indexOf('first'));
  });
});
