#!/usr/bin/env node
// Builds the userscript for one channel (docs/PIANO.md §3.2):
//   --channel=main  -> dist/socialmerd.user.js (+ .meta.js) and, alongside it,
//                      dist/socialmerd.greasyfork.user.js (no updateURL, GF syncs it)
//   --channel=dev   -> dist/socialmerd.user.js (+ .meta.js), version X.Y.Z.<build>
// Always unminified (Greasy Fork requirement).

import * as esbuild from 'esbuild';
import { readFileSync } from 'node:fs';
import { writeFile, mkdir } from 'node:fs/promises';
import { execSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = path.resolve(fileURLToPath(new URL('.', import.meta.url)), '..');
const distDir = path.join(root, 'dist');

const args = process.argv.slice(2);
const watch = args.includes('--watch');
const channelArg = args.find((a) => a.startsWith('--channel='));
const channel = channelArg ? channelArg.split('=')[1] : 'main';

if (channel !== 'main' && channel !== 'dev') {
  console.error(`Unknown --channel "${channel}" (use "main" or "dev")`);
  process.exit(1);
}

const pkg = JSON.parse(readFileSync(path.join(root, 'package.json'), 'utf8'));

/** Compiles src/meta.ts to a throwaway ESM file and imports it, so the build
 * script shares one typed definition of the metadata header with the rest
 * of the codebase instead of duplicating it in plain JS. */
async function loadMetaModule() {
  const result = await esbuild.build({
    entryPoints: [path.join(root, 'src/meta.ts')],
    bundle: false,
    write: false,
    format: 'esm',
    platform: 'node',
    logLevel: 'silent',
  });
  const tmpPath = path.join(root, 'scripts/.meta.generated.mjs');
  await writeFile(tmpPath, result.outputFiles[0].text);
  return import(`${pathToFileURL(tmpPath).href}?t=${Date.now()}`);
}

function buildNumber() {
  // Counts commits touching source paths only, not dist/. A "build dist"
  // commit (this script's own output) must not change this number, or the
  // committed version would never match a rebuild of that same commit
  // (CI's `git diff --exit-code -- dist/` would fail forever).
  try {
    return execSync('git rev-list --count HEAD -- src scripts package.json', {
      cwd: root,
      stdio: ['ignore', 'pipe', 'ignore'],
    })
      .toString()
      .trim();
  } catch {
    return '0'; // no commits yet
  }
}

function resolveVersion(ch) {
  return ch === 'dev' ? `${pkg.version}.${buildNumber()}` : pkg.version;
}

async function bundleCode(version) {
  const result = await esbuild.build({
    entryPoints: [path.join(root, 'src/main.ts')],
    bundle: true,
    write: false,
    format: 'iife',
    target: 'safari16',
    minify: false,
    legalComments: 'none',
    define: {
      __SMD_CHANNEL__: JSON.stringify(channel),
      __SMD_VERSION__: JSON.stringify(version),
    },
  });
  return result.outputFiles[0].text;
}

async function writeVariant(metaModule, ch, code, fileBase) {
  const version = resolveVersion(ch);
  const header = metaModule.renderMetaBlock({ version, channel: ch });
  await mkdir(distDir, { recursive: true });
  await writeFile(path.join(distDir, `${fileBase}.user.js`), `${header}\n${code}`);
  if (ch !== 'greasyfork') {
    await writeFile(path.join(distDir, `${fileBase}.meta.js`), header);
  }
  console.log(`built dist/${fileBase}.user.js (channel=${ch}, version=${version})`);
}

async function buildOnce() {
  const metaModule = await loadMetaModule();
  const code = await bundleCode(resolveVersion(channel));
  await writeVariant(metaModule, channel, code, 'socialmerd');
  if (channel === 'main') {
    await writeVariant(metaModule, 'greasyfork', code, 'socialmerd.greasyfork');
  }
}

async function watchLoop() {
  const ctx = await esbuild.context({
    entryPoints: [path.join(root, 'src/main.ts')],
    bundle: true,
    write: false,
    format: 'iife',
    target: 'safari16',
    minify: false,
    legalComments: 'none',
    define: {
      __SMD_CHANNEL__: JSON.stringify(channel),
      __SMD_VERSION__: JSON.stringify(resolveVersion(channel)),
    },
    plugins: [
      {
        name: 'write-userscript',
        setup(build) {
          build.onEnd(async (result) => {
            if (result.errors.length > 0 || !result.outputFiles) return;
            const metaModule = await loadMetaModule();
            const code = result.outputFiles[0].text;
            await writeVariant(metaModule, channel, code, 'socialmerd');
          });
        },
      },
    ],
  });
  await ctx.watch();
  console.log(`Watching src/ for changes (channel=${channel})...`);
}

if (watch) {
  await watchLoop();
} else {
  await buildOnce();
}
