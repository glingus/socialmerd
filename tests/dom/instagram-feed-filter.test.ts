import { beforeEach, describe, expect, it } from 'vitest';
import { processFeedFilter } from '../../src/platforms/instagram/feed-filter';
import type { InstagramRoute } from '../../src/platforms/instagram/routes';

const FEED: InstagramRoute = { kind: 'feed' };
const PROFILE: InstagramRoute = { kind: 'profile' };

function article(innerHTML: string): string {
  return `<article>${innerHTML}</article>`;
}

describe('processFeedFilter', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  it('hides a post labeled "Sponsorizzato"', () => {
    document.body.innerHTML = article('<header>juventus · Sponsorizzato</header><p>caption</p>');
    processFeedFilter(document.body, FEED);
    expect((document.querySelector('article') as HTMLElement).style.display).toBe('none');
  });

  it('hides a post with a "Segui" button in the header (not-followed account)', () => {
    document.body.innerHTML = article('<header>someone <button>Segui</button></header>');
    processFeedFilter(document.body, FEED);
    expect((document.querySelector('article') as HTMLElement).style.display).toBe('none');
  });

  it('hides a post with a div[role="button"] Follow control, not just a real <button>', () => {
    document.body.innerHTML = article('<header>someone <div role="button">Follow</div></header>');
    processFeedFilter(document.body, FEED);
    expect((document.querySelector('article') as HTMLElement).style.display).toBe('none');
  });

  it('hides a post labeled "Suggeriti per te"', () => {
    document.body.innerHTML = article('<header>someone · Suggeriti per te</header>');
    processFeedFilter(document.body, FEED);
    expect((document.querySelector('article') as HTMLElement).style.display).toBe('none');
  });

  it('does not hide a plain followed-account post', () => {
    document.body.innerHTML = article('<header>juventus</header><p>ZEKIIIIII, 4-0!</p>');
    processFeedFilter(document.body, FEED);
    expect((document.querySelector('article') as HTMLElement).style.display).toBe('');
  });

  it('does not hide a followed-account post whose caption merely contains the word "Segui"/"Follow"', () => {
    document.body.innerHTML = article('<header>juventus</header><p>Segui il link in bio per il video completo</p>');
    processFeedFilter(document.body, FEED);
    expect((document.querySelector('article') as HTMLElement).style.display).toBe('');
  });

  it('does not hide a followed-account post captioned "Follow your dreams"', () => {
    document.body.innerHTML = article('<header>juventus</header><p>Follow your dreams, not the crowd</p>');
    processFeedFilter(document.body, FEED);
    expect((document.querySelector('article') as HTMLElement).style.display).toBe('');
  });

  it('does not hide a paid-partnership post (different wording than "Sponsorizzato")', () => {
    document.body.innerHTML = article('<header>juventus · Partnership retribuita con Adidas</header>');
    processFeedFilter(document.body, FEED);
    expect((document.querySelector('article') as HTMLElement).style.display).toBe('');
  });

  it('does nothing outside the feed route', () => {
    document.body.innerHTML = article('<header>Sponsorizzato</header>');
    processFeedFilter(document.body, PROFILE);
    expect((document.querySelector('article') as HTMLElement).style.display).toBe('');
  });
});
