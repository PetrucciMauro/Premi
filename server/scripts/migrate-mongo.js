/*
 * Migra le presentazioni dalla vecchia versione (MongoDB + cartella files) all'archivio
 * locale (SQLite + media). Le presentazioni di tutti gli utenti finiscono nello stesso
 * archivio: se due utenti hanno lo stesso titolo, al secondo si aggiunge "(utente)".
 *
 *   npm run migrate:mongo -- [--uri mongodb://localhost:27017/premi] [--files server/files] [--data <cartella>]
 *
 * --data è la cartella dei dati: per l'app desktop quella indicata in Premi > Informazioni
 * (su Windows %APPDATA%\Premi), per il server di sviluppo server/data (predefinita).
 * L'app deve essere chiusa durante la migrazione.
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseArgs } from 'node:util';
import { MongoClient } from 'mongodb';
import { MediaStore } from '../src/media.js';
import { Store } from '../src/store.js';

const serverRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const { values } = parseArgs({
	options: {
		uri: { type: 'string', default: process.env.MONGODB_URI || 'mongodb://localhost:27017/premi' },
		files: { type: 'string', default: path.join(serverRoot, 'files') },
		data: { type: 'string', default: path.join(serverRoot, 'data') }
	}
});

const MIME = {
	'.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.gif': 'image/gif', '.webp': 'image/webp', '.svg': 'image/svg+xml',
	'.mp3': 'audio/mpeg', '.ogg': 'audio/ogg', '.wav': 'audio/wav', '.m4a': 'audio/mp4',
	'.mp4': 'video/mp4', '.webm': 'video/webm', '.mov': 'video/quicktime', '.ogv': 'video/ogg'
};

const stripCssUrl = (value) => {
	if (typeof value !== 'string') return value;
	const match = /^url\((['"]?)(.*)\1\)$/.exec(value.trim());
	return match ? match[2] : value.trim();
};

await fs.mkdir(values.data, { recursive: true });
const store = new Store(path.join(values.data, 'premi.db'));
const media = await new MediaStore(path.join(values.data, 'media')).init();
const missing = new Set();

/** Indirizzo di un file della vecchia cartella "files/<utente>/<tipo>/<nome>" → file dell'archivio. */
async function fromFiles(value) {
	const url = stripCssUrl(value);
	if (typeof url !== 'string' || !url.replace(/^\//, '').startsWith('files/'))
		return media.fromDataUrl(url);
	const relative = url.replace(/^\/?files\//, '').split('/').map((part) => {
		try {
			return decodeURIComponent(part);
		} catch {
			return part;
		}
	});
	const file = path.join(values.files, ...relative);
	if (!file.startsWith(path.resolve(values.files))) return url;
	try {
		return await media.save(await fs.readFile(file), MIME[path.extname(file).toLowerCase()] ?? 'application/octet-stream', file);
	} catch {
		missing.add(url);
		return url;
	}
}

async function convert(proper) {
	if (proper.background) proper.background.image = await fromFiles(proper.background.image);
	for (const frame of proper.frames ?? []) frame.ref = await fromFiles(frame.ref);
	for (const collection of ['images', 'audios', 'videos'])
		for (const el of proper[collection] ?? []) el.url = await fromFiles(el.url);
	return proper;
}

const client = new MongoClient(values.uri);
await client.connect();
let migrated = 0;
try {
	const db = client.db();
	const collections = (await db.listCollections().toArray()).map((c) => c.name).filter((name) => name.startsWith('presentations'));
	for (const name of collections) {
		const user = name.slice('presentations'.length) || 'utente';
		for await (const doc of db.collection(name).find()) {
			const base = String(doc.meta?.titolo ?? 'Senza titolo').replace(/\//g, '-');
			let title = base;
			for (let n = 2; store.presentationId(title) !== undefined; n++)
				title = n === 2 ? `${base} (${user})` : `${base} (${user} ${n})`;
			store.create(title, await convert(doc.proper ?? {}));
			migrated++;
			console.log(`✔ ${title}`);
		}
	}
} finally {
	await client.close();
	store.close();
}

console.log(`\n${migrated} presentazioni migrate in ${values.data}`);
if (missing.size)
	console.warn(`${missing.size} file non trovati nella cartella ${values.files}:\n  ` + [...missing].join('\n  '));
