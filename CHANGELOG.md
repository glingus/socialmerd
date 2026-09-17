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

### Changed

- **Architecture: dropped Safari entirely, moved to the [Orion browser](https://orionbrowser.com/) with [Tampermonkey](https://www.tampermonkey.net/).** No Safari extension activates on the target iPhone (iOS 26) — Userscripts (quoid), Stay for Safari and finally Grammarly all fail, with Screen Time restrictions and configuration profiles ruled out and no resolution from Apple support: that device's Safari extension subsystem is broken, not the apps. Orion implements WebExtensions on top of WKWebView, bypassing Apple's extension machinery, and it's still WebKit, so Instagram and YouTube behave identically. Verified on device 2026-09-17: install from the raw link, badge on both sites, `GM.setValue` persistence, `@run-at document-start` honored. **No script code changed** — only install instructions and docs. See `docs/RICERCA.md` §4.2 and `docs/PIANO.md` §0.
- Delivery app previously switched from Userscripts (quoid) to Stay for Safari (see `docs/RICERCA.md` §4.1); superseded by the move to Orion above.

### Fixed

- `scripts/build.mjs`: the dev-channel build number now excludes dist-only commits, so a fresh rebuild of the same commit always matches what's committed (was breaking CI's `dist/` freshness check).
