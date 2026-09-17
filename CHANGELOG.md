# Changelog

All notable changes to this project are documented in this file.
Format loosely based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [Unreleased]

### Added

- Project scaffold: TypeScript + esbuild build (main/dev/Greasy Fork variants, unminified), Vitest, ESLint/Prettier, GitHub Actions CI.
- "Hello" debug badge userscript to verify document-start CSS injection and GM storage persistence on iOS. Verified on device 2026-09-17 (Orion + Tampermonkey): Fase 1 complete.
- Fase 2 tooling: `e2e:login` (manual login in a persistent Chrome profile), `fixture:capture` (capture + sanitize a page), `sanitize-fixture.mjs` (strip scripts/JSON, redact CDN media URLs), and the `docs/spike-findings.md` template.
- Fase 3 (Core): `core/storage.ts` (versioned schema + migrations), `core/url-watcher.ts`, `core/dom-scheduler.ts` (single shared MutationObserver), `core/i18n/*`, `core/log.ts`, `core/silent-nav.ts`, `core/blocks.ts`, `core/ui/host.ts` (Shadow DOM host). Not yet wired into `src/main.ts`.
- Fase 6 (early, spike-independent): `features/update-check.ts` (daily version check against the channel's `.meta.js`) and `features/time-tracker.ts` (batched tick/flush usage counter, 35-day retention).
- Fase 2: real-DOM spike findings for Instagram and YouTube mobile web, `docs/spike-findings.md`. Confirmed the plan's route/selector assumptions with a few corrections (feed permalinks are username-prefixed, YouTube's Shorts markup changed from what was originally planned). Points requiring the real iPhone (Story publishing, account switcher, content-world probes, the `orion://` URL scheme) are still open.
- Fase 4 (Instagram): `platforms/instagram/{routes,selectors,strings,account,section,route-guard,nav-cleanup,app-banners,explore-search,feed-filter,feed-reels-placeholder,feed-limiter,stories-ads,reel-lock,index}.ts` — the full feature set from `docs/PIANO.md` §4.1-4.4 (following-only feed with a "You're all caught up" stop, reel placeholders, isolated reel player, Explore/profile/story suggestion hiding, app-open banner dismissal). Wired into `src/main.ts`. Unit/DOM tests green; live Playwright scenarios (§7.3) not yet run.
- Fase 5 (YouTube): `platforms/youtube/{routes,selectors,shorts-hider,section,index}.ts` — redirects `/shorts/<id>` to `/watch?v=<id>` and hides Shorts shelves/tab/loose cards (§4.5). Selectors updated against the real current YouTube markup (the plan's `ytm-reel-shelf-renderer`/`ytm-reel-item-renderer` no longer exist). Wired into `src/main.ts`.
- Fase 6 (UI): `core/settings.ts` (configurable extras), `features/stats.ts` (7-day aggregation), a per-marker hit counter in `core/dom-scheduler.ts`, and `core/ui/{bars,pill,panel,welcome,debug-overlay}.ts` — the pill, bottom-sheet panel (today/7-day/blocks/settings/info), first-launch welcome screen and the 5-tap debug overlay from §4.6. All wired into `src/main.ts` alongside the time tracker and update check. Extended `core/i18n/{it,en}.ts` with every new UI string. Not yet seen on a real device — pill offset and YouTube full-screen detection are flagged `TODO` in `src/main.ts`/`core/ui/pill.ts` pending live verification.
- `docs/TESTING-iphone.md`: draft checklist for the Fase 7 live iPhone test pass, combining §7.3/§7.4 with the spike points that need the real device.

### Changed

- **Architecture: dropped Safari entirely, moved to the [Orion browser](https://orionbrowser.com/) with [Tampermonkey](https://www.tampermonkey.net/).** No Safari extension activates on the target iPhone (iOS 26) — Userscripts (quoid), Stay for Safari and finally Grammarly all fail, with Screen Time restrictions and configuration profiles ruled out and no resolution from Apple support: that device's Safari extension subsystem is broken, not the apps. Orion implements WebExtensions on top of WKWebView, bypassing Apple's extension machinery, and it's still WebKit, so Instagram and YouTube behave identically. Verified on device 2026-09-17: install from the raw link, badge on both sites, `GM.setValue` persistence, `@run-at document-start` honored. **No script code changed** — only install instructions and docs. See `docs/RICERCA.md` §4.2 and `docs/PIANO.md` §0.
- Delivery app previously switched from Userscripts (quoid) to Stay for Safari (see `docs/RICERCA.md` §4.1); superseded by the move to Orion above.

### Fixed

- `scripts/build.mjs`: the dev-channel build number now excludes dist-only commits, so a fresh rebuild of the same commit always matches what's committed (was breaking CI's `dist/` freshness check).
