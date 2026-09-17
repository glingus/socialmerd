// Entry point: detects the site, starts its platform module (Instagram
// Fase 4, YouTube Fase 5), and wires up the shared Fase 6 extras (time
// tracker, pill, panel, debug overlay, welcome, update-check). Fase 1's
// "hello" debug badge, verified working on the user's iPhone (see
// docs/PIANO.md), has served its purpose and is retired.

import { detectSite, type Site } from './core/env';
import { detectLang, type Lang } from './core/i18n';
import { getSettings } from './core/settings';
import { getDayStats } from './core/storage';
import { createDebugOverlay } from './core/ui/debug-overlay';
import { getHost } from './core/ui/host';
import { createPanel } from './core/ui/panel';
import { createPill, shouldHidePill } from './core/ui/pill';
import { hasSeenWelcome, showWelcome } from './core/ui/welcome';
import { igMinutes, ytMinutes } from './features/stats';
import { startTimeTracker, type CurrentSection } from './features/time-tracker';
import { checkForUpdate } from './features/update-check';
import { startInstagramPlatform } from './platforms/instagram';
import { sectionForRoute as sectionForInstagramRoute } from './platforms/instagram/section';
import type { InstagramRoute } from './platforms/instagram/routes';
import { startYoutubePlatform } from './platforms/youtube';
import { sectionForRoute as sectionForYoutubeRoute } from './platforms/youtube/section';
import type { YoutubeRoute } from './platforms/youtube/routes';

const REPO = 'glingus/socialmerd';
const INTERACTION_WINDOW_MS = 60_000;
const PILL_REFRESH_MS = 5000;

// TODO (needs live verification on iPhone/Orion): iOS video often goes
// fullscreen via native player chrome rather than the page's Fullscreen
// API, so this may never report true there. If confirmed wrong on-device,
// swap for a heuristic based on the video element's own size instead.
function isFullscreenVideo(): boolean {
  const doc = document as Document & { webkitFullscreenElement?: Element | null };
  return doc.fullscreenElement != null || doc.webkitFullscreenElement != null;
}

function metaUrlFor(channel: typeof __SMD_CHANNEL__): string | null {
  if (channel === 'greasyfork') return null; // §4.7: GitHub-hosted channels only
  const branch = channel === 'main' ? 'main' : 'dev';
  return `https://raw.githubusercontent.com/${REPO}/${branch}/dist/socialmerd.meta.js`;
}

async function bootstrap(site: Site): Promise<void> {
  const settings = await getSettings();
  let pillEnabled = settings.pillEnabled;
  let lang: Lang = detectLang(navigator.language, settings.langOverride);

  const host = getHost();

  let hasRecentInteraction = false;
  let interactionTimer: ReturnType<typeof setTimeout> | null = null;
  const markInteraction = (): void => {
    hasRecentInteraction = true;
    if (interactionTimer) clearTimeout(interactionTimer);
    interactionTimer = setTimeout(() => {
      hasRecentInteraction = false;
    }, INTERACTION_WINDOW_MS);
  };
  for (const type of ['pointerdown', 'keydown', 'touchstart', 'scroll'] as const) {
    document.addEventListener(type, markInteraction, { capture: true, passive: true });
  }

  function isVideoPlaying(): boolean {
    for (const video of document.querySelectorAll('video')) {
      if (!video.paused) return true;
    }
    return false;
  }

  let instagramRoute: InstagramRoute | null = null;
  let youtubeRoute: YoutubeRoute | null = null;

  function getSection(): CurrentSection {
    if (site === 'instagram' && instagramRoute) {
      return { site: 'instagram', section: sectionForInstagramRoute(instagramRoute) };
    }
    if (site === 'youtube' && youtubeRoute) {
      return { site: 'youtube', section: sectionForYoutubeRoute(youtubeRoute) };
    }
    return null;
  }

  startTimeTracker({ hasRecentInteraction: () => hasRecentInteraction, isVideoPlaying, getSection });

  let hasUpdate = false;

  const debugOverlay = createDebugOverlay(host, lang);
  const panel = createPanel(host, {
    getLang: () => lang,
    version: __SMD_VERSION__,
    channel: __SMD_CHANNEL__,
    hasUpdate: () => hasUpdate,
    onSettingsChanged: (next) => {
      pillEnabled = next.pillEnabled;
      lang = detectLang(navigator.language, next.langOverride);
      refreshPill();
    },
    onDebugTap: () => debugOverlay.open(),
  });
  const pill = createPill(host, lang, () => void panel.toggle());

  function refreshPill(): void {
    const pathname = location.pathname;
    const hidden =
      !pillEnabled ||
      shouldHidePill(
        site === 'youtube' ? { site, pathname, isFullscreenVideo: isFullscreenVideo() } : { site, pathname },
      );
    void getDayStats().then((stats) => {
      const minutes = site === 'instagram' ? igMinutes(stats) : ytMinutes(stats);
      pill.update(minutes, hasUpdate, hidden);
    });
  }
  setInterval(refreshPill, PILL_REFRESH_MS);
  refreshPill();

  if (site === 'instagram') {
    startInstagramPlatform((route) => {
      instagramRoute = route;
      refreshPill();
    });
  } else {
    startYoutubePlatform((route) => {
      youtubeRoute = route;
      refreshPill();
    });
  }

  const metaUrl = metaUrlFor(__SMD_CHANNEL__);
  if (settings.updateCheckEnabled && metaUrl) {
    const result = await checkForUpdate({ currentVersion: __SMD_VERSION__, metaUrl });
    hasUpdate = result.hasUpdate;
    refreshPill();
  }

  if (!(await hasSeenWelcome())) {
    showWelcome(host, lang);
  }
}

function main(): void {
  const site = detectSite();
  if (!site) return;
  void bootstrap(site);
}

main();
