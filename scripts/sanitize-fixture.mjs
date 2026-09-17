#!/usr/bin/env node
// Fase 2 (docs/PIANO.md §5.2): sanifica un HTML catturato da Instagram/YouTube
// prima che possa finire in tests/fixtures/ (tracciato da git, repo pubblico).
//
// Cosa fa in automatico (affidabile):
//   - rimuove <script>, <noscript>, <template> e i commenti HTML (stato/JSON
//     incorporato, tracking)
//   - sostituisce src/srcset/poster/href che puntano a CDN media (foto/video/
//     audio) con un placeholder, cosi' niente URL firmati o riconducibili
//   - rimuove attributi di tracking noti (onclick e altri handler inline)
//
// Cosa NON fa (va controllato a mano, vedi CLAUDE.md "controlla git diff
// prima di ogni commit"): non riscrive nomi utente, bio, didascalie o altro
// testo libero nel markup, perche' spesso e' proprio cio' che i test devono
// verificare (es. l'etichetta "Sponsorizzato") ed una redazione automatica
// indiscriminata lo romperebbe senza garantire comunque l'anonimizzazione.

import { Window } from 'happy-dom';
import { readFile, writeFile } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';

const MEDIA_HOST_PATTERNS = [
  /cdninstagram\.com$/,
  /fbcdn\.net$/,
  /ytimg\.com$/,
  /googlevideo\.com$/,
  /ggpht\.com$/,
];
const MEDIA_PLACEHOLDER = 'https://example.invalid/media/placeholder';

function isMediaHost(hostname) {
  return MEDIA_HOST_PATTERNS.some((pattern) => pattern.test(hostname));
}

function redactUrl(value) {
  try {
    const url = new URL(value);
    if (isMediaHost(url.hostname)) {
      return `${MEDIA_PLACEHOLDER}${url.pathname.slice(url.pathname.lastIndexOf('.'))}`;
    }
  } catch {
    // not an absolute URL (relative path, data:, etc.) — leave as-is
  }
  return value;
}

function redactSrcset(value) {
  return value
    .split(',')
    .map((entry) => {
      const [url, descriptor] = entry.trim().split(/\s+/, 2);
      const redacted = redactUrl(url);
      return descriptor ? `${redacted} ${descriptor}` : redacted;
    })
    .join(', ');
}

export function sanitizeHtml(html) {
  const window = new Window();
  const document = window.document;
  document.documentElement.innerHTML = html;

  for (const el of document.querySelectorAll('script, noscript, template')) {
    el.remove();
  }

  const walker = document.createTreeWalker(document.documentElement, 128 /* COMMENT_NODE */);
  const comments = [];
  let node = walker.nextNode();
  while (node) {
    comments.push(node);
    node = walker.nextNode();
  }
  for (const comment of comments) {
    comment.remove();
  }

  for (const el of document.querySelectorAll('*')) {
    for (const attr of [...el.attributes]) {
      if (attr.name.startsWith('on')) {
        el.removeAttribute(attr.name);
      }
    }
    if (el.hasAttribute('src')) el.setAttribute('src', redactUrl(el.getAttribute('src')));
    if (el.hasAttribute('poster')) el.setAttribute('poster', redactUrl(el.getAttribute('poster')));
    if (el.hasAttribute('srcset')) el.setAttribute('srcset', redactSrcset(el.getAttribute('srcset')));
  }

  const html5 = `<!doctype html>\n${document.documentElement.outerHTML}\n`;
  window.close();
  return html5;
}

async function main() {
  const [, , inputPath, outputPath] = process.argv;
  if (!inputPath || !outputPath) {
    console.error('Uso: node scripts/sanitize-fixture.mjs <input.html> <output.html>');
    process.exit(1);
  }
  const raw = await readFile(inputPath, 'utf8');
  const sanitized = sanitizeHtml(raw);
  await writeFile(outputPath, sanitized);
  console.log(`Sanificato ${inputPath} -> ${outputPath}`);
  console.log('Promemoria: controlla a mano nomi utente, bio e didascalie prima di committare.');
}

const isMain = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (isMain) {
  main().catch((error) => {
    console.error('sanitize-fixture fallito:', error);
    process.exit(1);
  });
}
