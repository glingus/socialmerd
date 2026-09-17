// Both platforms now run their real feature set: Instagram (Fase 4) and
// YouTube (Fase 5). Fase 1's "hello" debug badge, verified working on the
// user's iPhone (see docs/PIANO.md), has served its purpose and is retired.

import { detectSite } from './core/env';
import { startInstagramPlatform } from './platforms/instagram';
import { startYoutubePlatform } from './platforms/youtube';

function main(): void {
  const site = detectSite();
  if (!site) return;

  if (site === 'instagram') {
    startInstagramPlatform();
  } else {
    startYoutubePlatform();
  }
}

main();
