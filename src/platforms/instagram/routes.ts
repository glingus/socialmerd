// Route classification table (docs/PIANO.md §4.1), a pure function of
// pathname+search so it's fully unit-testable without a real DOM/location.
// Two permalink shapes exist and both must be recognized (docs/spike-findings.md
// point b): bare (`/p/<code>/`, `/reel/<code>/`, seen in Explore) and
// author-prefixed (`/<user>/p/<code>/`, `/<user>/reel/<code>/`, seen in the
// feed and on profiles).

export type InstagramRouteKind =
  | 'redirect-to-following'
  | 'feed'
  | 'blocked'
  | 'reel-lock'
  | 'post'
  | 'profile'
  | 'explore'
  | 'explore-search'
  | 'direct'
  | 'stories'
  | 'activity'
  | 'passthrough';

export interface InstagramRoute {
  kind: InstagramRouteKind;
  /** Only set when kind is 'reel-lock' or 'post'. */
  code?: string;
}

// Top-level path segments with dedicated handling below. Anything else is
// treated as a username (fail-open: worst case we apply harmless
// profile-only hiding rules to a non-profile page instead of blocking it).
const RESERVED_TOP_SEGMENTS = new Set([
  'explore',
  'reels',
  'reel',
  'p',
  'direct',
  'stories',
  'accounts',
  'create',
  'challenge',
  'notifications',
]);

function isFeedVariant(search: string): boolean {
  const params = new URLSearchParams(search);
  const variant = params.get('variant');
  return variant === 'following' || variant === 'favorites';
}

export function classifyInstagramRoute(pathname: string, search = ''): InstagramRoute {
  const segments = pathname.split('/').filter(Boolean);

  if (segments.length === 0) {
    return isFeedVariant(search) ? { kind: 'feed' } : { kind: 'redirect-to-following' };
  }

  const [first, second, third] = segments;

  if (first === 'reels') {
    return { kind: 'blocked' }; // covers /reels/, /reels/*, /reels/audio/*
  }

  if (first === 'reel' && segments.length === 2 && second) {
    return { kind: 'reel-lock', code: second };
  }

  if (first === 'p' && segments.length === 2 && second) {
    return { kind: 'post', code: second };
  }

  if (first === 'explore') {
    if (segments.length === 1) return { kind: 'explore' };
    if (second === 'search') return { kind: 'explore-search' };
    if (second === 'tags' || second === 'locations' || second === 'people') {
      return { kind: 'blocked' };
    }
    return { kind: 'passthrough' };
  }

  if (first === 'direct') {
    return { kind: 'direct' };
  }

  if (first === 'stories') {
    return { kind: 'stories' };
  }

  if (first === 'accounts') {
    return second === 'activity' ? { kind: 'activity' } : { kind: 'passthrough' };
  }

  if (first === 'create' || first === 'challenge' || first === 'notifications') {
    return { kind: 'passthrough' };
  }

  // Not a reserved segment: treat `first` as a username.
  if (!RESERVED_TOP_SEGMENTS.has(first ?? '')) {
    if (second === 'reel' && segments.length === 3 && third) {
      return { kind: 'reel-lock', code: third };
    }
    if (second === 'p' && segments.length === 3 && third) {
      return { kind: 'post', code: third };
    }
    return { kind: 'profile' };
  }

  return { kind: 'passthrough' };
}

// Shared permalink parsing, reused by feed-reels-placeholder.ts and
// reel-lock.ts to spot a post/reel link anywhere in the DOM (not just in
// location.pathname). Same bare-or-prefixed shapes as classifyInstagramRoute.
const REEL_PERMALINK = /^\/(?:[a-zA-Z0-9_.]+\/)?reel\/([A-Za-z0-9_-]+)\/?$/;
const POST_PERMALINK = /^\/(?:[a-zA-Z0-9_.]+\/)?p\/([A-Za-z0-9_-]+)\/?$/;

export function parseReelPermalinkHref(href: string): string | null {
  return REEL_PERMALINK.exec(href)?.[1] ?? null;
}

export function parsePostPermalinkHref(href: string): string | null {
  return POST_PERMALINK.exec(href)?.[1] ?? null;
}
