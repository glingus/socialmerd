// Hides every Shorts entry point that isn't the video URL itself
// (docs/PIANO.md §4.5): home/search/channel shelves, the bottom tab, and any
// loose card linking straight to a Shorts video. The `/shorts/<id>` URL
// itself is handled by a redirect in index.ts, not by hiding.

import { markProcessed, type Processor } from '../../core/dom-scheduler';
import { SHORTS } from './selectors';

function hide(el: Element, marker: string): void {
  if (!markProcessed(el, marker)) return;
  (el as HTMLElement).style.display = 'none';
}

function hideShelvesContainingShorts(root: ParentNode): void {
  for (const shelf of root.querySelectorAll(SHORTS.shelfWrapperTag)) {
    if (!shelf.querySelector(SHORTS.lockupTag)) continue;
    hide(shelf, 'yt-shorts-shelf');
  }
}

function hideBottomTab(root: ParentNode): void {
  for (const item of root.querySelectorAll(SHORTS.bottomTabItemTag)) {
    if (!item.querySelector(`.${SHORTS.bottomTabClass}`)) continue;
    hide(item, 'yt-shorts-tab');
  }
}

function hideLooseShortsLinks(root: ParentNode): void {
  for (const link of root.querySelectorAll(SHORTS.looseLinkSelector)) {
    const card = link.closest(SHORTS.looseLinkCardAncestorSelector) ?? link;
    hide(card, 'yt-shorts-loose-link');
  }
}

export const processShortsHider: Processor = (root) => {
  hideShelvesContainingShorts(root);
  hideBottomTab(root);
  hideLooseShortsLinks(root);
};
