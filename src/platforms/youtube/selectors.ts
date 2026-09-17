// All YouTube DOM selectors live here (CLAUDE.md: "Selettori e stringhe
// riconosciuti solo in selectors.ts/strings.ts"). Verified against the real
// m.youtube.com home page (tests/fixtures/raw/yt-home.html) and a direct
// Shorts page (tests/fixtures/raw/yt-shorts-direct.html), captured during
// the Fase 2 spike (docs/spike-findings.md point p, 2026-09-17). The plan's
// original `ytm-reel-shelf-renderer`/`ytm-reel-item-renderer` were NOT found
// live on the current YouTube markup and are dropped here.

export const SHORTS = {
  // verified 2026-09-17 (point p): every individual Shorts card (home feed,
  // search results, channel) is exactly one of these, always wrapping an
  // `a[href^="/shorts/"]`. 8/8 Shorts cards in the home capture matched.
  lockupTag: 'ytm-shorts-lockup-view-model',
  // verified 2026-09-17 (point p): the shelf wrapper around a Shorts row in
  // home. This tag is generic (also wraps non-Shorts shelves, e.g. "Ultime
  // notizie" in the same capture) -- only hide an instance that actually
  // contains a `lockupTag` descendant, never unconditionally.
  shelfWrapperTag: 'ytm-rich-section-renderer',
  // verified 2026-09-17 (point p): the bottom tab bar's Shorts entry carries
  // this semantic (non-hashed) class on its tab/title elements, alongside
  // Home/Iscrizioni/Tu using the equivalent pivot-w2w/pivot-subs/pivot-you.
  bottomTabItemTag: 'ytm-pivot-bar-item-renderer',
  bottomTabClass: 'pivot-shorts',
  // verified 2026-09-17 (point p): fallback for a Shorts link rendered
  // outside a `lockupTag` card -- observed in the home capture's "Ultime
  // notizie" shelf (a `shelfWrapperTag` mixed with normal /watch cards, so
  // the whole shelf must NOT be hidden): `ytm-video-with-context-renderer >
  // ytm-media-item.big-shorts-singleton > a[href^="/shorts/"]`. Hide the
  // nearest `ytm-video-with-context-renderer` ancestor so the whole card
  // (thumbnail + metadata) disappears, not just the link.
  looseLinkSelector: 'a[href^="/shorts/"]',
  looseLinkCardAncestorSelector: 'ytm-video-with-context-renderer',
} as const;
