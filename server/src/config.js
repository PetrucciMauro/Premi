/*
 * Name : Pietro Tollot
 * Module : serverNode
 * Location : server/src/config.js
 *
 */
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const serverRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const config = {
	port: Number(process.env.PORT) || 8081,
	database: process.env.MONGODB_URI || 'mongodb://localhost:27017/premi',
	secret: process.env.JWT_SECRET || 'griever',
	tokenExpiresIn: '24h',
	// cartella in cui vengono salvati i file caricati dagli utenti: files/<utente>/<image|audio|video>
	filesDir: process.env.FILES_DIR || path.join(serverRoot, 'files'),
	// build di produzione del client Angular, servita come sito statico
	clientDir: process.env.CLIENT_DIR || path.join(serverRoot, '..', 'client', 'dist', 'client', 'browser')
};

if (!process.env.JWT_SECRET && process.env.NODE_ENV === 'production')
	console.warn('ATTENZIONE: JWT_SECRET non impostato, viene usato il segreto di sviluppo');

export default config;
