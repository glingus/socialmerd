import { beforeEach, describe, expect, it, vi } from 'vitest';
import { processAppBanners } from '../../src/platforms/instagram/app-banners';

describe('processAppBanners', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  it('clicks the close icon next to the "Usa l\'app" CTA, never the CTA itself', () => {
    document.body.innerHTML = `
      <div class="banner">
        <svg aria-label="Chiudi"></svg>
        <button type="button">Usa l'app</button>
      </div>
    `;
    const closeIcon = document.querySelector('svg') as SVGElement;
    const ctaButton = document.querySelector('button') as HTMLButtonElement;
    const closeClick = vi.fn();
    const ctaClick = vi.fn();
    closeIcon.addEventListener('click', closeClick);
    ctaButton.addEventListener('click', ctaClick);

    processAppBanners(document.body);

    expect(closeClick).toHaveBeenCalledOnce();
    expect(ctaClick).not.toHaveBeenCalled();
  });

  it('does not touch unrelated close icons elsewhere on the page (e.g. a story viewer)', () => {
    document.body.innerHTML = `
      <div class="story-viewer"><svg aria-label="Chiudi"></svg></div>
      <div class="feed"><article>some post</article></div>
    `;
    const storyClose = document.querySelector('svg') as SVGElement;
    const clickSpy = vi.fn();
    storyClose.addEventListener('click', clickSpy);

    processAppBanners(document.body);

    expect(clickSpy).not.toHaveBeenCalled();
  });

  it('is idempotent: only clicks once even if run again on the same DOM', () => {
    document.body.innerHTML = `
      <div class="banner">
        <svg aria-label="Chiudi"></svg>
        <button type="button">Usa l'app</button>
      </div>
    `;
    const closeIcon = document.querySelector('svg') as SVGElement;
    const closeClick = vi.fn();
    closeIcon.addEventListener('click', closeClick);

    processAppBanners(document.body);
    processAppBanners(document.body);

    expect(closeClick).toHaveBeenCalledOnce();
  });
});
