// First-launch overlay (docs/PIANO.md §4.6/§4.8): what's blocked, plus the
// setup tips from §4.8 (uninstall the native apps, Shortcut icon, Orion as
// default browser, check Tampermonkey). Shown once per install, tracked by
// a GM flag rather than a day-stats key so it survives stats resets.

import { getValue, setValue } from '../gm';
import type { Lang } from '../i18n';
import { t } from '../i18n';
import { injectStyle } from '../styles';
import type { Host } from './host';

const SHOWN_KEY = 'smd:v1:welcomeShown';
const STYLE_ID = 'smd-welcome-style';

const CSS = `
.smd-welcome-backdrop {
  position: fixed;
  inset: 0;
  z-index: 2147483003;
  display: flex;
  align-items: flex-end;
  background: rgba(0, 0, 0, 0.55);
}
.smd-welcome-backdrop[hidden] { display: none; }
.smd-welcome {
  width: 100%;
  max-height: 85vh;
  overflow-y: auto;
  padding: 20px 20px calc(20px + env(safe-area-inset-bottom, 0px));
  border-radius: 16px 16px 0 0;
  background: #1c1c1e;
  color: #fff;
  font: 14px/1.5 -apple-system, system-ui, sans-serif;
}
@media (prefers-color-scheme: light) {
  .smd-welcome { background: #fff; color: #111; }
}
.smd-welcome h2 { margin: 0 0 8px; font-size: 18px; }
.smd-welcome h3 { margin: 16px 0 8px; font-size: 13px; text-transform: uppercase; opacity: 0.6; }
.smd-welcome ul { margin: 0; padding-left: 20px; }
.smd-welcome li { margin-bottom: 6px; }
.smd-welcome-close {
  display: block;
  width: 100%;
  margin-top: 20px;
  padding: 12px;
  border: none;
  border-radius: 10px;
  background: #4da3ff;
  color: #fff;
  font: 600 15px/1 -apple-system, system-ui, sans-serif;
}
`;

export async function hasSeenWelcome(): Promise<boolean> {
  return getValue(SHOWN_KEY, false);
}

export async function markWelcomeSeen(): Promise<void> {
  await setValue(SHOWN_KEY, true);
}

export function showWelcome(host: Host, lang: Lang, onClose?: () => void): void {
  injectStyle(CSS, STYLE_ID);

  const backdrop = document.createElement('div');
  backdrop.className = 'smd-welcome-backdrop';

  const sheet = document.createElement('div');
  sheet.className = 'smd-welcome';
  sheet.setAttribute('role', 'dialog');
  sheet.setAttribute('aria-modal', 'true');

  const title = document.createElement('h2');
  title.textContent = t('welcome.title', lang);

  const intro = document.createElement('p');
  intro.textContent = t('welcome.intro', lang);

  const blockedHeading = document.createElement('h3');
  blockedHeading.textContent = t('welcome.blockedIntro', lang);
  const blockedList = document.createElement('ul');
  for (const key of ['welcome.blockedInstagram', 'welcome.blockedYoutube'] as const) {
    const li = document.createElement('li');
    li.textContent = t(key, lang);
    blockedList.appendChild(li);
  }

  const tipsHeading = document.createElement('h3');
  tipsHeading.textContent = t('welcome.tipsTitle', lang);
  const tipsList = document.createElement('ul');
  for (const key of [
    'welcome.tipUninstall',
    'welcome.tipShortcut',
    'welcome.tipDefaultBrowser',
    'welcome.tipTampermonkey',
  ] as const) {
    const li = document.createElement('li');
    li.textContent = t(key, lang);
    tipsList.appendChild(li);
  }

  const closeButton = document.createElement('button');
  closeButton.type = 'button';
  closeButton.className = 'smd-welcome-close';
  closeButton.textContent = t('welcome.close', lang);
  closeButton.addEventListener('click', () => {
    void markWelcomeSeen();
    backdrop.remove();
    onClose?.();
  });

  sheet.append(title, intro, blockedHeading, blockedList, tipsHeading, tipsList, closeButton);
  backdrop.appendChild(sheet);
  host.mount(backdrop);
}
