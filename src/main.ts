// Fase 1 scaffold entry point: a "hello" debug badge used to verify, on the
// user's iPhone, that (a) the badge shows up on instagram.com and
// m.youtube.com, (b) GM.* storage persists across reloads, and (c) the
// document-start CSS applies before first paint (no flash of unstyled UI).
// This gets replaced by the real core/platform wiring in later phases.

import { detectSite } from './core/env';
import { getValue, setValue } from './core/gm';
import { injectStyle } from './core/styles';

const BADGE_ID = 'smd-hello-badge';
const STYLE_ID = 'smd-hello-style';
const COUNT_KEY = 'smd:v1:hello:count';

injectStyle(
  `
  #${BADGE_ID} {
    position: fixed;
    right: 12px;
    bottom: 12px;
    z-index: 2147483647;
    padding: 6px 10px;
    border-radius: 8px;
    background: #111;
    color: #fff;
    font: 12px/1.4 -apple-system, system-ui, sans-serif;
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.4);
    pointer-events: none;
    opacity: 0.85;
  }
  `,
  STYLE_ID,
);

function renderBadge(site: string, count: number): void {
  let badge = document.getElementById(BADGE_ID);
  if (!badge) {
    badge = document.createElement('div');
    badge.id = BADGE_ID;
    document.documentElement.appendChild(badge);
  }
  badge.textContent = `socialmerd hello · ${site} · ${__SMD_CHANNEL__} · visite: ${count}`;
}

async function main(): Promise<void> {
  const site = detectSite();
  if (!site) return;

  const count = (await getValue(COUNT_KEY, 0)) + 1;
  await setValue(COUNT_KEY, count);

  renderBadge(site, count);
}

void main();
