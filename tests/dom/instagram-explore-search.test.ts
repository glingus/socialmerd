import { beforeEach, describe, expect, it } from 'vitest';
import { processExploreGrid, processExploreSearchResults } from '../../src/platforms/instagram/explore-search';
import type { InstagramRoute } from '../../src/platforms/instagram/routes';

const EXPLORE: InstagramRoute = { kind: 'explore' };
const EXPLORE_SEARCH: InstagramRoute = { kind: 'explore-search' };
const FEED: InstagramRoute = { kind: 'feed' };

describe('processExploreGrid', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <a href="/p/abc123/">post</a>
      <a href="/reel/xyz789/">reel</a>
      <a href="/juventus/p/abc123/">prefixed, should stay (feed shape)</a>
    `;
  });

  it('hides bare post/reel permalinks only on the explore route', () => {
    processExploreGrid(document.body, EXPLORE);
    expect((document.querySelector('a[href="/p/abc123/"]') as HTMLElement).style.display).toBe('none');
    expect((document.querySelector('a[href="/reel/xyz789/"]') as HTMLElement).style.display).toBe('none');
  });

  it('leaves the author-prefixed shape untouched', () => {
    processExploreGrid(document.body, EXPLORE);
    expect((document.querySelector('a[href="/juventus/p/abc123/"]') as HTMLElement).style.display).toBe('');
  });

  it('does nothing outside the explore route', () => {
    processExploreGrid(document.body, FEED);
    expect((document.querySelector('a[href="/p/abc123/"]') as HTMLElement).style.display).toBe('');
  });
});

describe('processExploreSearchResults', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <a href="/explore/tags/calcio/">#calcio</a>
      <a href="/explore/locations/123/">Milano</a>
      <a href="/reels/audio/456/">audio</a>
      <a href="/someaccount/">account result, should stay</a>
    `;
  });

  it('hides hashtag/location/audio results only on explore-search', () => {
    processExploreSearchResults(document.body, EXPLORE_SEARCH);
    expect((document.querySelector('a[href^="/explore/tags/"]') as HTMLElement).style.display).toBe('none');
    expect((document.querySelector('a[href^="/explore/locations/"]') as HTMLElement).style.display).toBe('none');
    expect((document.querySelector('a[href^="/reels/audio/"]') as HTMLElement).style.display).toBe('none');
  });

  it('leaves account results untouched', () => {
    processExploreSearchResults(document.body, EXPLORE_SEARCH);
    expect((document.querySelector('a[href="/someaccount/"]') as HTMLElement).style.display).toBe('');
  });

  it('does nothing outside explore-search', () => {
    processExploreSearchResults(document.body, EXPLORE);
    expect((document.querySelector('a[href^="/explore/tags/"]') as HTMLElement).style.display).toBe('');
  });
});
