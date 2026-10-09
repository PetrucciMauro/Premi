/*
 * Avvio del server locale: apre il database SQLite e l'archivio dei media nella cartella
 * dei dati, elimina i media non più usati e si mette in ascolto su 127.0.0.1.
 * Lo usano l'app Electron (porta casuale, token di sessione) e il server di sviluppo.
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import { createApp } from './app.js';
import { MediaStore } from './media.js';
import { Store } from './store.js';

/**
 * @param {object} options
 * @param {string} options.dataDir cartella con il database (premi.db) e i media
 * @param {number} [options.port] 0 per una porta libera qualsiasi
 * @param {string} [options.token]
 * @param {string} [options.clientDir]
 * @param {boolean} [options.logging]
 * @returns {Promise<{ url: string, store: Store, close: () => Promise<void> }>}
 */
export async function startServer({ dataDir, port = 0, token, clientDir, logging = false }) {
	await fs.mkdir(dataDir, { recursive: true });
	const store = new Store(path.join(dataDir, 'premi.db'));
	const media = await new MediaStore(path.join(dataDir, 'media')).init();

	// all'avvio nessuna modifica è in corso: i file non citati da nessuna presentazione si possono eliminare
	const removed = await media.collectGarbage(store.contents());
	if (removed && logging)
		console.log(`Eliminati ${removed} file multimediali non più usati`);

	const app = createApp({ store, media, token, clientDir, logging });
	const server = await new Promise((resolve, reject) => {
		const listening = app.listen(port, '127.0.0.1', () => resolve(listening)).on('error', reject);
	});

	return {
		url: `http://127.0.0.1:${server.address().port}`,
		store,
		close: () =>
			new Promise((resolve) => {
				server.closeAllConnections?.();
				server.close(() => {
					store.close();
					resolve();
				});
			}),
	};
}
