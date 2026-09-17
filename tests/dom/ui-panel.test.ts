import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createPanel } from '../../src/core/ui/panel';
import { getHost } from '../../src/core/ui/host';
import { emptyDayStats, setDayStats } from '../../src/core/storage';
import { defaultSettings, getSettings, setSettings } from '../../src/core/settings';

describe('createPanel', () => {
  beforeEach(() => {
    document.getElementById('smd-ui-host')?.remove();
    document.getElementById('smd-panel-style')?.remove();
    localStorage.clear();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('starts closed and toggle() opens it', async () => {
    const host = getHost();
    const panel = createPanel(host, { getLang: () => 'it', version: '0.1.0', channel: 'dev' });
    expect(panel.isOpen()).toBe(false);
    await panel.toggle();
    expect(panel.isOpen()).toBe(true);
    await panel.toggle();
    expect(panel.isOpen()).toBe(false);
  });

  it("renders today's Instagram minutes from real storage", async () => {
    const stats = emptyDayStats();
    stats.ig.feed = 600; // 10 min
    await setDayStats(stats, new Date());

    const host = getHost();
    const panel = createPanel(host, { getLang: () => 'it', version: '0.1.0', channel: 'dev' });
    await panel.open();

    expect(host.shadowRoot.querySelector('.smd-panel')?.textContent).toContain('10 min');
  });

  it('persists a settings toggle and reports it via onSettingsChanged', async () => {
    await setSettings(defaultSettings());
    const onSettingsChanged = vi.fn();
    const host = getHost();
    const panel = createPanel(host, { getLang: () => 'en', version: '0.1.0', channel: 'dev', onSettingsChanged });
    await panel.open();

    const checkboxes = host.shadowRoot.querySelectorAll('input[type="checkbox"]');
    const pillCheckbox = checkboxes[0] as HTMLInputElement;
    pillCheckbox.checked = false;
    pillCheckbox.dispatchEvent(new Event('change'));

    await vi.waitFor(() => {
      expect(onSettingsChanged).toHaveBeenCalledWith(expect.objectContaining({ pillEnabled: false }));
    });
    expect((await getSettings()).pillEnabled).toBe(false);
  });

  it('triggers onDebugTap after 5 taps on the version line', async () => {
    const onDebugTap = vi.fn();
    const host = getHost();
    const panel = createPanel(host, { getLang: () => 'en', version: '0.1.0', channel: 'dev', onDebugTap });
    await panel.open();

    const versionLine = [...host.shadowRoot.querySelectorAll('p')].find((p) => p.textContent?.includes('socialmerd'));
    expect(versionLine).toBeDefined();
    for (let i = 0; i < 5; i += 1) versionLine?.dispatchEvent(new MouseEvent('click'));

    expect(onDebugTap).toHaveBeenCalledOnce();
  });

  it('resets stats after the user confirms', async () => {
    const stats = emptyDayStats();
    stats.ig.feed = 120;
    await setDayStats(stats, new Date());
    vi.stubGlobal('confirm', () => true);

    const host = getHost();
    const panel = createPanel(host, { getLang: () => 'it', version: '0.1.0', channel: 'dev' });
    await panel.open();

    const resetButton = [...host.shadowRoot.querySelectorAll('button')].find((b) =>
      b.textContent?.includes('Azzera'),
    );
    resetButton?.click();

    const { getDayStats } = await import('../../src/core/storage');
    await vi.waitFor(async () => {
      expect(await getDayStats(new Date())).toEqual(emptyDayStats());
    });
  });

  it('does not reset stats when the user cancels the confirmation', async () => {
    const stats = emptyDayStats();
    stats.ig.feed = 120;
    await setDayStats(stats, new Date());
    vi.stubGlobal('confirm', () => false);

    const host = getHost();
    const panel = createPanel(host, { getLang: () => 'it', version: '0.1.0', channel: 'dev' });
    await panel.open();

    const resetButton = [...host.shadowRoot.querySelectorAll('button')].find((b) =>
      b.textContent?.includes('Azzera'),
    );
    resetButton?.click();

    const { getDayStats } = await import('../../src/core/storage');
    expect((await getDayStats(new Date())).ig.feed).toBe(120);
  });
});
