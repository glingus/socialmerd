import { beforeEach, describe, expect, it, vi } from 'vitest';
import { _resetStoriesAdsForTests, processStoriesAds } from '../../src/platforms/instagram/stories-ads';
import type { InstagramRoute } from '../../src/platforms/instagram/routes';

const STORIES: InstagramRoute = { kind: 'stories' };
const FEED: InstagramRoute = { kind: 'feed' };

describe('processStoriesAds', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
    _resetStoriesAdsForTests();
  });

  it('clicks the "Avanti" button when a sponsored story is visible', () => {
    document.body.innerHTML = '<div>Sponsorizzato<button aria-label="Avanti">next</button></div>';
    const button = document.querySelector('button') as HTMLButtonElement;
    const clickSpy = vi.fn();
    button.addEventListener('click', clickSpy);

    processStoriesAds(document.body, STORIES, () => 'story-1');

    expect(clickSpy).toHaveBeenCalledOnce();
  });

  it('falls back to tapping the right third when there is no Avanti button', () => {
    document.body.innerHTML = '<div>Sponsorizzato</div>';
    const target = document.querySelector('div') as HTMLElement;
    vi.spyOn(document, 'elementFromPoint').mockReturnValue(target);
    const clickSpy = vi.fn();
    target.addEventListener('click', clickSpy);

    processStoriesAds(document.body, STORIES, () => 'story-2');

    expect(clickSpy).toHaveBeenCalledOnce();
  });

  it('does nothing when the story is not sponsored', () => {
    document.body.innerHTML = '<div><button aria-label="Avanti">next</button></div>';
    const button = document.querySelector('button') as HTMLButtonElement;
    const clickSpy = vi.fn();
    button.addEventListener('click', clickSpy);

    processStoriesAds(document.body, STORIES, () => 'story-3');

    expect(clickSpy).not.toHaveBeenCalled();
  });

  it('gives up after 3 attempts on the same story (no infinite loop)', () => {
    document.body.innerHTML = '<div>Sponsorizzato<button aria-label="Avanti">next</button></div>';
    const button = document.querySelector('button') as HTMLButtonElement;
    const clickSpy = vi.fn();
    button.addEventListener('click', clickSpy);

    for (let i = 0; i < 5; i += 1) {
      processStoriesAds(document.body, STORIES, () => 'story-4');
    }

    expect(clickSpy).toHaveBeenCalledTimes(3);
  });

  it('resets the attempt count once the story is no longer sponsored', () => {
    document.body.innerHTML = '<div>Sponsorizzato<button aria-label="Avanti">next</button></div>';
    for (let i = 0; i < 3; i += 1) {
      processStoriesAds(document.body, STORIES, () => 'story-5');
    }
    document.body.innerHTML = '<div>not sponsored anymore</div>';
    processStoriesAds(document.body, STORIES, () => 'story-5');

    document.body.innerHTML = '<div>Sponsorizzato<button aria-label="Avanti">next</button></div>';
    const button = document.querySelector('button') as HTMLButtonElement;
    const clickSpy = vi.fn();
    button.addEventListener('click', clickSpy);
    processStoriesAds(document.body, STORIES, () => 'story-5');

    expect(clickSpy).toHaveBeenCalledOnce();
  });

  it('does nothing outside the stories route', () => {
    document.body.innerHTML = '<div>Sponsorizzato<button aria-label="Avanti">next</button></div>';
    const button = document.querySelector('button') as HTMLButtonElement;
    const clickSpy = vi.fn();
    button.addEventListener('click', clickSpy);

    processStoriesAds(document.body, FEED, () => 'story-6');

    expect(clickSpy).not.toHaveBeenCalled();
  });
});
