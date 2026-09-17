import { beforeEach, describe, expect, it } from 'vitest';
import { getHost } from '../../src/core/ui/host';

describe('getHost', () => {
  beforeEach(() => {
    document.getElementById('smd-ui-host')?.remove();
  });

  it('creates a single host element attached to the body', () => {
    getHost();
    const hosts = document.querySelectorAll('#smd-ui-host');
    expect(hosts).toHaveLength(1);
    expect(hosts[0]?.parentElement).toBe(document.body);
  });

  it('returns the same shadow root on repeated calls', () => {
    const first = getHost();
    const second = getHost();
    expect(second.shadowRoot).toBe(first.shadowRoot);
    expect(document.querySelectorAll('#smd-ui-host')).toHaveLength(1);
  });

  it('mounts elements into the shadow root, isolated from the page', () => {
    const host = getHost();
    const el = document.createElement('div');
    el.className = 'smd-pill';
    host.mount(el);
    expect(host.shadowRoot.querySelector('.smd-pill')).toBe(el);
    expect(document.querySelector('.smd-pill')).toBeNull();
  });
});
