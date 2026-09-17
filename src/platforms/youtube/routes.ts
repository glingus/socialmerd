// Route classification for YouTube mobile (docs/PIANO.md §4.5), a pure
// function of pathname so it's fully unit-testable without a real
// location. Much smaller than Instagram's routes.ts: YouTube only needs
// one redirect (Shorts -> watch) plus a video/browse split for the
// time-tracker section (features/time-tracker.ts's YtSection).

export type YoutubeRouteKind = 'shorts-redirect' | 'watch' | 'browse';

export interface YoutubeRoute {
  kind: YoutubeRouteKind;
  /** Only set when kind is 'shorts-redirect'. */
  videoId?: string;
}

// verified 2026-09-17 (docs/spike-findings.md point p): /shorts/<id> stays
// on that URL with no automatic redirect, so we have to do it ourselves.
const SHORTS_PATH = /^\/shorts\/([A-Za-z0-9_-]+)/;

export function classifyYoutubeRoute(pathname: string): YoutubeRoute {
  const shortsMatch = SHORTS_PATH.exec(pathname);
  if (shortsMatch?.[1]) {
    return { kind: 'shorts-redirect', videoId: shortsMatch[1] };
  }
  if (pathname === '/watch') {
    return { kind: 'watch' };
  }
  return { kind: 'browse' };
}

export function watchUrlFor(videoId: string): string {
  return `/watch?v=${videoId}`;
}
