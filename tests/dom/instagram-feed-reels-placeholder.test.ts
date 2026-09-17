import { beforeEach, describe, expect, it } from 'vitest';
import { processFeedReelsPlaceholder } from '../../src/platforms/instagram/feed-reels-placeholder';
import type { InstagramRoute } from '../../src/platforms/instagram/routes';

const FEED: InstagramRoute = { kind: 'feed' };
const PROFILE: InstagramRoute = { kind: 'profile' };

function reelArticle(): string {
  return `
    <article>
      <header>
        <a href="/someaccount/"><img alt="Immagine del profilo di someaccount" src="avatar.jpg" /></a>
        <a href="/someaccount/reel/AbCdEf123/" role="link">
          <time datetime="2026-09-17T20:33:52.000Z" title="17 settembre 2026">3 minuti fa</time>
        </a>
      </header>
      <video poster="poster.jpg" autoplay muted></video>
      <span dir="auto">@someaccount</span>
      <span dir="auto">This is the caption text of the reel post, long enough to matter.</span>
    </article>
  `;
}

function plainArticle(): string {
  return `
    <article>
      <header><a href="/someaccount/"><img alt="Immagine del profilo di someaccount" src="avatar.jpg" /></a></header>
      <a href="/someaccount/p/AbCdEf123/"><time datetime="2026-09-17T20:33:52.000Z" title="17 settembre 2026">3 minuti fa</time></a>
      <img src="photo.jpg" />
    </article>
  `;
}

describe('processFeedReelsPlaceholder', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  it('hides the original article and inserts a placeholder card after it', () => {
    document.body.innerHTML = reelArticle();
    processFeedReelsPlaceholder(document.body, FEED);

    const article = document.querySelector('article') as HTMLElement;
    expect(article.style.display).toBe('none');

    const placeholder = document.querySelector('.smd-reel-placeholder');
    expect(placeholder).not.toBeNull();
    expect(placeholder?.nextElementSibling).toBeNull(); // placeholder is the article's next sibling, article was last
    expect(placeholder?.previousElementSibling).toBe(article);
  });

  it('pauses and mutes the video, and re-pauses if it starts playing again', () => {
    document.body.innerHTML = reelArticle();
    processFeedReelsPlaceholder(document.body, FEED);

    const video = document.querySelector('video') as HTMLVideoElement;
    expect(video.muted).toBe(true);

    const pauseSpy = vi_spy(video);
    video.dispatchEvent(new Event('play'));
    expect(pauseSpy.called).toBe(true);
  });

  it('fills in username, date, poster and a truncated caption', () => {
    document.body.innerHTML = reelArticle();
    processFeedReelsPlaceholder(document.body, FEED);

    const placeholder = document.querySelector('.smd-reel-placeholder') as HTMLElement;
    expect(placeholder.querySelector('.smd-reel-placeholder-username')?.textContent).toBe('@someaccount');
    expect(placeholder.querySelector('.smd-reel-placeholder-date')?.textContent).toBe('17 settembre 2026');
    expect(placeholder.querySelector('.smd-reel-placeholder-poster')?.getAttribute('src')).toBe('poster.jpg');
    expect(placeholder.querySelector('.smd-reel-placeholder-caption')?.textContent).toBe(
      'This is the caption text of the reel post, long enough to matter.',
    );
    expect(placeholder.querySelector('.smd-reel-placeholder-cta')?.getAttribute('href')).toBe('/reel/AbCdEf123/');
  });

  it('leaves a plain (non-reel) post untouched', () => {
    document.body.innerHTML = plainArticle();
    processFeedReelsPlaceholder(document.body, FEED);

    expect((document.querySelector('article') as HTMLElement).style.display).toBe('');
    expect(document.querySelector('.smd-reel-placeholder')).toBeNull();
  });

  it('does nothing outside the feed route', () => {
    document.body.innerHTML = reelArticle();
    processFeedReelsPlaceholder(document.body, PROFILE);

    expect((document.querySelector('article') as HTMLElement).style.display).toBe('');
    expect(document.querySelector('.smd-reel-placeholder')).toBeNull();
  });
});

// Minimal spy helper, avoids pulling vi.fn() into a `video.pause` override
// on jsdom/happy-dom's read-only-ish HTMLMediaElement prototype.
function vi_spy(video: HTMLVideoElement): { called: boolean } {
  const state = { called: false };
  const original = video.pause.bind(video);
  video.pause = () => {
    state.called = true;
    original();
  };
  return state;
}
