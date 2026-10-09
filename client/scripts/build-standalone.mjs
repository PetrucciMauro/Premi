/*
 * Compila il player autonomo (src/standalone) in un unico JavaScript e un unico CSS
 * minificati e li scrive come stringhe in src/standalone/runtime.generated.ts: l'app li
 * incorpora nei file HTML esportati. Viene eseguito prima di start, build e test.
 */
import { build } from 'esbuild';
import { writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
const options = { absWorkingDir: root, bundle: true, minify: true, write: false, legalComments: 'none', logLevel: 'warning' };

const [js, css] = await Promise.all([
  // browser degli ultimi anni, anche su tablet e smartphone
  build({ ...options, entryPoints: ['src/standalone/player.ts'], format: 'iife', target: 'es2020' }),
  build({ ...options, entryPoints: ['src/standalone/player.css'], target: ['chrome90', 'firefox90', 'safari14'] }),
]);

const text = (result) => result.outputFiles[0].text.trim();
await writeFile(
  new URL('../src/standalone/runtime.generated.ts', import.meta.url),
  '// Generato da scripts/build-standalone.mjs: non modificare.\n' +
    `export const PLAYER_JS = ${JSON.stringify(text(js))};\n` +
    `export const PLAYER_CSS = ${JSON.stringify(text(css))};\n`,
);
console.log(`player autonomo: ${(text(js).length / 1024).toFixed(1)} kB di JS, ${(text(css).length / 1024).toFixed(1)} kB di CSS`);
