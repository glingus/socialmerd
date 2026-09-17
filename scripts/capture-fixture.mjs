#!/usr/bin/env node
// Fase 2 (docs/PIANO.md §5.2): cattura una pagina dal profilo autenticato da
// `npm run e2e:login` (chiudi quella sessione prima di lanciare questo, il
// profilo Chrome non puo' essere aperto due volte) e produce:
//   - tests/fixtures/raw/<name>.html   originale, MAI committato (raw/ in .gitignore)
//   - tests/fixtures/raw/<name>.png    screenshot, MAI committato
//   - tests/fixtures/<name>.html       versione sanificata (vedi sanitize-fixture.mjs)
//
// La versione sanificata rimuove script/JSON e redirige gli URL media, ma
// NON riscrive nomi/testo libero: controlla sempre `git diff` prima di
// committare (regola in CLAUDE.md), e apri lo screenshot raw per decidere se
// e cosa portare a mano nella fixture tracciata.
import { chromium, devices } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { sanitizeHtml } from './sanitize-fixture.mjs';

const root = path.resolve(fileURLToPath(new URL('.', import.meta.url)), '..');
const profileDir = path.join(root, '.auth', 'profile');
const rawDir = path.join(root, 'tests', 'fixtures', 'raw');
const fixturesDir = path.join(root, 'tests', 'fixtures');

function slugify(url) {
  const { pathname, search } = new URL(url);
  const base = `${pathname}${search}`.replace(/[^a-z0-9]+/gi, '-').replace(/^-+|-+$/g, '');
  return base || 'root';
}

async function main() {
  const [, , url, nameArg] = process.argv;
  if (!url) {
    console.error('Uso: npm run fixture:capture -- <url> [nome]');
    process.exit(1);
  }
  const name = nameArg || slugify(url);

  await mkdir(rawDir, { recursive: true });
  await mkdir(fixturesDir, { recursive: true });

  console.log(`Apro ${url} dal profilo autenticato ...`);
  const context = await chromium.launchPersistentContext(profileDir, {
    channel: 'chrome',
    headless: false,
    ...devices['iPhone 15'],
  });

  try {
    const page = await context.newPage();
    await page.goto(url, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2000);

    const html = await page.content();
    const rawHtmlPath = path.join(rawDir, `${name}.html`);
    await writeFile(rawHtmlPath, html);

    const rawPngPath = path.join(rawDir, `${name}.png`);
    await page.screenshot({ path: rawPngPath, fullPage: true });

    const sanitized = sanitizeHtml(html);
    const sanitizedPath = path.join(fixturesDir, `${name}.html`);
    await writeFile(sanitizedPath, sanitized);

    console.log(`Raw (non committare):     tests/fixtures/raw/${name}.html, tests/fixtures/raw/${name}.png`);
    console.log(`Sanificato (tracciato):   tests/fixtures/${name}.html`);
    console.log('Controlla a mano il file sanificato (nomi, bio, didascalie) prima di "git add".');
  } finally {
    await context.close();
  }
}

main().catch((error) => {
  console.error('fixture:capture fallito:', error);
  process.exit(1);
});
