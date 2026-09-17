// Shadow DOM host for the script's own UI (docs/PIANO.md §4.6): a single
// element outside the page's React root, so our styles/markup can't leak
// into the page and vice versa. The pill/panel/welcome/debug-overlay
// features (Fase 6) mount into the returned shadow root.

const HOST_ID = 'smd-ui-host';

export interface Host {
  shadowRoot: ShadowRoot;
  mount(el: HTMLElement): void;
}

/** Idempotent: returns the existing host's shadow root if one was already
 * created (e.g. by an earlier call in the same page lifetime). */
export function getHost(): Host {
  let host = document.getElementById(HOST_ID);
  if (!host) {
    host = document.createElement('div');
    host.id = HOST_ID;
    host.style.all = 'initial';
    (document.body ?? document.documentElement).appendChild(host);
  }
  const shadowRoot = host.shadowRoot ?? host.attachShadow({ mode: 'open' });
  return {
    shadowRoot,
    mount(el: HTMLElement): void {
      shadowRoot.appendChild(el);
    },
  };
}
