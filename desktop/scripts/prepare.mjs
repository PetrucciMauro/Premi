/*
 * Prepara il contenuto dell'app desktop da impacchettare: copia in desktop/build il server
 * (sorgenti) e la build del client Angular, che deve essere già stata eseguita
 * ("npm run build" nella cartella principale). Le dipendenze del server sono quelle di
 * desktop/package.json.
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const desktop = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const root = path.resolve(desktop, '..');
const build = path.join(desktop, 'build');
const client = path.join(root, 'client', 'dist', 'client', 'browser');

try {
  await fs.access(path.join(client, 'index.html'));
} catch {
  console.error('Manca la build del client: eseguire prima "npm run build" nella cartella principale.');
  process.exit(1);
}

await fs.rm(build, { recursive: true, force: true });
await fs.mkdir(build, { recursive: true });
await fs.cp(path.join(root, 'server', 'src'), path.join(build, 'server', 'src'), { recursive: true });
// "type": "module" per i sorgenti del server
await fs.writeFile(path.join(build, 'server', 'package.json'), JSON.stringify({ type: 'module' }) + '\n');
await fs.cp(client, path.join(build, 'client'), { recursive: true });
console.log('App desktop pronta in ' + build);
