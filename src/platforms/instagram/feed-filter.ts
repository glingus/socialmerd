// docs/PIANO.md §4.3: hides sponsored posts and posts from accounts the
// user doesn't follow (surfaced via a "Suggeriti per te" label or a Follow
// button in the post header). Paid-partnership posts from followed accounts
// use different wording ("Partnership retribuita con…") and are
// deliberately NOT matched here, so they stay visible per the plan.
//
// TODO (needs live verification, docs/spike-findings.md point b): the plan
// also calls for hiding suggested-account/suggested-reel *shelves* (carousel
// blocks between posts, not individual posts). No sponsored/suggested post
// appeared in this spike's feed capture, so there's no confirmed selector
// for those shelves yet — only per-post filtering below is implemented.

import { markProcessed, type Processor } from '../../core/dom-scheduler';
import { FEED } from './selectors';
import { FOLLOW_BUTTON, SPONSORED_LABEL, SUGGESTED_FOR_YOU_HEADING } from './strings';
import type { InstagramRoute } from './routes';

const HIDE_TEXTS = new Set<string>([
  ...SPONSORED_LABEL.it,
  ...SPONSORED_LABEL.en,
  ...SUGGESTED_FOR_YOU_HEADING.it,
  ...SUGGESTED_FOR_YOU_HEADING.en,
  ...FOLLOW_BUTTON.it,
  ...FOLLOW_BUTTON.en,
]);

export function processFeedFilter(root: ParentNode, route: InstagramRoute): void {
  if (route.kind !== 'feed') return;

  for (const post of root.querySelectorAll(FEED.postSelector)) {
    if (!markProcessed(post, 'feed-filter')) continue;
    const text = post.textContent ?? '';
    const shouldHide = [...HIDE_TEXTS].some((needle) => text.includes(needle));
    if (shouldHide) {
      post.style.display = 'none';
    }
  }
}

export const registerFeedFilterProcessor =
  (getRoute: () => InstagramRoute): Processor =>
  (root) =>
    processFeedFilter(root, getRoute());
