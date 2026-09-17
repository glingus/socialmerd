import { defineConfig, devices } from '@playwright/test';

// Manual live tests against the user's real, logged-in profile (docs/PIANO.md §7.3).
// NEVER run in CI: read-only navigation, slowMo, one worker, no automation-hiding flags.
export default defineConfig({
  testDir: 'tests/e2e/live',
  fullyParallel: false,
  workers: 1,
  retries: 0,
  reporter: 'list',
  use: {
    ...devices['iPhone 15'],
    channel: 'chrome',
    storageState: undefined, // uses the persistent context created by scripts/e2e-login.mjs
    launchOptions: {
      slowMo: 500,
    },
  },
});
