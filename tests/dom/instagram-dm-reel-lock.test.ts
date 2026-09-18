import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { createDmReelLock } from '../../src/platforms/instagram/dm-reel-lock';
import type { InstagramRoute } from '../../src/platforms/instagram/routes';

const DIRECT: InstagramRoute = { kind: 'direct' };
const FEED: InstagramRoute = { kind: 'feed' };

function mockRect(el: Element, width: number, height: number): void {
  el.getBoundingClientRect = () => ({
    width,
    height,
    top: 0,
    left: 0,
    right: width,
    bottom: height,
    x: 0,
    y: 0,
    toJSON: () => ({}),
  });
}

describe('createDmReelLock', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('activates when a fullscreen-sized video appears inside /direct/*', () => {
    const video = document.createElement('video');
    mockRect(video, window.innerWidth, window.innerHeight);
    document.body.appendChild(video);

    const dmReelLock = createDmReelLock();
    dmReelLock.process(document.body, DIRECT);

    expect(dmReelLock.isActive()).toBe(true);
  });

  it('does not activate for a small (non-fullscreen) video, e.g. a normal thread preview', () => {
    const video = document.createElement('video');
    mockRect(video, 120, 90);
    document.body.appendChild(video);

    const dmReelLock = createDmReelLock();
    dmReelLock.process(document.body, DIRECT);

    expect(dmReelLock.isActive()).toBe(false);
  });

  it('blocks a vertical swipe gesture while active', () => {
    const video = document.createElement('video');
    mockRect(video, window.innerWidth, window.innerHeight);
    document.body.appendChild(video);

    const dmReelLock = createDmReelLock();
    dmReelLock.process(document.body, DIRECT);

    const touchmove = new Event('touchmove', { cancelable: true, bubbles: true });
    document.body.dispatchEvent(touchmove);
    expect(touchmove.defaultPrevented).toBe(true);
  });

  it('deactivates and stops blocking once the fullscreen video is gone', () => {
    const video = document.createElement('video');
    mockRect(video, window.innerWidth, window.innerHeight);
    document.body.appendChild(video);

    const dmReelLock = createDmReelLock();
    dmReelLock.process(document.body, DIRECT);
    expect(dmReelLock.isActive()).toBe(true);

    video.remove();
    dmReelLock.process(document.body, DIRECT);
    expect(dmReelLock.isActive()).toBe(false);

    const touchmove = new Event('touchmove', { cancelable: true, bubbles: true });
    document.body.dispatchEvent(touchmove);
    expect(touchmove.defaultPrevented).toBe(false);
  });

  it('deactivates immediately when the route leaves /direct/*, even with a video still present', () => {
    const video = document.createElement('video');
    mockRect(video, window.innerWidth, window.innerHeight);
    document.body.appendChild(video);

    const dmReelLock = createDmReelLock();
    dmReelLock.process(document.body, DIRECT);
    expect(dmReelLock.isActive()).toBe(true);

    dmReelLock.process(document.body, FEED);
    expect(dmReelLock.isActive()).toBe(false);
  });

  it('never activates outside /direct/*', () => {
    const video = document.createElement('video');
    mockRect(video, window.innerWidth, window.innerHeight);
    document.body.appendChild(video);

    const dmReelLock = createDmReelLock();
    dmReelLock.process(document.body, FEED);

    expect(dmReelLock.isActive()).toBe(false);
  });
});
