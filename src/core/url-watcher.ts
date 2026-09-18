// Detects URL changes in the content world, where we can't hook the page's
// own history.pushState/fetch (docs/PIANO.md §3.4): polling every 250ms,
// plus popstate and the Navigation API's currententrychange as fast paths
// when available.

interface NavigationLike {
  addEventListener(type: 'currententrychange', listener: () => void): void;
  removeEventListener(type: 'currententrychange', listener: () => void): void;
}

function getNavigation(): NavigationLike | undefined {
  return (window as unknown as { navigation?: NavigationLike }).navigation;
}

export interface UrlWatcherOptions {
  intervalMs?: number;
}

export function watchUrl(onChange: (url: string) => void, options: UrlWatcherOptions = {}): () => void {
  // 100ms (down from an original 250ms): found live 2026-09-18 that
  // Instagram's own tab-bar navigation uses pushState (no 'popstate'), and
  // the Navigation API fast path above isn't reliably available on iOS/
  // Orion (spike point q, still unconfirmed) -- so polling was the only
  // signal catching some in-app navigations, and 250ms was a long enough
  // window for unblocked content to visibly flash before route-guard.ts
  // reacted. Still a poll, not a true hook (docs/PIANO.md §3.4).
  const intervalMs = options.intervalMs ?? 100;
  let lastUrl = location.href;

  const check = (): void => {
    if (location.href !== lastUrl) {
      lastUrl = location.href;
      onChange(lastUrl);
    }
  };

  const timer = setInterval(check, intervalMs);
  window.addEventListener('popstate', check, true);
  const navigation = getNavigation();
  navigation?.addEventListener('currententrychange', check);

  return () => {
    clearInterval(timer);
    window.removeEventListener('popstate', check, true);
    navigation?.removeEventListener('currententrychange', check);
  };
}
