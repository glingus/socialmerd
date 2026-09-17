import { beforeEach, describe, expect, it, vi } from 'vitest';
import { hasSeenWelcome, markWelcomeSeen, showWelcome } from '../../src/core/ui/welcome';
import { getHost } from '../../src/core/ui/host';

describe('hasSeenWelcome / markWelcomeSeen', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('is false until marked seen', async () => {
    expect(await hasSeenWelcome()).toBe(false);
    await markWelcomeSeen();
    expect(await hasSeenWelcome()).toBe(true);
  });
});

describe('showWelcome', () => {
  beforeEach(() => {
    document.getElementById('smd-ui-host')?.remove();
    document.getElementById('smd-welcome-style')?.remove();
    localStorage.clear();
  });

  it('mounts the welcome sheet with the title in the requested language', () => {
    const host = getHost();
    showWelcome(host, 'it');
    expect(host.shadowRoot.querySelector('h2')?.textContent).toBe('Benvenuto su socialmerd');
  });

  it('marks welcome as seen and removes itself when closed', async () => {
    const onClose = vi.fn();
    const host = getHost();
    showWelcome(host, 'en', onClose);

    const closeButton = host.shadowRoot.querySelector('.smd-welcome-close') as HTMLButtonElement;
    closeButton.click();

    expect(onClose).toHaveBeenCalledOnce();
    expect(host.shadowRoot.querySelector('.smd-welcome-backdrop')).toBeNull();
    expect(await hasSeenWelcome()).toBe(true);
  });
});
