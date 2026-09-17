# Changelog

All notable changes to this project are documented in this file.
Format loosely based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [Unreleased]

### Added

- Project scaffold: TypeScript + esbuild build (main/dev/Greasy Fork variants, unminified), Vitest, ESLint/Prettier, GitHub Actions CI.
- "Hello" debug badge userscript to verify document-start CSS injection and GM storage persistence on iOS Safari.
- Fase 2 tooling: `e2e:login` (manual login in a persistent Chrome profile), `fixture:capture` (capture + sanitize a page), `sanitize-fixture.mjs` (strip scripts/JSON, redact CDN media URLs), and the `docs/spike-findings.md` template.
- Fase 3 (Core): `core/storage.ts` (versioned schema + migrations), `core/url-watcher.ts`, `core/dom-scheduler.ts` (single shared MutationObserver), `core/i18n/*`, `core/log.ts`, `core/silent-nav.ts`, `core/blocks.ts`, `core/ui/host.ts` (Shadow DOM host). Not yet wired into `src/main.ts`.
- Fase 6 (early, spike-independent): `features/update-check.ts` (daily version check against the channel's `.meta.js`) and `features/time-tracker.ts` (batched tick/flush usage counter, 35-day retention).

### Changed

- **Delivery app switched from Userscripts (quoid) to [Stay for Safari](https://apps.apple.com/app/stay-for-safari/id1591620171).** Userscripts wouldn't activate in Safari on the user's iOS 26 device — a known, unresolved bug in that app (see `docs/RICERCA.md` §4.1), not a config issue. Stay is also free and open source (MPL) and implements the same `GM.*` API and userscript metadata, so no script code changed.

### Fixed

- `scripts/build.mjs`: the dev-channel build number now excludes dist-only commits, so a fresh rebuild of the same commit always matches what's committed (was breaking CI's `dist/` freshness check).
