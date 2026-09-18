// Best-effort lock for a reel viewer opened from within a DM thread without
// a URL change (docs/PIANO.md §4.2: "oppure viewer reel rilevato nel DOM
// dentro /direct/*"). docs/spike-findings.md point (d) never confirmed the
// DOM structure of the opened viewer itself (only the thumbnail in the
// thread list, selectors.ts's DM_REEL_SHARE) -- reel-lock.ts's URL-based
// engage/release can't cover this case at all.
//
// Found live 2026-09-18: opening a shared reel from a DM left swipe-to-next
// fully active (no lock engaged), confirming this gap in practice.
//
// Heuristic used here, deliberately structural instead of a guessed
// Instagram-specific class (CLAUDE.md: no obfuscated selectors): inside
// /direct/*, a <video> covering most of the viewport is treated as an open
// reel viewer. This only blocks the swipe/scroll/key gestures reel-lock.ts
// already blocks for the URL case -- it does not navigate anywhere (there
// is no URL to bounce from) and does not increment reel_next, since we
// can't reliably detect an actual "advanced to a second reel" event this
// way, only "a fullscreen video is open". If it turns out the DM viewer
// auto-advances on a timer rather than a gesture, this heuristic alone
// won't stop it -- needs live re-verification once seen again.

import type { InstagramRoute } from './routes';
import { blockAdjacentReelGestures, type GestureBlockHandle } from './reel-lock';

const FULLSCREEN_COVERAGE_RATIO = 0.8;

function findFullscreenVideo(root: ParentNode): HTMLVideoElement | null {
  for (const video of root.querySelectorAll('video')) {
    const rect = video.getBoundingClientRect();
    if (rect.width >= window.innerWidth * FULLSCREEN_COVERAGE_RATIO && rect.height >= window.innerHeight * FULLSCREEN_COVERAGE_RATIO) {
      return video;
    }
  }
  return null;
}

export interface DmReelLockController {
  process(root: ParentNode, route: InstagramRoute): void;
  isActive(): boolean;
}

export function createDmReelLock(): DmReelLockController {
  let handle: GestureBlockHandle | null = null;
  let active = false;

  function deactivate(): void {
    handle?.release();
    handle = null;
    active = false;
  }

  return {
    isActive: () => active,
    process(root, route): void {
      if (route.kind !== 'direct') {
        if (active) deactivate();
        return;
      }

      const found = findFullscreenVideo(root) !== null;
      if (found && !active) {
        active = true;
        handle = blockAdjacentReelGestures();
      } else if (!found && active) {
        deactivate();
      }
    },
  };
}
