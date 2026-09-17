// All Instagram DOM selectors live here (CLAUDE.md: "Selettori e stringhe
// riconosciuti solo in selectors.ts/strings.ts"). Every entry names the
// docs/spike-findings.md point it was confirmed against and the date.
// Ordering preference per docs/PIANO.md §3.4: URL/route -> href/ARIA/structure
// -> text (strings.ts). No obfuscated/hashed CSS classes.

/** Bottom nav bar + top-of-feed header links (spike points a, g, l). */
export const NAV = {
  // verified 2026-09-17 (point g): aria-label values on the 5-icon bottom
  // nav bar. "Reels" and "Notifiche" were seen occupying the same slot on
  // different pages — treat both as recognized, not as fixed positions.
  ariaLabels: ['Home', 'Esplora', 'Reels', 'Messaggi', 'Notifiche'] as const,
  // verified 2026-09-17 (point l): the profile avatar link in the nav bar is
  // the only one pointing at a username instead of a fixed route. Its alt
  // text follows this pattern (IT observed; EN pattern per Meta's usual
  // naming, not yet verified live).
  profileAvatarAltPattern: /^(Immagine del profilo di|Profile photo of) /,
} as const;

/** Feed post structure (spike point b). */
export const FEED = {
  // verified 2026-09-17 (point b): each post in the feed is an <article>.
  postSelector: 'article',
  // verified 2026-09-17 (point b): ISO 8601 timestamp on every post.
  timeSelector: 'time[datetime]',
} as const;

/** App-open interstitial (spike point m). */
export const APP_BANNER = {
  // verified 2026-09-17 (point m): the dismiss icon is an <svg aria-label
  //="Chiudi"> (IT). Never click the "Usa l'app" button next to it — that
  // opens the native app / store, the opposite of what this script does.
  closeIconAriaLabels: ['Chiudi', 'Close'] as const,
} as const;

/** "Account simili" / similar-accounts block on profiles (spike point f). */
export const PROFILE = {
  // verified 2026-09-17 (point f): aria-label on the "similar accounts"
  // suggestion block shown on profiles.
  similarAccountsAriaLabels: ['Account simili', 'Similar accounts'] as const,
} as const;

/** Story tray + viewer (spike points a, i). */
export const STORIES = {
  // verified 2026-09-17 (point a): each story ring in the tray has this
  // aria-label pattern, with the account name interpolated.
  trayItemAriaLabelPattern: /^Storia di (.+), da vedere$/,
} as const;

/** Shared-reel bubble inside a DM thread (spike point d, partial). */
export const DM_REEL_SHARE = {
  // verified 2026-09-17 (point d, partial): a shared reel renders as a
  // vertical <img> poster whose CDN URL has an `efg` query param — a
  // base64-encoded JSON blob, e.g. `eyJlZmciOiJDTElQUy5pZ19zaGltX3JlYWQu…"`
  // which decodes to `{"efg":"CLIPS.ig_shim_read.150x267.C3"}` — overlaid by
  // an <svg aria-label/title="Clip">. It is NOT wrapped in a real <a href>
  // (client-side routed), so detection has to be this DOM/URL heuristic —
  // confirmed only structurally, tap-through behaviour still open (see
  // spike-findings.md point d). Use `isReelShareThumbnail` below, which does
  // the base64 decode; do not substring-match the raw (still-encoded) URL.
  clipIconAriaLabels: ['Clip'] as const,
} as const;

/** Decodes an `efg` CDN query param and checks it marks a reel/clip asset.
 * Never throws: a malformed/foreign `efg` value just means "not a match". */
export function isReelShareThumbnail(imgSrc: string): boolean {
  try {
    const efg = new URL(imgSrc).searchParams.get('efg');
    if (!efg) return false;
    const decoded = atob(efg.replace(/-/g, '+').replace(/_/g, '/'));
    return /"efg"\s*:\s*"CLIPS\./.test(decoded);
  } catch {
    return false;
  }
}
