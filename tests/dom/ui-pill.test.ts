import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createPill } from '../../src/core/ui/pill';
import { getHost } from '../../src/core/ui/host';

describe('createPill', () => {
  beforeEach(() => {
    document.getElementById('smd-ui-host')?.remove();
    document.getElementById('smd-pill-style')?.remove();
  });

  it('renders the minutes text and calls onActivate when clicked', () => {
    const onActivate = vi.fn();
    const host = getHost();
    const pill = createPill(host, 'it', onActivate);
    pill.update(5, false, false);

    const button = host.shadowRoot.querySelector('.smd-pill') as HTMLButtonElement;
    expect(button.hidden).toBe(false);
    expect(button.textContent).toContain('5 min oggi');

    button.click();
    expect(onActivate).toHaveBeenCalledOnce();
  });

  it('shows the update dot only when hasUpdate is true', () => {
    const host = getHost();
    const pill = createPill(host, 'en', vi.fn());
    const dot = host.shadowRoot.querySelector('.smd-pill-dot') as HTMLElement;

    pill.update(1, false, false);
    expect(dot.hidden).toBe(true);

    pill.update(1, true, false);
    expect(dot.hidden).toBe(false);
  });

  it('hides the pill element when told to', () => {
    const host = getHost();
    const pill = createPill(host, 'en', vi.fn());
    pill.update(1, false, true);
    expect((host.shadowRoot.querySelector('.smd-pill') as HTMLElement).hidden).toBe(true);
  });

  it('destroy removes the element from the shadow root', () => {
    const host = getHost();
    const pill = createPill(host, 'en', vi.fn());
    pill.destroy();
    expect(host.shadowRoot.querySelector('.smd-pill')).toBeNull();
  });
});
