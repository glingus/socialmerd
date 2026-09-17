#!/usr/bin/env node
// Fase 2 (docs/PIANO.md §5.2): apre Chrome (canale "chrome", gia' installato
// sulla macchina, nessun download di browser Playwright) con l'emulazione
// devices['iPhone 15'] e un profilo persistente in .auth/ (ignorato da git).
//
// Questo script NON deve mai leggere, digitare o memorizzare credenziali:
// apre solo le pagine di login, poi resta in attesa finche' l'utente non ha
// fatto login a mano in ciascuna scheda e preme Ctrl+C per chiudere.
import { chromium, devices } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(fileURLToPath(new URL('.', import.meta.url)), '..');
const profileDir = path.join(root, '.auth', 'profile');

const SITES = {
  instagram: 'https://www.instagram.com/',
  youtube: 'https://m.youtube.com/',
};

async function main() {
  console.log('Apro Chrome con profilo persistente in .auth/profile ...');
  console.log('Fai login a mano in ciascuna scheda (Instagram e YouTube).');
  console.log('Quando hai finito, torna qui e premi Ctrl+C per chiudere.\n');

  const context = await chromium.launchPersistentContext(profileDir, {
    channel: 'chrome',
    headless: false,
    ...devices['iPhone 15'],
  });

  for (const url of Object.values(SITES)) {
    const page = context.pages()[0]?.url() === 'about:blank' ? context.pages()[0] : await context.newPage();
    await page.goto(url, { waitUntil: 'domcontentloaded' });
  }

  const closeAndExit = async () => {
    console.log('\nChiudo il profilo...');
    await context.close();
    process.exit(0);
  };
  process.on('SIGINT', closeAndExit);
  process.on('SIGTERM', closeAndExit);

  // Resta in attesa finche' l'utente non interrompe con Ctrl+C.
  await new Promise(() => {});
}

main().catch((error) => {
  console.error('e2e:login fallito:', error);
  process.exit(1);
});
