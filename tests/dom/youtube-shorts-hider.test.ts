import { beforeEach, describe, expect, it } from 'vitest';
import { processShortsHider } from '../../src/platforms/youtube/shorts-hider';

describe('processShortsHider', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  it('hides a rich-section shelf that contains a Shorts lockup', () => {
    document.body.innerHTML = `
      <ytm-rich-section-renderer>
        <grid-shelf-view-model>
          <ytm-shorts-lockup-view-model>
            <a href="/shorts/abc123">Short</a>
          </ytm-shorts-lockup-view-model>
        </grid-shelf-view-model>
      </ytm-rich-section-renderer>
    `;
    processShortsHider(document.body);
    expect((document.querySelector('ytm-rich-section-renderer') as HTMLElement).style.display).toBe('none');
  });

  it('leaves a rich-section shelf with no Shorts lockup untouched', () => {
    document.body.innerHTML = `
      <ytm-rich-section-renderer>
        <ytm-rich-shelf-renderer>
          <ytm-rich-item-renderer><a href="/watch?v=xyz">Video</a></ytm-rich-item-renderer>
        </ytm-rich-shelf-renderer>
      </ytm-rich-section-renderer>
    `;
    processShortsHider(document.body);
    expect((document.querySelector('ytm-rich-section-renderer') as HTMLElement).style.display).toBe('');
  });

  it('hides only the loose Shorts card inside a mixed shelf, not the whole shelf', () => {
    document.body.innerHTML = `
      <ytm-rich-section-renderer>
        <ytm-rich-shelf-renderer>
          <ytm-rich-item-renderer><a href="/watch?v=xyz">Video normale</a></ytm-rich-item-renderer>
          <ytm-video-with-context-renderer class="feed-item">
            <ytm-media-item class="big-shorts-singleton">
              <a href="/shorts/def456">Short misto</a>
            </ytm-media-item>
          </ytm-video-with-context-renderer>
        </ytm-rich-shelf-renderer>
      </ytm-rich-section-renderer>
    `;
    processShortsHider(document.body);
    expect((document.querySelector('ytm-rich-section-renderer') as HTMLElement).style.display).toBe('');
    expect((document.querySelector('ytm-rich-item-renderer') as HTMLElement).style.display).toBe('');
    expect((document.querySelector('ytm-video-with-context-renderer') as HTMLElement).style.display).toBe('none');
  });

  it('hides the bottom nav tab whose title carries the pivot-shorts class', () => {
    document.body.innerHTML = `
      <ytm-pivot-bar-item-renderer>
        <div class="pivot-bar-item-title pivot-shorts">Shorts</div>
      </ytm-pivot-bar-item-renderer>
      <ytm-pivot-bar-item-renderer>
        <div class="pivot-bar-item-title pivot-w2w">Home</div>
      </ytm-pivot-bar-item-renderer>
    `;
    processShortsHider(document.body);
    const items = document.querySelectorAll('ytm-pivot-bar-item-renderer');
    expect((items[0] as HTMLElement).style.display).toBe('none');
    expect((items[1] as HTMLElement).style.display).toBe('');
  });

  it('is idempotent across repeated runs', () => {
    document.body.innerHTML = `
      <ytm-rich-section-renderer>
        <ytm-shorts-lockup-view-model><a href="/shorts/abc123">Short</a></ytm-shorts-lockup-view-model>
      </ytm-rich-section-renderer>
    `;
    processShortsHider(document.body);
    processShortsHider(document.body);
    expect(document.querySelectorAll('ytm-rich-section-renderer')).toHaveLength(1);
  });
});
