// docs/PIANO.md §4.3: stops the "Seguiti" feed at the first post already
// seen (or older than 24h), with a fixed "Sei in pari" card and no way to
// load further back. Split in two layers per §7.1/§7.2:
//   - pure decision functions (this file, top half): given already-parsed
//     post timestamps and a boundary, decide where to cut. Fully unit
//     tested, no DOM.
//   - DOM orchestration (bottom half): reads <article>/<time> from the real
//     feed, clips the scroll container, and updates the watermark via
//     IntersectionObserver. The observer is injectable so tests can mock it
//     (§7.2 — "le parti che dipendono da IntersectionObserver... mockate").
//
// Chronological mode (variant=following, confirmed working live in
// docs/spike-findings.md point a) is the only mode wired into the DOM
// processor. "Ranked" mode (§4.3 fallback, for accounts where
// variant=following isn't honoured) is implemented and unit-tested but not
// wired up — nothing in this spike needed it; wire it in if a future
// account/session shows the fallback is actually necessary.

import { getValue, setValue } from '../../core/gm';
import { incrementBlock } from '../../core/blocks';
import { markProcessed, type Processor } from '../../core/dom-scheduler';
import { FEED } from './selectors';
import type { InstagramRoute } from './routes';

// --- Pure decision logic ----------------------------------------------------

export interface FeedState {
  /** Epoch ms of the newest post the user has already watched through. */
  watermark: number | null;
  lastCaughtUpAt: number | null;
}

export function emptyFeedState(): FeedState {
  return { watermark: null, lastCaughtUpAt: null };
}

const DEFAULT_WINDOW_MS = 24 * 60 * 60 * 1000;

/** boundary = max(watermark, now - 24h) (§4.3). Deliberately does NOT clamp
 * a corrupted future watermark to `now`: if storage ever holds a future
 * timestamp, every currently loaded post is at-or-before it, so the feed
 * correctly (if surprisingly) reports "you're all caught up" instead of
 * silently discarding the bad watermark and showing stale content. */
export function computeBoundary(state: FeedState, now: number, windowMs = DEFAULT_WINDOW_MS): number {
  return Math.max(state.watermark ?? 0, now - windowMs);
}

export interface FeedPost {
  /** Epoch ms from time[datetime], or null if the post has no timestamp
   * (§4.1: posts without one never stop the feed). */
  timestamp: number | null;
}

export interface ChronologicalDecision {
  /** How many leading posts (from index 0) stay visible. */
  visibleCount: number;
  /** Index of the first post at-or-before the boundary, i.e. where the
   * "Sei in pari" card goes; null if no loaded post has hit it yet. */
  caughtUpAtIndex: number | null;
}

export function decideChronological(posts: readonly FeedPost[], boundary: number): ChronologicalDecision {
  for (let i = 0; i < posts.length; i += 1) {
    const ts = posts[i]?.timestamp ?? null;
    if (ts !== null && ts <= boundary) {
      return { visibleCount: i, caughtUpAtIndex: i };
    }
  }
  return { visibleCount: posts.length, caughtUpAtIndex: null };
}

export interface RankedDecision {
  /** Indices (within `posts`) of individual old posts to hide. */
  hiddenIndices: number[];
  /** Index after which to insert the card and clip the feed; null if
   * neither stop condition (5 consecutive old posts, 50 processed) was hit
   * within the given posts. */
  caughtUpAtIndex: number | null;
}

const RANKED_CONSECUTIVE_LIMIT = 5;
const RANKED_PROCESSED_LIMIT = 50;

export function decideRanked(posts: readonly FeedPost[], boundary: number): RankedDecision {
  const hiddenIndices: number[] = [];
  let consecutiveOld = 0;

  for (let i = 0; i < posts.length; i += 1) {
    const ts = posts[i]?.timestamp ?? null;
    const isOld = ts !== null && ts <= boundary;
    if (isOld) {
      hiddenIndices.push(i);
      consecutiveOld += 1;
    } else {
      consecutiveOld = 0;
    }
    if (consecutiveOld >= RANKED_CONSECUTIVE_LIMIT || i + 1 >= RANKED_PROCESSED_LIMIT) {
      return { hiddenIndices, caughtUpAtIndex: i };
    }
  }
  return { hiddenIndices, caughtUpAtIndex: null };
}

/** New watermark after a "Sei in pari" card became >=50% visible (§4.3).
 * `mostRecentShown` is the newest timestamp among posts actually shown this
 * session; null means nothing to update (e.g. an empty feed). */
export function nextWatermark(state: FeedState, mostRecentShown: number | null): number | null {
  if (mostRecentShown === null) return state.watermark;
  return Math.max(state.watermark ?? 0, mostRecentShown);
}

// --- Per-account persisted state --------------------------------------------

function stateKey(account: string): string {
  return `smd:v1:ig:${account}:feed`;
}

export async function loadFeedState(account: string): Promise<FeedState> {
  return getValue(stateKey(account), emptyFeedState());
}

export async function saveFeedState(account: string, state: FeedState): Promise<void> {
  await setValue(stateKey(account), state);
}

// --- DOM orchestration -------------------------------------------------------

const CARD_CLASS = 'smd-feed-caught-up';
const LOADING_ARIA_LABELS = ['Caricamento...', 'Loading...'];

function parseTimestamp(article: Element): number | null {
  const time = article.querySelector(FEED.timeSelector);
  const datetime = time?.getAttribute('datetime');
  if (!datetime) return null;
  const parsed = Date.parse(datetime);
  return Number.isNaN(parsed) ? null : parsed;
}

function buildCaughtUpCard(): HTMLElement {
  const card = document.createElement('div');
  card.className = CARD_CLASS;
  card.textContent = 'Sei in pari ✓';
  return card;
}

function clipContainer(container: HTMLElement, upTo: HTMLElement): void {
  const bottom = upTo.offsetTop + upTo.offsetHeight - container.offsetTop;
  container.style.maxHeight = `${bottom}px`;
  container.style.overflow = 'hidden';
}

function hideLoadingSentinels(container: ParentNode): void {
  const selector = LOADING_ARIA_LABELS.map((label) => `[aria-label="${label}"]`).join(', ');
  for (const sentinel of container.querySelectorAll(selector)) {
    (sentinel as HTMLElement).style.display = 'none';
  }
}

export interface FeedLimiterDeps {
  getAccount: () => string;
  now?: () => number;
  IntersectionObserverImpl?: typeof IntersectionObserver;
}

/** Registers the feed-limiter processor. Async account/state loading means
 * the very first mutation batch after a navigation may run before state is
 * ready; the shared dom-scheduler re-runs on every subsequent DOM change,
 * so it settles within the next batch — no missed posts, just one skipped
 * tick worst case. */
export function registerFeedLimiterProcessor(getRoute: () => InstagramRoute, deps: FeedLimiterDeps): Processor {
  const now = deps.now ?? (() => Date.now());
  let cachedState: FeedState | null = null;
  let cachedAccount: string | null = null;
  let caughtUpCard: HTMLElement | null = null;

  return (root) => {
    if (getRoute().kind !== 'feed') return;

    const account = deps.getAccount();
    if (account !== cachedAccount) {
      cachedAccount = account;
      cachedState = null;
      void loadFeedState(account).then((state) => {
        cachedState = state;
      });
    }
    if (!cachedState) return; // state not loaded yet, wait for the next batch

    const articles = [...root.querySelectorAll(FEED.postSelector)];
    const posts: FeedPost[] = articles.map((article) => ({ timestamp: parseTimestamp(article) }));
    const boundary = computeBoundary(cachedState, now());
    const decision = decideChronological(posts, boundary);

    for (let i = decision.visibleCount; i < articles.length; i += 1) {
      const article = articles[i];
      if (article && markProcessed(article, 'feed-limiter-hide')) {
        article.style.display = 'none';
      }
    }

    if (decision.caughtUpAtIndex === null) return;
    if (caughtUpCard?.isConnected) return; // already inserted, nothing else to do here

    const anchor = articles[decision.visibleCount - 1] ?? articles[0];
    const container = anchor?.parentElement ?? root;
    caughtUpCard = buildCaughtUpCard();

    if (anchor) {
      anchor.parentElement?.insertBefore(caughtUpCard, anchor.nextSibling);
    } else if (container instanceof Element) {
      container.appendChild(caughtUpCard);
    }

    if (container instanceof HTMLElement) {
      clipContainer(container, caughtUpCard);
      hideLoadingSentinels(container);
    }

    const mostRecentShown = posts
      .slice(0, decision.visibleCount)
      .reduce<number | null>(
        (max, post) => (post.timestamp !== null && (max === null || post.timestamp > max) ? post.timestamp : max),
        null,
      );

    // §4.3: the watermark only advances (and blocks.feed_end++ only fires)
    // once per session, when the card is actually seen (>=50% visible) —
    // not merely inserted, which could happen off-screen below the fold.
    const ObserverImpl = deps.IntersectionObserverImpl ?? IntersectionObserver;
    const observer = new ObserverImpl(
      (entries) => {
        const visible = entries.some((entry) => entry.isIntersecting && entry.intersectionRatio >= 0.5);
        if (!visible) return;
        observer.disconnect();
        void incrementBlock('feed_end');
        if (!cachedState) return;
        const updated: FeedState = { watermark: nextWatermark(cachedState, mostRecentShown), lastCaughtUpAt: now() };
        cachedState = updated;
        void saveFeedState(account, updated);
      },
      { threshold: 0.5 },
    );
    observer.observe(caughtUpCard);
  };
}
