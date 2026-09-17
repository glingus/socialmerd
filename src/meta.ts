// Userscript header (metadata block) source of truth. Consumed by scripts/build.mjs.
// Keeping this in TS (instead of a static template) lets the build script share
// one typed definition of the three distribution channels described in
// docs/PIANO.md §3.2.

export type Channel = 'main' | 'dev' | 'greasyfork';

export interface MetaOptions {
  version: string;
  channel: Channel;
}

const REPO = 'glingus/socialmerd';
const RAW_BASE = `https://raw.githubusercontent.com/${REPO}`;

export function renderMetaBlock({ version, channel }: MetaOptions): string {
  const lines: string[] = [
    '// ==UserScript==',
    '// @name         socialmerd',
    `// @namespace    https://github.com/${REPO}`,
    '// @description  Instagram and YouTube without the addictive parts, in Safari on iPhone (via the Stay for Safari app).',
    '// @description:it  Instagram e YouTube senza le parti che creano dipendenza, in Safari su iPhone (tramite l\'app Stay for Safari).',
    `// @version      ${version}`,
    '// @license      GPL-3.0-or-later',
    '// @match        https://www.instagram.com/*',
    '// @match        https://instagram.com/*',
    '// @match        https://m.youtube.com/*',
    '// @match        https://www.youtube.com/*',
    '// @match        https://youtube.com/*',
    '// @run-at       document-start',
    '// @inject-into  content',
    '// @noframes',
    '// @grant        GM.getValue',
    '// @grant        GM.setValue',
    '// @grant        GM.deleteValue',
    '// @grant        GM.listValues',
    '// @grant        GM.xmlHttpRequest',
    '// @connect      raw.githubusercontent.com',
    `// @homepageURL  https://github.com/${REPO}`,
    `// @supportURL   https://github.com/${REPO}/issues`,
  ];

  // Greasy Fork manages its own update checks from the script it hosts;
  // @updateURL/@downloadURL would point back at ourselves incorrectly.
  if (channel !== 'greasyfork') {
    const branch = channel === 'main' ? 'main' : 'dev';
    lines.push(`// @updateURL    ${RAW_BASE}/${branch}/dist/socialmerd.meta.js`);
    lines.push(`// @downloadURL  ${RAW_BASE}/${branch}/dist/socialmerd.user.js`);
  }

  lines.push('// ==/UserScript==', '');
  return lines.join('\n');
}
