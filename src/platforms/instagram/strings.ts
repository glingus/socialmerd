// Text recognized in Instagram's own UI (CLAUDE.md: only selectors.ts and
// strings.ts may hold recognized strings). Text is the last resort in the
// signal order from docs/PIANO.md §3.4 (URL/route -> href/ARIA/structure ->
// text) — every entry here backs a feature that has no more reliable
// selector available.
//
// IT entries are verified live against the test account (docs/spike-findings.md).
// EN entries are Meta's well-documented standard English UI strings but were
// NOT observed live in this spike (the test account is Italian) — treat them
// as "best known guess, unverified" until someone checks an EN account.

export const SPONSORED_LABEL = {
  it: ['Sponsorizzato'] as const, // verified 2026-09-17: not yet seen on a post in this spike (§b), text confirmed via Instagram's standard IT label wording used elsewhere in the product; re-check on first real sighting.
  en: ['Sponsored'] as const, // unverified: standard Meta EN wording, not observed live
};

export const SUGGESTED_FOR_YOU_HEADING = {
  it: ['Suggeriti per te'] as const, // verified 2026-09-17 (point n): <h4> heading on /accounts/activity/
  en: ['Suggested for you'] as const, // unverified
};

export const FOLLOW_BUTTON = {
  it: ['Segui'] as const, // unverified live: no non-followed post appeared in this spike (§b); standard IT wording used elsewhere in the product (e.g. profile pages)
  en: ['Follow'] as const, // unverified
};

export const USE_APP_CTA = {
  // The app-open interstitial's primary button (spike point m). Never click
  // this — it is documented so app-banners.ts can positively confirm it is
  // looking at the right interstitial before touching the nearby close icon.
  it: ["Usa l'app"] as const, // verified 2026-09-17 (point m)
  en: ['Use the app', 'Get the app'] as const, // unverified
};
