/*
 * Name : Pietro Tollot
 * Module : serverNode
 * Location : server/src/server.js
 *
 * Server di sviluppo: lo stesso dell'app Electron, su una porta fissa e senza token, da
 * usare con "ng serve" (che inoltra /private/api e /media). I dati sono in server/data.
 */
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { startServer } from './local.js';

const serverRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const { url } = await startServer({
	dataDir: process.env.PREMI_DATA_DIR || path.join(serverRoot, 'data'),
	port: Number(process.env.PORT) || 8081,
	clientDir: process.env.CLIENT_DIR || path.join(serverRoot, '..', 'client', 'dist', 'client', 'browser'),
	logging: true
});

console.log('Server di sviluppo in ascolto su ' + url);
