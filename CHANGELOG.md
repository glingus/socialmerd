# Changelog

All notable changes to this project are documented in this file.
Format loosely based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [Unreleased]

### Added

- Project scaffold: TypeScript + esbuild build (main/dev/Greasy Fork variants, unminified), Vitest, ESLint/Prettier, GitHub Actions CI.
- "Hello" debug badge userscript to verify document-start CSS injection and GM storage persistence on iOS Safari.
- Fase 2 tooling: `e2e:login` (manual login in a persistent Chrome profile), `fixture:capture` (capture + sanitize a page), `sanitize-fixture.mjs` (strip scripts/JSON, redact CDN media URLs), and the `docs/spike-findings.md` template.

### Fixed

- `scripts/build.mjs`: the dev-channel build number now excludes dist-only commits, so a fresh rebuild of the same commit always matches what's committed (was breaking CI's `dist/` freshness check).
